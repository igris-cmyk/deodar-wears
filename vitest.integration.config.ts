import { config as loadDotenv } from "dotenv";
import baseConfig from "./vitest.config";
import { defineConfig, mergeConfig } from "vitest/config";

loadDotenv({ path: ".env" });

if (process.env.TEST_DATABASE_URL) {
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
}

if (process.env.TEST_DIRECT_URL) {
  process.env.DIRECT_URL = process.env.TEST_DIRECT_URL;
}

export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      environment: "node",
      setupFiles: ["./src/test/integration/setup.ts"],
      testTimeout: 30_000,
    },
  }),
);
