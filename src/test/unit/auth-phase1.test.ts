import { describe, expect, it } from "vitest";

import { resolvePermissionUnion } from "@/modules/admin/permissions";
import { generateRecoveryCodes, hashRecoveryCode } from "@/modules/admin/mfa";
import {
  isSafeReturnPath,
  mfaCodeSchema,
  normalizeEmail,
  recoveryCodeSchema,
  registerSchema,
} from "@/modules/auth/auth.schemas";
import {
  requireAdmin,
  requireFreshSession,
  requireMfa,
  requirePermission,
  type AuthenticatedAdmin,
} from "@/modules/auth/authorization";

function admin(overrides: Partial<AuthenticatedAdmin> = {}): AuthenticatedAdmin {
  return {
    type: "ADMIN",
    userId: "user-1",
    adminMembershipId: "admin-1",
    sessionId: "session-1",
    permissions: new Set(["admin.access"]),
    mfaVerifiedAt: new Date(),
    sessionFreshUntil: new Date(Date.now() + 60_000),
    active: true,
    requiresMfa: true,
    ...overrides,
  };
}

describe("Phase 1 authentication validation", () => {
  it("normalizes email without provider-specific alias rules", () => {
    expect(normalizeEmail("  Person.Name@Example.COM ")).toBe("person.name@example.com");
  });

  it("rejects unsafe return paths", () => {
    expect(isSafeReturnPath("/account/security")).toBe(true);
    expect(isSafeReturnPath("//attacker.example")).toBe(false);
    expect(isSafeReturnPath("https://attacker.example")).toBe(false);
    expect(isSafeReturnPath("javascript:alert(1)")).toBe(false);
  });

  it("enforces password length and confirmation", () => {
    expect(() =>
      registerSchema.parse({
        name: "A",
        email: "a@example.com",
        password: "short",
        confirmPassword: "different",
        termsAccepted: true,
      }),
    ).toThrow();
  });

  it("validates MFA and recovery code formats", () => {
    expect(mfaCodeSchema.parse("123456")).toBe("123456");
    expect(() => mfaCodeSchema.parse("12345a")).toThrow();
    expect(recoveryCodeSchema.parse("ABCD-1234-WXYZ")).toBe("ABCD-1234-WXYZ");
  });
});

describe("Phase 1 authorization", () => {
  it("unions permissions from multiple roles", () => {
    const permissions = resolvePermissionUnion(["SUPPORT_AGENT", "ANALYST"]);

    expect(permissions.has("support.respond")).toBe(true);
    expect(permissions.has("analytics.read")).toBe(true);
    expect(permissions.has("customer.read_sensitive")).toBe(false);
  });

  it("denies inactive admin membership", () => {
    expect(() => requireAdmin(admin({ active: false }))).toThrow(
      expect.objectContaining({ code: "ADMIN_MEMBERSHIP_INACTIVE" }),
    );
  });

  it("requires MFA and fresh sessions", () => {
    expect(() => requireMfa(admin({ mfaVerifiedAt: null }))).toThrow(
      expect.objectContaining({ code: "MFA_REQUIRED" }),
    );
    expect(() => requireFreshSession(admin({ sessionFreshUntil: new Date(0) }))).toThrow(
      expect.objectContaining({ code: "SESSION_NOT_FRESH" }),
    );
  });

  it("checks permissions at server boundary", () => {
    expect(() => requirePermission(admin(), "admin.manage_roles")).toThrow(
      expect.objectContaining({ code: "PERMISSION_DENIED" }),
    );
  });

  it("hashes recovery codes and generates one-time-code shaped values", () => {
    const code = generateRecoveryCodes(1)[0];

    expect(code).toBeDefined();

    const recoveryCode = code ?? "";

    expect(recoveryCode).toMatch(/^[A-F0-9]{4}-[A-F0-9]{4}-[A-F0-9]{4}$/);
    expect(hashRecoveryCode(recoveryCode)).toBe(
      hashRecoveryCode(recoveryCode.toLowerCase()),
    );
    expect(hashRecoveryCode(recoveryCode)).not.toContain(recoveryCode);
  });
});
