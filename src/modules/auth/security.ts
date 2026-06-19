export function isTrustedOrigin(
  origin: string | null,
  trustedOrigins: readonly string[],
): boolean {
  if (!origin) return false;

  return trustedOrigins.includes(origin);
}

export function hasLikelySessionCookie(cookieHeader: string | null): boolean {
  if (!cookieHeader) return false;

  return /better-auth.*session|session.*better-auth/i.test(cookieHeader);
}
