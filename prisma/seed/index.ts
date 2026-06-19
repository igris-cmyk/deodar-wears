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

  for (const permissionCode of permissionCodes) {
    await prisma.adminPermission.upsert({
      where: { code: permissionCode },
      update: {
        description: `Allows ${permissionCode.replaceAll(".", " ")} operations.`,
      },
      create: {
        code: permissionCode,
        description: `Allows ${permissionCode.replaceAll(".", " ")} operations.`,
      },
    });
  }

  for (const [roleCode, definition] of Object.entries(roleDefinitions) as [
    RoleCode,
    (typeof roleDefinitions)[RoleCode],
  ][]) {
    const role = await prisma.adminRole.upsert({
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
    });

    for (const permissionCode of rolePermissionMapping[roleCode]) {
      const permission = await prisma.adminPermission.findUniqueOrThrow({
        where: { code: permissionCode },
      });

      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: role.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: role.id,
          permissionId: permission.id,
        },
      });
    }
  }
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
