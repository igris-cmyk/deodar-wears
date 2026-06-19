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
  const serialized = JSON.stringify(payload ?? {});

  if (/password|token|secret|cookie|recovery.?code|mfa/i.test(serialized)) {
    throw new ApplicationError({
      code: "VALIDATION_FAILED",
      message: "Audit payload contains sensitive fields.",
      status: 400,
      expose: false,
    });
  }
}
