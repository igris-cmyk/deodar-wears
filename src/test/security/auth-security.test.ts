import { describe, expect, it } from "vitest";

import { hashSensitiveKey } from "@/infrastructure/logging/redaction";
import { hasLikelySessionCookie, isTrustedOrigin } from "@/modules/auth/security";

describe("Phase 1 security contracts", () => {
  it("does not expose raw email in rate-limit keys when hashed", () => {
    expect(hashSensitiveKey("person@example.com")).not.toContain("person@example.com");
  });

  it("validates trusted origins exactly", () => {
    expect(isTrustedOrigin("https://deodarwears.com", ["https://deodarwears.com"])).toBe(
      true,
    );
    expect(
      isTrustedOrigin("https://evil.deodarwears.com", ["https://deodarwears.com"]),
    ).toBe(false);
  });

  it("detects Better Auth session cookies for coarse route protection", () => {
    expect(hasLikelySessionCookie("better-auth.session_token=value")).toBe(true);
    expect(hasLikelySessionCookie("other=value")).toBe(false);
  });
});
