import "server-only";

import type { Prisma } from "@prisma/client";

import { prisma, type PrismaTransactionClient } from "@/infrastructure/database/prisma";
import { ApplicationError } from "@/infrastructure/errors/application-error";
import { redactValue } from "@/infrastructure/logging/redaction";

import type { AuditAction, AuditActorType } from "./audit.types";

export type WriteAuditLogInput = {
  actorUserId?: string;
  actorType: AuditActorType;
  permissionCode?: string;
  action: AuditAction;
  entityType: string;
  entityId?: string;
  requestId: string;
  reason?: string;
  beforeData?: unknown;
  afterData?: unknown;
  ipAddress?: string;
  userAgent?: string;
};

export async function writeAuditLog(
  input: WriteAuditLogInput,
  transaction: PrismaTransactionClient = prisma,
) {
  rejectUnsafeAuditPayload(input.beforeData);
  rejectUnsafeAuditPayload(input.afterData);

  return transaction.auditLog.create({
    data: {
      actorUserId: input.actorUserId,
      actorType: input.actorType,
      permissionCode: input.permissionCode,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      requestId: input.requestId,
      reason: input.reason,
      beforeData: input.beforeData
        ? (redactValue(input.beforeData) as Prisma.InputJsonValue)
        : undefined,
      afterData: input.afterData
        ? (redactValue(input.afterData) as Prisma.InputJsonValue)
        : undefined,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
    },
  });
}

export function rejectUnsafeAuditPayload(payload: unknown): void {
  const visited = new WeakSet<object>();

  function containsSensitiveField(value: unknown): boolean {
    if (value === null || typeof value !== "object") {
      return false;
    }

    if (visited.has(value)) {
      return false;
    }

    visited.add(value);

    if (Array.isArray(value)) {
      return value.some(containsSensitiveField);
    }

    return Object.entries(value as Record<string, unknown>).some(
      ([key, nestedValue]) =>
        isSensitiveAuditField(key) || containsSensitiveField(nestedValue),
    );
  }

  if (containsSensitiveField(payload)) {
    throw new ApplicationError({
      code: "VALIDATION_FAILED",
      message: "Audit payload contains sensitive fields.",
      status: 400,
      expose: false,
    });
  }
}

function isSensitiveAuditField(key: string): boolean {
  const normalizedKey = key.replaceAll(/[^a-zA-Z0-9]/g, "").toLowerCase();

  return (
    normalizedKey.startsWith("password") ||
    normalizedKey === "token" ||
    normalizedKey.endsWith("token") ||
    normalizedKey.includes("secret") ||
    normalizedKey === "cookie" ||
    normalizedKey.endsWith("cookie") ||
    normalizedKey === "recoverycode" ||
    normalizedKey.endsWith("recoverycodes") ||
    normalizedKey === "onetimepassword"
  );
}
