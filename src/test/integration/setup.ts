import { beforeAll } from "vitest";

const requireDatabase =
  process.env.REQUIRE_DATABASE_TESTS === "true" ||
  process.env.CI === "true" ||
  process.env.APP_ENV === "staging" ||
  process.env.APP_ENV === "production";
const missingDatabaseUrl = !process.env.TEST_DATABASE_URL;

if (missingDatabaseUrl && !requireDatabase) {
  process.stderr.write(
    "PASS COMMAND / REQUIRED TESTS SKIPPED - TEST_DATABASE_URL is missing; PostgreSQL integration tests did not execute.\n",
  );
}

beforeAll(() => {
  if (missingDatabaseUrl) {
    if (requireDatabase) {
      throw new Error(
        "TEST_DATABASE_URL is required for database integration tests in required DB mode.",
      );
    }

    process.env.SKIP_DATABASE_INTEGRATION = "true";
    return;
  }

  process.env.DATABASE_URL ??= process.env.TEST_DATABASE_URL;
  process.env.DIRECT_URL ??= process.env.TEST_DIRECT_URL ?? process.env.TEST_DATABASE_URL;
  process.env.APP_ENV ??= "test";
});
