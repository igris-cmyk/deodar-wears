import { describe, expect, it } from "vitest";

import { hashSensitiveKey, redactValue } from "@/infrastructure/logging/redaction";

describe("logging redaction", () => {
  it("redacts configured sensitive fields", () => {
    expect(
      redactValue({
        nested: {
          databaseUrl: "postgresql://secret",
          token: "secret-token",
          safe: "visible",
        },
      }),
    ).toEqual({
      nested: {
        databaseUrl: "[REDACTED]",
        token: "[REDACTED]",
        safe: "visible",
      },
    });
  });

  it("hashes sensitive rate-limit keys deterministically", () => {
    expect(hashSensitiveKey("email@example.com")).toBe(
      hashSensitiveKey("email@example.com"),
    );
    expect(hashSensitiveKey("email@example.com")).not.toContain("email");
  });
});
