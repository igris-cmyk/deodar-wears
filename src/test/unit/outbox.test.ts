import { describe, expect, it } from "vitest";

import { domainEventSchema } from "@/infrastructure/outbox/schema";

describe("outbox event schema", () => {
  it("validates platform events", () => {
    const parsed = domainEventSchema.parse({
      eventId: "11111111-1111-4111-8111-111111111111",
      eventType: "platform/health-check.requested.v1",
      schemaVersion: 1,
      aggregateType: "platform",
      aggregateId: "phase-0",
      occurredAt: "2026-06-17T00:00:00.000Z",
      correlationId: "trace-12345678",
      payload: { requestedAt: "2026-06-17T00:00:00.000Z" },
    });

    expect(parsed.eventType).toBe("platform/health-check.requested.v1");
  });
});
