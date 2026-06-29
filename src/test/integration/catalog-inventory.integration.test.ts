import { randomUUID } from "node:crypto";

import { describe, expect, it } from "vitest";

import { prisma } from "@/infrastructure/database/prisma";
import { upsertCatalogProduct } from "@/modules/catalog/catalog.mutations";
import { getProductDetail, getShopCatalog } from "@/modules/catalog/catalog.queries";
import { SEASONAL_COLLECTION_SLUGS } from "@/modules/catalog/catalog.constants";
import { adjustInventoryItem } from "@/modules/inventory/inventory.service";
import type { RequestContext } from "@/modules/auth/request-context";

import { seedDatabase } from "../../../prisma/seed/index";

const requireDatabase =
  process.env.REQUIRE_DATABASE_TESTS === "true" ||
  process.env.CI === "true" ||
  process.env.APP_ENV === "staging" ||
  process.env.APP_ENV === "production";
const hasDatabase = Boolean(process.env.TEST_DATABASE_URL);

if (requireDatabase && !hasDatabase) {
  throw new Error("TEST_DATABASE_URL is required for catalog integration tests.");
}

const describeIfDatabase = hasDatabase ? describe : describe.skip;

describeIfDatabase("catalog and inventory database contracts", () => {
  it("seeds the catalog idempotently without duplicate stock history", async () => {
    await seedDatabase(prisma);
    const firstAdjustmentCount = await prisma.inventoryAdjustment.count({
      where: { reason: "Deterministic catalog seed stock" },
    });

    await seedDatabase(prisma);

    await expect(prisma.category.count()).resolves.toBeGreaterThanOrEqual(4);
    await expect(prisma.collection.count()).resolves.toBeGreaterThanOrEqual(7);
    await expect(
      prisma.inventoryAdjustment.count({
        where: { reason: "Deterministic catalog seed stock" },
      }),
    ).resolves.toBe(firstAdjustmentCount);
  });

  it("seeds every season with active public merchandise", async () => {
    await seedDatabase(prisma);

    const seasons = await prisma.collection.findMany({
      where: { slug: { in: [...SEASONAL_COLLECTION_SLUGS] }, active: true },
      select: {
        slug: true,
        products: {
          where: { product: { status: "ACTIVE" } },
          select: { productId: true },
        },
      },
    });

    expect(seasons.map((season) => season.slug).sort()).toEqual(
      [...SEASONAL_COLLECTION_SLUGS].sort(),
    );
    expect(seasons.every((season) => season.products.length > 0)).toBe(true);
  });

  it("creates product, variant, price, relationships, inventory history and audit", async () => {
    await seedDatabase(prisma);

    const user = await prisma.user.create({
      data: {
        email: `catalog-admin-${randomUUID()}@example.com`,
        name: "Catalog Integration Admin",
        emailVerified: true,
      },
    });
    const category = await prisma.category.findFirstOrThrow({
      where: { slug: "outerwear" },
    });
    const collection = await prisma.collection.findFirstOrThrow({
      where: { slug: "new-arrivals" },
    });
    const slug = `integration-shell-${randomUUID().slice(0, 8)}`;
    const sku = `INT-${randomUUID().slice(0, 8).toUpperCase()}`;
    const context: RequestContext = {
      requestId: `test-${randomUUID()}`,
      correlationId: `test-${randomUUID()}`,
      locale: "en-IN",
      environment: "test",
      now: new Date(),
      actor: {
        type: "ADMIN",
        userId: user.id,
        adminMembershipId: randomUUID(),
        sessionId: randomUUID(),
        permissions: new Set([
          "admin.access",
          "catalog.products.create",
          "catalog.products.update",
          "inventory.adjust",
        ]),
        mfaVerifiedAt: new Date(),
        sessionFreshUntil: new Date(Date.now() + 60_000),
        active: true,
        requiresMfa: true,
      },
    };

    const product = await upsertCatalogProduct(
      {
        name: "Integration Shell",
        slug,
        shortDescription: "Integration product for catalog persistence.",
        description: "Integration product for catalog persistence and audit proof.",
        status: "ACTIVE",
        featured: false,
        categoryIds: [category.id],
        collectionIds: [collection.id],
        media: [
          {
            url: "/catalog/archive-shell.svg",
            altText: "Integration shell product image",
            sortPosition: 0,
            isPrimary: true,
          },
        ],
        variants: [
          {
            sku,
            title: "Black / M",
            optionValues: { Size: "M", Color: "Black" },
            active: true,
            sortPosition: 0,
            price: {
              currency: "INR",
              amountMinor: 990000,
              compareAtAmountMinor: 1190000,
            },
            inventory: {
              quantityOnHand: 6,
              quantityReserved: 1,
              reorderThreshold: 2,
              trackInventory: true,
              allowBackorder: false,
            },
          },
        ],
      },
      context,
    );

    const variant = await prisma.productVariant.findUniqueOrThrow({
      where: { sku },
      include: {
        prices: { where: { active: true } },
        inventoryItem: { include: { adjustments: true } },
        product: {
          include: { categories: true, collections: true },
        },
      },
    });

    expect(variant.productId).toBe(product.id);
    expect(variant.prices[0]).toMatchObject({
      currency: "INR",
      amountMinor: 990000,
      compareAtAmountMinor: 1190000,
    });
    expect(variant.product.categories).toHaveLength(1);
    expect(variant.product.collections).toHaveLength(1);
    expect(variant.inventoryItem?.quantityOnHand).toBe(6);
    expect(variant.inventoryItem?.adjustments).toHaveLength(1);

    await expect(
      prisma.auditLog.count({
        where: {
          action: "PRODUCT_CREATED",
          entityType: "Product",
          entityId: product.id,
        },
      }),
    ).resolves.toBe(1);

    if (!variant.inventoryItem) {
      throw new Error("Inventory item was not created.");
    }

    await adjustInventoryItem(
      {
        inventoryItemId: variant.inventoryItem.id,
        type: "RECEIPT",
        quantityDelta: 3,
        reason: "integration stock receipt",
      },
      context,
    );

    await expect(
      prisma.inventoryAdjustment.count({
        where: { inventoryItemId: variant.inventoryItem.id },
      }),
    ).resolves.toBe(2);
    await expect(
      prisma.auditLog.count({
        where: {
          action: "INVENTORY_ADJUSTED",
          entityType: "InventoryItem",
          entityId: variant.inventoryItem.id,
        },
      }),
    ).resolves.toBeGreaterThanOrEqual(2);
  });

  it("public queries exclude draft and archived products", async () => {
    await seedDatabase(prisma);

    await expect(getProductDetail("hearth-hoodie")).resolves.toBeNull();
    await expect(getProductDetail("archive-rain-shell")).resolves.toBeNull();

    const catalog = await getShopCatalog({ page: 1 });
    const slugs = catalog.products.map((product) => product.slug);

    expect(slugs).not.toContain("hearth-hoodie");
    expect(slugs).not.toContain("archive-rain-shell");
    expect(slugs).toContain("deodar-overshirt");
  });
});
