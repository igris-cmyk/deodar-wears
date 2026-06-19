import { describe, expect, it } from "vitest";

import nextConfig from "../../../next.config";
import { sanitizedHealthResponse } from "@/infrastructure/security/http";

describe("security baseline", () => {
  it("sanitizes health responses", () => {
    expect(
      JSON.stringify(
        sanitizedHealthResponse({ status: "error", checks: { database: "error" } }),
      ),
    ).not.toMatch(/postgres|DATABASE_URL|password/i);
  });

  it("defines security headers and CSP report-only", async () => {
    expect(typeof nextConfig.headers).toBe("function");
    const headers = await nextConfig.headers?.();
    if (!headers) {
      throw new Error("Next headers configuration was not available.");
    }
    const values = headers.flatMap((entry) => entry.headers.map((header) => header.key));

    expect(values).toContain("Content-Security-Policy-Report-Only");
    expect(values).toContain("X-Content-Type-Options");
    expect(values).toContain("Referrer-Policy");
  });
});
