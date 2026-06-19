import { z } from "zod";

import { inngest } from "./inngest";
import { logger } from "../logging/logger";

const healthPayloadSchema = z.object({
  requestedAt: z.iso.datetime(),
  correlationId: z.string().min(1),
});

export const platformHealthCheckFunction = inngest.createFunction(
  {
    id: "platform-health-check",
    triggers: [{ event: "platform/health-check.requested.v1" }],
  },
  async ({ event }) => {
    const payload = healthPayloadSchema.parse(event.data);
    logger.info({
      event: "jobs.platform_health.received",
      correlationId: payload.correlationId,
    });

    return {
      ok: true,
      correlationId: payload.correlationId,
    };
  },
);
