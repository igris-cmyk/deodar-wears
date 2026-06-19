import { describe, expect, it } from "vitest";

import { createRequestContext } from "@/infrastructure/request/context";

describe("request context", () => {
  it("generates request and correlation IDs", () => {
    const context = createRequestContext({ environment: "test" });

    expect(context.requestId).toHaveLength(36);
    expect(context.correlationId).toBe(context.requestId);
  });

  it("propagates safe correlation IDs", () => {
    const headers = new Headers({ "x-correlation-id": "trace-12345678" });
    const context = createRequestContext({ headers, environment: "test" });

    expect(context.correlationId).toBe("trace-12345678");
  });

  it("rejects unsafe correlation IDs", () => {
    const headers = new Headers({ "x-correlation-id": "bad value with spaces" });
    const context = createRequestContext({ headers, environment: "test" });

    expect(context.correlationId).toBe(context.requestId);
  });
});
