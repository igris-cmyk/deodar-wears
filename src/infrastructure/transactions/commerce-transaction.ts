import "server-only";

import { Prisma } from "@prisma/client";

import { ApplicationError } from "@/infrastructure/errors/application-error";
import { logger } from "@/infrastructure/logging/logger";

import { prisma, type PrismaTransactionClient } from "../database/prisma";

export type CommerceTransactionOptions = {
  isolationLevel?: "SERIALIZABLE";
  maximumAttempts?: number;
  correlationId?: string;
  timeoutMs?: number;
  maxWaitMs?: number;
};

export async function withCommerceTransaction<T>(
  operation: (transaction: PrismaTransactionClient) => Promise<T>,
  options: CommerceTransactionOptions = {},
): Promise<T> {
  const maximumAttempts = options.maximumAttempts ?? 3;

  for (let attempt = 1; attempt <= maximumAttempts; attempt += 1) {
    try {
      return await prisma.$transaction(async (transaction) => operation(transaction), {
        ...(options.isolationLevel === "SERIALIZABLE"
          ? { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
          : {}),
        maxWait: options.maxWaitMs ?? 5_000,
        timeout: options.timeoutMs ?? 15_000,
      });
    } catch (error) {
      if (!isRetryableTransactionError(error) || attempt >= maximumAttempts) {
        if (isRetryableTransactionError(error)) {
          throw new ApplicationError({
            code: "SERIALIZATION_RETRY_EXHAUSTED",
            message: "Transaction retry attempts were exhausted.",
            status: 503,
            retryable: true,
            cause: error,
          });
        }

        throw error;
      }

      logger.warn({
        event: "transaction.retry",
        attempt,
        maximumAttempts,
        correlationId: options.correlationId,
      });

      await delay(retryDelayMs(attempt));
    }
  }

  throw new ApplicationError({
    code: "SERIALIZATION_RETRY_EXHAUSTED",
    message: "Transaction retry attempts were exhausted.",
    status: 503,
    retryable: true,
  });
}

export function isRetryableTransactionError(error: unknown): boolean {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return error.code === "P2034";
  }

  if (error && typeof error === "object" && "code" in error) {
    const code = String((error as { code: unknown }).code);
    return code === "40001" || code === "40P01";
  }

  return false;
}

function retryDelayMs(attempt: number): number {
  return Math.min(50 * attempt + Math.floor(Math.random() * 20), 250);
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
