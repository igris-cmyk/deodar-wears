import { describe, expect, it } from "vitest";

import { parsePublicEnv } from "@/config/public-env";
import { parseServerEnv } from "@/config/env";

const validEnv = {
  NODE_ENV: "test",
  APP_ENV: "test",
  APP_URL: "http://localhost:3000",
  DATABASE_URL: "postgresql://user:pass@localhost:5432/deodar_test",
  DIRECT_URL: "postgresql://user:pass@localhost:5432/deodar_test",
};

describe("environment validation", () => {
  it("accepts valid server values", () => {
    expect(parseServerEnv(validEnv).APP_ENV).toBe("test");
  });

  it("rejects missing required values", () => {
    expect(() => parseServerEnv({ APP_ENV: "test" })).toThrow();
  });

  it("excludes server secrets from public schema", () => {
    const parsed = parsePublicEnv({
      NEXT_PUBLIC_APP_ENV: "test",
      DATABASE_URL: "postgresql://secret",
    });

    expect(parsed).toEqual({ NEXT_PUBLIC_APP_ENV: "test" });
  });
});
