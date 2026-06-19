import { describe, expect, it } from "vitest";

import { rejectUnsafeAuditPayload } from "@/modules/audit/audit.service";

describe("Phase 1 audit safety", () => {
  it("rejects unsafe sensitive payloads", () => {
    expect(() => rejectUnsafeAuditPayload({ password: "secret" })).toThrow(
      expect.objectContaining({ code: "VALIDATION_FAILED" }),
    );
  });

  it("allows minimal before and after diffs", () => {
    expect(() =>
      rejectUnsafeAuditPayload({
        before: { role: "ANALYST" },
        after: { role: "SUPPORT_AGENT" },
      }),
    ).not.toThrow();
  });
});
