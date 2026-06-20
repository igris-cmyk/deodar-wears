import { describe, expect, it } from "vitest";

import {
  assertInventoryAdjustmentAllowed,
  calculateAvailableQuantity,
  formatMoney,
  inventoryLabel,
  isPublicProductStatus,
  normalizeSlug,
  validatePriceInput,
  validateVariantOptionValues,
} from "@/modules/catalog/catalog.helpers";
import { resolvePermissionUnion } from "@/modules/admin/permissions";
import {
  CATALOG_PAGE_SIZE,
  HOMEPAGE_PRODUCT_LIMIT,
  PUBLIC_MEDIA_LIMIT,
  PUBLIC_VARIANT_LIMIT,
  RELATED_PRODUCT_LIMIT,
  SEASONAL_COLLECTION_SLUGS,
} from "@/modules/catalog/catalog.constants";

describe("Phase 2 catalog domain helpers", () => {
  it("normalizes slugs deterministically", () => {
    expect(normalizeSlug("  Cedar Knit Crew!! ")).toBe("cedar-knit-crew");
  });

  it("exposes only active products publicly", () => {
    expect(isPublicProductStatus("ACTIVE")).toBe(true);
    expect(isPublicProductStatus("DRAFT")).toBe(false);
    expect(isPublicProductStatus("ARCHIVED")).toBe(false);
  });

  it("validates integer minor-unit prices and compare-at pricing", () => {
    expect(() =>
      validatePriceInput({ currency: "INR", amountMinor: 120000 }),
    ).not.toThrow();
    expect(() =>
      validatePriceInput({
        currency: "INR",
        amountMinor: 120000,
        compareAtAmountMinor: 110000,
      }),
    ).toThrow(expect.objectContaining({ code: "VALIDATION_FAILED" }));
  });

  it("validates structured variant options without hardcoding one dimension", () => {
    expect(validateVariantOptionValues({ Size: "M", Color: "Black" })).toEqual({
      Size: "M",
      Color: "Black",
    });
    expect(validateVariantOptionValues({ Waist: "32", Fit: "Tapered" })).toEqual({
      Waist: "32",
      Fit: "Tapered",
    });
    expect(() => validateVariantOptionValues({ Size: "" })).toThrow(
      expect.objectContaining({ code: "VALIDATION_FAILED" }),
    );
  });

  it("calculates availability without storing a stale available number", () => {
    expect(calculateAvailableQuantity({ quantityOnHand: 9, quantityReserved: 2 })).toBe(
      7,
    );
  });

  it("prevents impossible negative stock and respects backorder reserved stock", () => {
    expect(() =>
      assertInventoryAdjustmentAllowed({
        quantityOnHand: 2,
        quantityReserved: 0,
        allowBackorder: false,
        quantityDelta: -3,
      }),
    ).toThrow(expect.objectContaining({ code: "VALIDATION_FAILED" }));

    expect(
      assertInventoryAdjustmentAllowed({
        quantityOnHand: 2,
        quantityReserved: 3,
        allowBackorder: true,
        quantityDelta: -1,
      }),
    ).toBe(1);
  });

  it("labels inventory and formats INR money", () => {
    expect(
      inventoryLabel({
        trackInventory: true,
        allowBackorder: false,
        quantityOnHand: 4,
        quantityReserved: 1,
        reorderThreshold: 3,
      }),
    ).toBe("Low stock");
    expect(formatMoney({ amountMinor: 780000, currency: "INR" })).toBe("₹7,800");
  });

  it("maps explicit catalog and inventory permissions to operational roles", () => {
    expect(
      resolvePermissionUnion(["CATALOGUE_MANAGER"]).has("catalog.products.update"),
    ).toBe(true);
    expect(resolvePermissionUnion(["INVENTORY_OPERATOR"]).has("inventory.adjust")).toBe(
      true,
    );
    expect(resolvePermissionUnion(["INVENTORY_OPERATOR"]).has("inventory.override")).toBe(
      false,
    );
  });

  it("keeps public catalog reads bounded and defines every seasonal edit", () => {
    expect(HOMEPAGE_PRODUCT_LIMIT).toBeLessThanOrEqual(8);
    expect(CATALOG_PAGE_SIZE).toBeLessThanOrEqual(12);
    expect(RELATED_PRODUCT_LIMIT).toBeLessThanOrEqual(4);
    expect(PUBLIC_MEDIA_LIMIT).toBeLessThanOrEqual(8);
    expect(PUBLIC_VARIANT_LIMIT).toBeLessThanOrEqual(64);
    expect(SEASONAL_COLLECTION_SLUGS).toEqual([
      "spring-edit",
      "summer-edit",
      "rain-transition",
      "autumn-edit",
      "winter-edit",
    ]);
  });
});
