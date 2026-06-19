import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

const requireDatabase =
  process.env.REQUIRE_DATABASE_TESTS === "true" ||
  process.env.CI === "true" ||
  process.env.APP_ENV === "staging" ||
  process.env.APP_ENV === "production";

if (!process.env.TEST_DATABASE_URL) {
  const message =
    "TEST_DATABASE_URL is not set; migration rehearsal cannot run against PostgreSQL.";

  if (requireDatabase) {
    console.error(`${message} Set TEST_DATABASE_URL or unset required DB mode.`);
    process.exit(1);
  }

  console.warn(`${message} Skipping optional local rehearsal.`);
  process.exit(0);
}

const prismaCli = require.resolve("prisma/build/index.js");

execFileSync(process.execPath, [prismaCli, "migrate", "deploy"], {
  stdio: "inherit",
  env: {
    ...process.env,
    DATABASE_URL: process.env.TEST_DATABASE_URL,
    DIRECT_URL: process.env.TEST_DIRECT_URL ?? process.env.TEST_DATABASE_URL,
    APP_ENV: "test",
  },
});
