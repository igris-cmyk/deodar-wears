import "server-only";

import type { InventoryAdjustmentType, Prisma } from "@prisma/client";

import { prisma } from "@/infrastructure/database/prisma";
import { withCommerceTransaction } from "@/infrastructure/transactions/commerce-transaction";
import { writeAuditLog } from "@/modules/audit/audit.service";
import { assertInventoryAdjustmentAllowed } from "@/modules/catalog/catalog.helpers";
import { inventoryAdjustmentInputSchema } from "@/modules/catalog/catalog.schemas";
import {
  requireAdmin,
  requirePermission,
  type AuthenticatedAdmin,
} from "@/modules/auth/authorization";
import type { RequestContext } from "@/modules/auth/request-context";

export async function adjustInventoryItem(input: unknown, context: RequestContext) {
  const actor = context.actor;
  requireAdmin(actor);
  requirePermission(actor, "inventory.adjust");

  const parsed = inventoryAdjustmentInputSchema.parse(input);

  return withCommerceTransaction(
    async (transaction) => {
      const inventoryItem = await transaction.inventoryItem.findUniqueOrThrow({
        where: { id: parsed.inventoryItemId },
        include: {
          variant: {
            select: {
              id: true,
              sku: true,
              title: true,
              product: { select: { id: true, name: true, slug: true } },
            },
          },
        },
      });

      const resultingQuantity = assertInventoryAdjustmentAllowed({
        quantityOnHand: inventoryItem.quantityOnHand,
        quantityReserved: inventoryItem.quantityReserved,
        allowBackorder: inventoryItem.allowBackorder,
        quantityDelta: parsed.quantityDelta,
      });

      const updated = await transaction.inventoryItem.update({
        where: { id: inventoryItem.id },
        data: { quantityOnHand: resultingQuantity },
      });

      const adjustment = await transaction.inventoryAdjustment.create({
        data: {
          inventoryItemId: inventoryItem.id,
          type: parsed.type as InventoryAdjustmentType,
          quantityDelta: parsed.quantityDelta,
          previousQuantity: inventoryItem.quantityOnHand,
          resultingQuantity,
          reason: parsed.reason,
          actorUserId: actor.userId,
          requestId: context.requestId,
        },
      });

      await writeAuditLog(
        {
          actorType: "ADMIN",
          actorUserId: actor.userId,
          permissionCode: "inventory.adjust",
          action: "INVENTORY_ADJUSTED",
          entityType: "InventoryItem",
          entityId: inventoryItem.id,
          requestId: context.requestId,
          reason: parsed.reason,
          beforeData: {
            sku: inventoryItem.variant.sku,
            quantityOnHand: inventoryItem.quantityOnHand,
            quantityReserved: inventoryItem.quantityReserved,
          },
          afterData: {
            sku: inventoryItem.variant.sku,
            quantityOnHand: updated.quantityOnHand,
            adjustmentId: adjustment.id,
            adjustmentType: parsed.type,
            quantityDelta: parsed.quantityDelta,
          },
          ipAddress: context.ipAddress,
          userAgent: context.userAgent,
        },
        transaction,
      );

      return adjustment;
    },
    { isolationLevel: "SERIALIZABLE", correlationId: context.correlationId },
  );
}

export async function getInventoryAdminData(input: {
  q?: string;
  page?: number;
  take?: number;
}) {
  const page = Math.max(1, input.page ?? 1);
  const take = Math.min(Math.max(input.take ?? 20, 1), 50);
  const where: Prisma.InventoryItemWhereInput = input.q
    ? {
        variant: {
          OR: [
            { sku: { contains: input.q, mode: "insensitive" } },
            { title: { contains: input.q, mode: "insensitive" } },
            { product: { name: { contains: input.q, mode: "insensitive" } } },
          ],
        },
      }
    : {};

  const [totalCount, items] = await Promise.all([
    prisma.inventoryItem.count({ where }),
    prisma.inventoryItem.findMany({
      where,
      include: {
        variant: {
          include: {
            product: { select: { name: true, slug: true } },
          },
        },
        adjustments: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
      orderBy: [{ updatedAt: "desc" }],
      skip: (page - 1) * take,
      take,
    }),
  ]);

  return {
    items,
    totalCount,
    page,
    pageCount: Math.max(1, Math.ceil(totalCount / take)),
  };
}

export function adminForInventoryTest(
  overrides: Partial<AuthenticatedAdmin> = {},
): AuthenticatedAdmin {
  return {
    type: "ADMIN",
    userId: "user-1",
    adminMembershipId: "admin-1",
    sessionId: "session-1",
    permissions: new Set(["admin.access", "inventory.read", "inventory.adjust"]),
    mfaVerifiedAt: new Date(),
    sessionFreshUntil: new Date(Date.now() + 60_000),
    active: true,
    requiresMfa: true,
    ...overrides,
  };
}
