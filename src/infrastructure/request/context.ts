import "server-only";

import { randomUUID } from "node:crypto";

export type PlatformRequestContext = {
  requestId: string;
  correlationId: string;
  ipAddress?: string;
  userAgent?: string;
  locale: string;
  environment: string;
  now: Date;
};

const headerSafePattern = /^[a-zA-Z0-9._:-]{8,128}$/;

export function createRequestContext(input: {
  headers?: Headers;
  ipAddress?: string;
  now?: Date;
  environment?: string;
}): PlatformRequestContext {
  const requestId = randomUUID();
  const incomingCorrelationId = input.headers?.get("x-correlation-id") ?? undefined;
  const correlationId =
    incomingCorrelationId && headerSafePattern.test(incomingCorrelationId)
      ? incomingCorrelationId
      : requestId;

  return {
    requestId,
    correlationId,
    ipAddress: input.ipAddress,
    userAgent: input.headers?.get("user-agent") ?? undefined,
    locale: input.headers?.get("accept-language")?.split(",")[0] ?? "en-IN",
    environment: input.environment ?? process.env.APP_ENV ?? "unknown",
    now: input.now ?? new Date(),
  };
}
