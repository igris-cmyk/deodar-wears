import "server-only";

import { inngest } from "@/infrastructure/jobs/inngest";
import { logger } from "@/infrastructure/logging/logger";

import { prisma } from "../database/prisma";
import { claimPendingOutboxEvents } from "./repository";

export async function dispatchOutboxBatch(batchSize = 25): Promise<number> {
  const events = await claimPendingOutboxEvents({ batchSize });
  let dispatched = 0;

  for (const event of events) {
    try {
      await inngest.send({
        name: event.eventType,
        data: event.payload as Record<string, unknown>,
        id: event.id,
      });

      await prisma.outboxEvent.update({
        where: { id: event.id },
        data: { dispatchedAt: new Date(), lockedAt: null, lockOwner: null },
      });
      dispatched += 1;
    } catch (error) {
      logger.error({ event: "outbox.dispatch.failed", error, outboxEventId: event.id });
      await prisma.outboxEvent.update({
        where: { id: event.id },
        data: {
          attempts: { increment: 1 },
          lastError: error instanceof Error ? error.message : "Unknown dispatch failure",
          lockedAt: null,
          lockOwner: null,
        },
      });
    }
  }

  return dispatched;
}
