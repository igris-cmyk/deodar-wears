import "server-only";

import { createHash } from "node:crypto";

import { ApplicationError } from "@/infrastructure/errors/application-error";

import { prisma, type PrismaTransactionClient } from "../database/prisma";

export type IdempotencyResult<T> =
  | { status: "created"; value: T }
  | { status: "replayed"; value: T };

export async function runIdempotent<T>(input: {
  scope: string;
  key: string;
  request: unknown;
  ttlMs: number;
  operation: () => Promise<{
    status: number;
    body: T;
    resourceType?: string;
    resourceId?: string;
  }>;
  transaction?: PrismaTransactionClient;
}): Promise<IdempotencyResult<T>> {
  const database = input.transaction ?? prisma;
  const requestHash = hashRequest(input.request);
  const existing = await database.idempotencyRecord.findUnique({
    where: { scope_key: { scope: input.scope, key: input.key } },
  });

  if (existing && existing.expiresAt > new Date()) {
    if (existing.requestHash !== requestHash) {
      throw new ApplicationError({
        code: "CONFLICT",
        message: "Idempotency key was reused with different input.",
        status: 409,
        expose: true,
      });
    }

    return { status: "replayed", value: existing.responseBody as T };
  }

  const response = await input.operation();

  await database.idempotencyRecord.upsert({
    where: { scope_key: { scope: input.scope, key: input.key } },
    update: {
      requestHash,
      responseStatus: response.status,
      responseBody: response.body as object,
      resourceType: response.resourceType,
      resourceId: response.resourceId,
      expiresAt: new Date(Date.now() + input.ttlMs),
    },
    create: {
      scope: input.scope,
      key: input.key,
      requestHash,
      responseStatus: response.status,
      responseBody: response.body as object,
      resourceType: response.resourceType,
      resourceId: response.resourceId,
      expiresAt: new Date(Date.now() + input.ttlMs),
    },
  });

  return { status: "created", value: response.body };
}

export function hashRequest(value: unknown): string {
  return createHash("sha256").update(stableStringify(value)).digest("hex");
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map((entry) => stableStringify(entry)).join(",")}]`;
  }

  return `{${Object.keys(value)
    .sort()
    .map(
      (key) =>
        `${JSON.stringify(key)}:${stableStringify((value as Record<string, unknown>)[key])}`,
    )
    .join(",")}}`;
}
