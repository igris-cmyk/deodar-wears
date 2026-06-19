import { randomUUID } from "node:crypto";

import { describe, expect, it } from "vitest";

import { prisma } from "@/infrastructure/database/prisma";
import { writeAuditLog } from "@/modules/audit/audit.service";
import { bootstrapSuperAdmin } from "@/modules/admin/bootstrap";
import {
  permissionCodes,
  roleDefinitions,
  rolePermissionMapping,
} from "@/modules/admin/permissions";

import { seedDatabase } from "../../../prisma/seed/index";

const requireDatabase =
  process.env.REQUIRE_DATABASE_TESTS === "true" ||
  process.env.CI === "true" ||
  process.env.APP_ENV === "staging" ||
  process.env.APP_ENV === "production";
const hasDatabase = Boolean(process.env.TEST_DATABASE_URL);

if (requireDatabase && !hasDatabase) {
  throw new Error("TEST_DATABASE_URL is required for identity/admin integration tests.");
}

const describeIfDatabase = hasDatabase ? describe : describe.skip;

describeIfDatabase("identity and admin database contracts", () => {
  it("seeds roles and permissions idempotently", async () => {
    await seedDatabase(prisma);
    await seedDatabase(prisma);

    await expect(prisma.adminPermission.count()).resolves.toBe(permissionCodes.length);
    await expect(prisma.adminRole.count()).resolves.toBe(
      Object.keys(roleDefinitions).length,
    );

    const superAdmin = await prisma.adminRole.findUniqueOrThrow({
      where: { code: "SUPER_ADMIN" },
      include: { permissions: { include: { permission: true } } },
    });

    expect(new Set(superAdmin.permissions.map((entry) => entry.permission.code))).toEqual(
      new Set(rolePermissionMapping.SUPER_ADMIN),
    );
  });

  it("bootstraps a verified user as super admin idempotently and audits it", async () => {
    await seedDatabase(prisma);

    const email = `admin-${randomUUID()}@example.com`;
    const user = await prisma.user.create({
      data: {
        email,
        name: "Integration Admin",
        emailVerified: true,
      },
    });

    const firstMembership = await bootstrapSuperAdmin({
      email,
      requestId: `test-${randomUUID()}`,
      reason: "integration bootstrap proof",
    });
    const secondMembership = await bootstrapSuperAdmin({
      email,
      requestId: `test-${randomUUID()}`,
      reason: "integration bootstrap proof repeat",
    });

    expect(secondMembership.id).toBe(firstMembership.id);

    const membershipRoleCount = await prisma.adminMembershipRole.count({
      where: { adminMembershipId: firstMembership.id },
    });
    expect(membershipRoleCount).toBe(1);

    await expect(
      prisma.auditLog.count({
        where: {
          actorType: "SYSTEM",
          action: "ADMIN_BOOTSTRAPPED",
          entityType: "AdminMembership",
          entityId: firstMembership.id,
        },
      }),
    ).resolves.toBe(2);

    await expect(
      prisma.adminMembership.findUniqueOrThrow({
        where: { userId: user.id },
        include: { roles: { include: { role: true } } },
      }),
    ).resolves.toMatchObject({
      active: true,
      requiresMfa: true,
      roles: [{ role: { code: "SUPER_ADMIN" } }],
    });
  });

  it("persists audit logs as append-only records", async () => {
    const audit = await writeAuditLog({
      actorType: "SYSTEM",
      action: "ADMIN_ROLE_ASSIGNED",
      entityType: "AdminMembership",
      entityId: randomUUID(),
      requestId: `test-${randomUUID()}`,
      reason: "append-only proof",
      afterData: { role: "ANALYST" },
    });

    await expect(
      prisma.auditLog.update({
        where: { id: audit.id },
        data: { reason: "mutated" },
      }),
    ).rejects.toThrow();
    await expect(prisma.auditLog.delete({ where: { id: audit.id } })).rejects.toThrow();
  });
});
