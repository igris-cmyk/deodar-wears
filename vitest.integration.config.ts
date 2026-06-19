import baseConfig from "./vitest.config";
import { defineConfig, mergeConfig } from "vitest/config";

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
