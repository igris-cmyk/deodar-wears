import "dotenv/config";
import { fileURLToPath } from "node:url";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

import { assertNonProductionDatabase } from "../../src/infrastructure/database/safety";
import {
  permissionCodes,
  roleDefinitions,
  rolePermissionMapping,
  type RoleCode,
} from "../../src/modules/admin/permissions";

type SeedClient = Pick<
  PrismaClient,
  "systemMetadata" | "adminPermission" | "adminRole" | "rolePermission"
>;

export async function seedDatabase(prisma: SeedClient) {
  const appEnv = process.env.APP_ENV ?? "local";
  const databaseUrl = process.env.DATABASE_URL ?? "";

  assertNonProductionDatabase({ appEnv, databaseUrl });

  await prisma.systemMetadata.upsert({
    where: { key: "platform.phase" },
    update: {
      value: {
        product: "Deodar Wears",
        phase: "0",
        seededAt: new Date("2026-06-17T00:00:00.000Z").toISOString(),
      },
    },
    create: {
      key: "platform.phase",
      value: {
        product: "Deodar Wears",
        phase: "0",
        seededAt: new Date("2026-06-17T00:00:00.000Z").toISOString(),
      },
    },
  });

  const permissions = await Promise.all(
    permissionCodes.map((permissionCode) =>
      prisma.adminPermission.upsert({
        where: { code: permissionCode },
        update: {
          description: `Allows ${permissionCode.replaceAll(".", " ")} operations.`,
        },
        create: {
          code: permissionCode,
          description: `Allows ${permissionCode.replaceAll(".", " ")} operations.`,
        },
        select: {
          id: true,
          code: true,
        },
      }),
    ),
  );

  const roleEntries = Object.entries(roleDefinitions) as [
    RoleCode,
    (typeof roleDefinitions)[RoleCode],
  ][];

  const roles = await Promise.all(
    roleEntries.map(([roleCode, definition]) =>
      prisma.adminRole.upsert({
        where: { code: roleCode },
        update: {
          name: definition.name,
          description: definition.description,
          systemRole: true,
        },
        create: {
          code: roleCode,
          name: definition.name,
          description: definition.description,
          systemRole: true,
        },
        select: {
          id: true,
          code: true,
        },
      }),
    ),
  );

  const permissionIdByCode = new Map(
    permissions.map((permission) => [permission.code, permission.id]),
  );

  const roleIdByCode = new Map(roles.map((role) => [role.code, role.id]));

  const rolePermissions = roleEntries.flatMap(([roleCode]) => {
    const roleId = roleIdByCode.get(roleCode);

    if (!roleId) {
      throw new Error(`Seeded role could not be resolved: ${roleCode}`);
    }

    return rolePermissionMapping[roleCode].map((permissionCode) => {
      const permissionId = permissionIdByCode.get(permissionCode);

      if (!permissionId) {
        throw new Error(`Seeded permission could not be resolved: ${permissionCode}`);
      }

      return {
        roleId,
        permissionId,
      };
    });
  });

  await prisma.rolePermission.createMany({
    data: rolePermissions,
    skipDuplicates: true,
  });
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL ?? "";

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required to run the Prisma seed.");
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({
      connectionString: databaseUrl,
    }),
  });

  await seedDatabase(prisma).finally(async () => {
    await prisma.$disconnect();
  });
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  await main().catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
}
