import "dotenv/config";

import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

const requireDatabase =
  process.env.REQUIRE_DATABASE_TESTS === "true" ||
  process.env.CI === "true" ||
  process.env.APP_ENV === "staging" ||
  process.env.APP_ENV === "production";

const testDatabaseUrl = process.env.TEST_DATABASE_URL;
const testDirectUrl = process.env.TEST_DIRECT_URL;

if (!testDatabaseUrl || !testDirectUrl) {
  const message =
    "TEST_DATABASE_URL and TEST_DIRECT_URL are required for migration tests.";

  if (requireDatabase) {
    console.error(message);
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
    DATABASE_URL: testDatabaseUrl,
    DIRECT_URL: testDirectUrl,
    APP_ENV: "test",
  },
});
