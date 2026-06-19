const sensitiveKeyPattern =
  /password|secret|token|cookie|authorization|databaseurl|database_url|directurl|direct_url|api_key|apikey|webhook/i;

export function redactValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((entry) => redactValue(entry));
  }

  if (value && typeof value === "object") {
    const redacted: Record<string, unknown> = {};

    for (const [key, nestedValue] of Object.entries(value)) {
      redacted[key] = sensitiveKeyPattern.test(key)
        ? "[REDACTED]"
        : redactValue(nestedValue);
    }

    return redacted;
  }

  return value;
}

export function hashSensitiveKey(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let hash = 0x811c9dc5;

  for (const byte of bytes) {
    hash ^= byte;
    hash = Math.imul(hash, 0x01000193);
  }

  return `h_${(hash >>> 0).toString(16).padStart(8, "0")}`;
}
