import { z } from "zod";

export const domainEventSchema = z.object({
  eventId: z.uuid(),
  eventType: z.string().min(1).max(160),
  schemaVersion: z.number().int().positive(),
  aggregateType: z.string().min(1).max(120),
  aggregateId: z.string().min(1).max(160),
  occurredAt: z.iso.datetime(),
  correlationId: z.string().min(1).max(128),
  causationId: z.string().min(1).max(128).optional(),
  payload: z.unknown(),
});

export type DomainEvent<T> = Omit<z.infer<typeof domainEventSchema>, "payload"> & {
  payload: T;
};
