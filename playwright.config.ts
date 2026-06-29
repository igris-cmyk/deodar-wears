import { defineConfig, devices } from "@playwright/test";
import { config as loadDotenv } from "dotenv";

loadDotenv({ path: ".env" });

const testDatabaseUrl = process.env.TEST_DATABASE_URL;
const testDirectUrl = process.env.TEST_DIRECT_URL;

if (!testDatabaseUrl || !testDirectUrl) {
  throw new Error("TEST_DATABASE_URL and TEST_DIRECT_URL are required for E2E tests.");
}

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3100";

export default defineConfig({
  testDir: "./src/test/e2e",
  timeout: 60_000,
  fullyParallel: true,
  use: {
    baseURL,
    trace: "retain-on-failure",
  },
  webServer: {
    command: `${JSON.stringify(
      process.execPath,
    )} node_modules/next/dist/bin/next dev --hostname 127.0.0.1 --port 3100`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
    env: {
      DATABASE_URL: testDatabaseUrl,
      DIRECT_URL: testDirectUrl,
      APP_ENV: "test",
    },
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile",
      use: { ...devices["Pixel 7"] },
    },
    {
      name: "accessibility",
      use: { ...devices["Desktop Chrome"] },
      testMatch: /.*\.accessibility\.spec\.ts/,
    },
  ],
});
