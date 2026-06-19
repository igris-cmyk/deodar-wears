import "server-only";

import { randomUUID } from "node:crypto";

import type { Prisma } from "@prisma/client";

import { domainEventSchema, type DomainEvent } from "./schema";
import { type PrismaTransactionClient, prisma } from "../database/prisma";

export async function appendOutboxEvent<T>(
  event: DomainEvent<T>,
  transaction: PrismaTransactionClient = prisma,
) {
  const parsed = domainEventSchema.parse(event);

  return transaction.outboxEvent.create({
    data: {
      id: parsed.eventId,
      eventType: parsed.eventType,
      aggregateType: parsed.aggregateType,
      aggregateId: parsed.aggregateId,
      payload: parsed.payload as Prisma.InputJsonValue,
      schemaVersion: parsed.schemaVersion,
      idempotencyKey: `${parsed.eventType}:${parsed.eventId}`,
      occurredAt: parsed.occurredAt,
    },
  });
}

export async function claimPendingOutboxEvents(input: {
  batchSize: number;
  lockOwner?: string;
  lockMinutes?: number;
}) {
  const lockOwner = input.lockOwner ?? randomUUID();
  const lockCutoff = new Date(Date.now() - (input.lockMinutes ?? 5) * 60_000);

  const pending = await prisma.outboxEvent.findMany({
    where: {
      dispatchedAt: null,
      OR: [{ lockedAt: null }, { lockedAt: { lt: lockCutoff } }],
    },
    orderBy: { occurredAt: "asc" },
    take: input.batchSize,
  });

  const claimed = [];

  for (const event of pending) {
    const result = await prisma.outboxEvent.updateMany({
      where: {
        id: event.id,
        dispatchedAt: null,
        OR: [{ lockedAt: null }, { lockedAt: { lt: lockCutoff } }],
      },
      data: { lockedAt: new Date(), lockOwner },
    });

    if (result.count === 1) {
      claimed.push({ ...event, lockOwner });
    }
  }

  return claimed;
}
