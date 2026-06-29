import "server-only";

import type { Prisma } from "@prisma/client";

import { ApplicationError } from "@/infrastructure/errors/application-error";
import { withCommerceTransaction } from "@/infrastructure/transactions/commerce-transaction";
import { writeAuditLog } from "@/modules/audit/audit.service";
import { requireAdmin, requirePermission } from "@/modules/auth/authorization";
import type { RequestContext } from "@/modules/auth/request-context";

import { assertInventoryAdjustmentAllowed } from "./catalog.helpers";
import {
  categoryInputSchema,
  collectionInputSchema,
  productUpsertInputSchema,
  type ProductUpsertInput,
} from "./catalog.schemas";

export async function upsertCatalogProduct(input: unknown, context: RequestContext) {
  const actor = context.actor;
  requireAdmin(actor);

  const parsed = productUpsertInputSchema.parse(input);
  const isUpdate = Boolean(parsed.id);

  requirePermission(
    actor,
    isUpdate ? "catalog.products.update" : "catalog.products.create",
  );

  validatePrimaryMedia(parsed);

  return withCommerceTransaction(
    async (transaction) => {
      const before = parsed.id
        ? await transaction.product.findUnique({
            where: { id: parsed.id },
            select: {
              id: true,
              slug: true,
              name: true,
              status: true,
              featured: true,
            },
          })
        : null;

      const product = parsed.id
        ? await transaction.product.update({
            where: { id: parsed.id },
            data: productData(parsed),
          })
        : await transaction.product.create({ data: productData(parsed) });

      await syncOrganization(transaction, product.id, parsed);
      await syncMedia(transaction, product.id, parsed);
      await syncVariants(transaction, product.id, parsed, context);

      await writeAuditLog(
        {
          actorType: "ADMIN",
          actorUserId: actor.userId,
          permissionCode: isUpdate
            ? "catalog.products.update"
            : "catalog.products.create",
          action: isUpdate ? "PRODUCT_UPDATED" : "PRODUCT_CREATED",
          entityType: "Product",
          entityId: product.id,
          requestId: context.requestId,
          reason: isUpdate ? "Admin product edit" : "Admin product creation",
          beforeData: before ?? undefined,
          afterData: {
            slug: product.slug,
            name: product.name,
            status: product.status,
            featured: product.featured,
            variantCount: parsed.variants.length,
          },
          ipAddress: context.ipAddress,
          userAgent: context.userAgent,
        },
        transaction,
      );

      return product;
    },
    { isolationLevel: "SERIALIZABLE", correlationId: context.correlationId },
  );
}

export async function archiveCatalogProduct(
  input: { id: string },
  context: RequestContext,
) {
  const actor = context.actor;
  requireAdmin(actor);
  requirePermission(actor, "catalog.products.archive");

  return withCommerceTransaction(async (transaction) => {
    const before = await transaction.product.findUniqueOrThrow({
      where: { id: input.id },
      select: { id: true, slug: true, name: true, status: true },
    });

    const product = await transaction.product.update({
      where: { id: input.id },
      data: { status: "ARCHIVED" },
    });

    await writeAuditLog(
      {
        actorType: "ADMIN",
        actorUserId: actor.userId,
        permissionCode: "catalog.products.archive",
        action: "PRODUCT_ARCHIVED",
        entityType: "Product",
        entityId: product.id,
        requestId: context.requestId,
        reason: "Admin product archival",
        beforeData: before,
        afterData: { slug: product.slug, status: product.status },
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
      },
      transaction,
    );

    return product;
  });
}

export async function upsertCategory(input: unknown, context: RequestContext) {
  const actor = context.actor;
  requireAdmin(actor);
  requirePermission(actor, "catalog.categories.manage");

  const parsed = categoryInputSchema.parse(input);

  return withCommerceTransaction(async (transaction) => {
    const category = parsed.id
      ? await transaction.category.update({ where: { id: parsed.id }, data: parsed })
      : await transaction.category.upsert({
          where: { slug: parsed.slug },
          update: parsed,
          create: parsed,
        });

    await writeAuditLog(
      {
        actorType: "ADMIN",
        actorUserId: actor.userId,
        permissionCode: "catalog.categories.manage",
        action: "CATEGORY_UPDATED",
        entityType: "Category",
        entityId: category.id,
        requestId: context.requestId,
        reason: "Admin category management",
        afterData: {
          slug: category.slug,
          name: category.name,
          active: category.active,
        },
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
      },
      transaction,
    );

    return category;
  });
}

export async function upsertCollection(input: unknown, context: RequestContext) {
  const actor = context.actor;
  requireAdmin(actor);
  requirePermission(actor, "catalog.collections.manage");

  const parsed = collectionInputSchema.parse(input);

  return withCommerceTransaction(async (transaction) => {
    const collection = parsed.id
      ? await transaction.collection.update({ where: { id: parsed.id }, data: parsed })
      : await transaction.collection.upsert({
          where: { slug: parsed.slug },
          update: parsed,
          create: parsed,
        });

    await writeAuditLog(
      {
        actorType: "ADMIN",
        actorUserId: actor.userId,
        permissionCode: "catalog.collections.manage",
        action: "COLLECTION_UPDATED",
        entityType: "Collection",
        entityId: collection.id,
        requestId: context.requestId,
        reason: "Admin collection management",
        afterData: {
          slug: collection.slug,
          name: collection.name,
          active: collection.active,
          featured: collection.featured,
        },
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
      },
      transaction,
    );

    return collection;
  });
}

function productData(input: ProductUpsertInput): Prisma.ProductCreateInput {
  return {
    slug: input.slug,
    name: input.name,
    shortDescription: input.shortDescription,
    description: input.description,
    status: input.status,
    featured: input.featured,
    seoTitle: input.seoTitle,
    seoDescription: input.seoDescription,
  };
}

function validatePrimaryMedia(input: ProductUpsertInput): void {
  const primaryCount = input.media.filter((media) => media.isPrimary).length;

  if (primaryCount !== 1) {
    throw new ApplicationError({
      code: "VALIDATION_FAILED",
      message: "Exactly one primary product image is required.",
      status: 400,
      expose: true,
    });
  }
}

async function syncOrganization(
  transaction: Prisma.TransactionClient,
  productId: string,
  input: ProductUpsertInput,
) {
  await Promise.all([
    transaction.productCategory.deleteMany({ where: { productId } }),
    transaction.productCollection.deleteMany({ where: { productId } }),
  ]);

  await Promise.all([
    input.categoryIds.length
      ? transaction.productCategory.createMany({
          data: input.categoryIds.map((categoryId, index) => ({
            productId,
            categoryId,
            sortPosition: index,
          })),
          skipDuplicates: true,
        })
      : Promise.resolve(),
    input.collectionIds.length
      ? transaction.productCollection.createMany({
          data: input.collectionIds.map((collectionId, index) => ({
            productId,
            collectionId,
            sortPosition: index,
          })),
          skipDuplicates: true,
        })
      : Promise.resolve(),
  ]);
}

async function syncMedia(
  transaction: Prisma.TransactionClient,
  productId: string,
  input: ProductUpsertInput,
) {
  await transaction.productMedia.deleteMany({ where: { productId } });
  await transaction.productMedia.createMany({
    data: input.media.map((media) => ({
      productId,
      url: media.url,
      altText: media.altText,
      isPrimary: media.isPrimary,
      sortPosition: media.sortPosition,
      mediaType: "IMAGE",
    })),
  });
}

async function syncVariants(
  transaction: Prisma.TransactionClient,
  productId: string,
  input: ProductUpsertInput,
  context: RequestContext,
) {
  const desiredSkus = input.variants.map((variant) => variant.sku);

  await transaction.productVariant.updateMany({
    where: { productId, sku: { notIn: desiredSkus } },
    data: { active: false },
  });

  for (const [index, variantInput] of input.variants.entries()) {
    const existing = await transaction.productVariant.findUnique({
      where: { sku: variantInput.sku },
      include: { inventoryItem: true },
    });

    if (existing && existing.productId !== productId) {
      throw new ApplicationError({
        code: "VALIDATION_FAILED",
        message: "SKU already belongs to another product.",
        status: 400,
        expose: true,
      });
    }

    const variant = existing
      ? await transaction.productVariant.update({
          where: { id: existing.id },
          data: {
            title: variantInput.title,
            barcode: variantInput.barcode,
            optionValues: variantInput.optionValues as Prisma.InputJsonValue,
            active: variantInput.active,
            sortPosition: variantInput.sortPosition || index,
          },
        })
      : await transaction.productVariant.create({
          data: {
            productId,
            sku: variantInput.sku,
            title: variantInput.title,
            barcode: variantInput.barcode,
            optionValues: variantInput.optionValues as Prisma.InputJsonValue,
            active: variantInput.active,
            sortPosition: variantInput.sortPosition || index,
          },
        });

    await transaction.productPrice.updateMany({
      where: {
        variantId: variant.id,
        currency: variantInput.price.currency,
        active: true,
      },
      data: { active: false },
    });
    await transaction.productPrice.create({
      data: {
        variantId: variant.id,
        currency: variantInput.price.currency,
        amountMinor: variantInput.price.amountMinor,
        compareAtAmountMinor: variantInput.price.compareAtAmountMinor,
        active: true,
      },
    });

    await syncInventoryItem(transaction, variant.id, variantInput, context);
  }
}

async function syncInventoryItem(
  transaction: Prisma.TransactionClient,
  variantId: string,
  variantInput: ProductUpsertInput["variants"][number],
  context: RequestContext,
) {
  const existing = await transaction.inventoryItem.findUnique({ where: { variantId } });
  const baseline = existing ?? {
    quantityOnHand: 0,
    allowBackorder: variantInput.inventory.allowBackorder,
  };
  const resultingQuantity = variantInput.inventory.quantityOnHand;

  if (
    !variantInput.inventory.allowBackorder &&
    variantInput.inventory.quantityReserved > resultingQuantity
  ) {
    throw new ApplicationError({
      code: "VALIDATION_FAILED",
      message:
        "Reserved stock cannot exceed on-hand stock unless backorders are allowed.",
      status: 400,
      expose: true,
    });
  }

  if (resultingQuantity !== baseline.quantityOnHand) {
    const actor = context.actor;
    requireAdmin(actor);
    requirePermission(actor, "inventory.adjust");
    assertInventoryAdjustmentAllowed({
      quantityOnHand: baseline.quantityOnHand,
      quantityReserved: variantInput.inventory.quantityReserved,
      allowBackorder: variantInput.inventory.allowBackorder,
      quantityDelta: resultingQuantity - baseline.quantityOnHand,
    });
  }

  const inventoryItem = existing
    ? await transaction.inventoryItem.update({
        where: { id: existing.id },
        data: {
          reorderThreshold: variantInput.inventory.reorderThreshold,
          trackInventory: variantInput.inventory.trackInventory,
          allowBackorder: variantInput.inventory.allowBackorder,
        },
      })
    : await transaction.inventoryItem.create({
        data: {
          variantId,
          quantityOnHand: 0,
          quantityReserved: 0,
          reorderThreshold: variantInput.inventory.reorderThreshold,
          trackInventory: variantInput.inventory.trackInventory,
          allowBackorder: variantInput.inventory.allowBackorder,
        },
      });

  const quantityDelta = resultingQuantity - inventoryItem.quantityOnHand;

  if (quantityDelta === 0) {
    await transaction.inventoryItem.update({
      where: { id: inventoryItem.id },
      data: { quantityReserved: variantInput.inventory.quantityReserved },
    });
    return;
  }

  await transaction.inventoryItem.update({
    where: { id: inventoryItem.id },
    data: { quantityOnHand: resultingQuantity },
  });

  const adjustment = await transaction.inventoryAdjustment.create({
    data: {
      inventoryItemId: inventoryItem.id,
      type: existing ? "CORRECTION" : "INITIAL",
      quantityDelta,
      previousQuantity: inventoryItem.quantityOnHand,
      resultingQuantity,
      reason: existing ? "Product editor quantity correction" : "Initial stock entry",
      actorUserId: context.actor.type === "ADMIN" ? context.actor.userId : undefined,
      requestId: context.requestId,
    },
  });

  await writeAuditLog(
    {
      actorType: "ADMIN",
      actorUserId: context.actor.type === "ADMIN" ? context.actor.userId : undefined,
      permissionCode: "inventory.adjust",
      action: "INVENTORY_ADJUSTED",
      entityType: "InventoryItem",
      entityId: inventoryItem.id,
      requestId: context.requestId,
      reason: existing ? "Product editor quantity correction" : "Initial stock entry",
      beforeData: {
        quantityOnHand: inventoryItem.quantityOnHand,
        quantityReserved: inventoryItem.quantityReserved,
      },
      afterData: {
        quantityOnHand: resultingQuantity,
        adjustmentId: adjustment.id,
        sku: variantInput.sku,
      },
      ipAddress: context.ipAddress,
      userAgent: context.userAgent,
    },
    transaction,
  );

  await transaction.inventoryItem.update({
    where: { id: inventoryItem.id },
    data: { quantityReserved: variantInput.inventory.quantityReserved },
  });
}
