import { describe, expect, it } from "vitest";

import { prisma } from "@/infrastructure/database/prisma";

const requireDatabase =
  process.env.REQUIRE_DATABASE_TESTS === "true" ||
  process.env.CI === "true" ||
  process.env.APP_ENV === "staging" ||
  process.env.APP_ENV === "production";
const hasDatabase = Boolean(process.env.TEST_DATABASE_URL);

if (requireDatabase && !hasDatabase) {
  throw new Error("TEST_DATABASE_URL is required for PostgreSQL integration tests.");
}

const describeIfDatabase = hasDatabase ? describe : describe.skip;

describeIfDatabase("postgres integration", () => {
  it("connects through Prisma and reads system metadata", async () => {
    const result = await prisma.$queryRaw<Array<{ ok: number }>>`SELECT 1 as ok`;

    expect(result[0]?.ok).toBe(1);
  });

  it("rolls back transaction work", async () => {
    await expect(
      prisma.$transaction(async (transaction) => {
        await transaction.systemMetadata.create({
          data: { key: "rollback-test", value: { ok: true } },
        });
        throw new Error("rollback");
      }),
    ).rejects.toThrow("rollback");

    await expect(
      prisma.systemMetadata.findUnique({ where: { key: "rollback-test" } }),
    ).resolves.toBeNull();
  });
});
