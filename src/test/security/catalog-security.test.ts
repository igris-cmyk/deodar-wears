import { describe, expect, it } from "vitest";

import { rejectUnsafeAuditPayload } from "@/modules/audit/audit.service";
import {
  assertInventoryAdjustmentAllowed,
  isPublicProductStatus,
} from "@/modules/catalog/catalog.helpers";
import { upsertCatalogProduct } from "@/modules/catalog/catalog.mutations";
import { productUpsertInputSchema } from "@/modules/catalog/catalog.schemas";
import { adjustInventoryItem } from "@/modules/inventory/inventory.service";
import type { RequestContext } from "@/modules/auth/request-context";

const anonymousContext: RequestContext = {
  requestId: "security-test",
  correlationId: "security-test",
  locale: "en-IN",
  environment: "test",
  now: new Date("2026-06-19T00:00:00.000Z"),
  actor: { type: "ANONYMOUS" },
};

const adminWithoutInventory: RequestContext = {
  ...anonymousContext,
  actor: {
    type: "ADMIN",
    userId: "00000000-0000-0000-0000-000000000001",
    adminMembershipId: "00000000-0000-0000-0000-000000000002",
    sessionId: "session",
    permissions: new Set(["admin.access", "catalog.products.read"]),
    mfaVerifiedAt: new Date(),
    sessionFreshUntil: new Date(Date.now() + 60_000),
    active: true,
    requiresMfa: true,
  },
};

describe("Phase 2 catalog security", () => {
  it("rejects unauthorized admin catalog mutation", async () => {
    await expect(upsertCatalogProduct({}, anonymousContext)).rejects.toMatchObject({
      code: "AUTHENTICATION_REQUIRED",
    });
  });

  it("rejects unauthorized inventory adjustment before database mutation", async () => {
    await expect(
      adjustInventoryItem(
        {
          inventoryItemId: "00000000-0000-0000-0000-000000000003",
          type: "MANUAL",
          quantityDelta: 1,
          reason: "security test",
        },
        adminWithoutInventory,
      ),
    ).rejects.toMatchObject({ code: "PERMISSION_DENIED" });
  });

  it("rejects invalid pricing and compare-at exploits", () => {
    expect(() =>
      productUpsertInputSchema.parse({
        name: "Exploit Product",
        slug: "exploit-product",
        shortDescription: "Invalid price proof",
        description: "Invalid price proof description",
        status: "DRAFT",
        featured: false,
        categoryIds: [],
        collectionIds: [],
        media: [
          {
            url: "/catalog/deodar-overshirt.svg",
            altText: "Exploit product image",
            sortPosition: 0,
            isPrimary: true,
          },
        ],
        variants: [
          {
            sku: "EXP-1",
            title: "Exploit",
            optionValues: { Size: "M" },
            active: true,
            sortPosition: 0,
            price: {
              currency: "INR",
              amountMinor: 50000,
              compareAtAmountMinor: 40000,
            },
            inventory: {
              quantityOnHand: 1,
              quantityReserved: 0,
              reorderThreshold: 0,
              trackInventory: true,
              allowBackorder: false,
            },
          },
        ],
      }),
    ).toThrow();
  });

  it("rejects negative stock exploit attempts", () => {
    expect(() =>
      assertInventoryAdjustmentAllowed({
        quantityOnHand: 1,
        quantityReserved: 0,
        allowBackorder: false,
        quantityDelta: -2,
      }),
    ).toThrow(expect.objectContaining({ code: "VALIDATION_FAILED" }));
  });

  it("preserves recursive audit sensitive-field rejection", () => {
    expect(() =>
      rejectUnsafeAuditPayload({ product: { nested: { refreshToken: "secret" } } }),
    ).toThrow(expect.objectContaining({ code: "VALIDATION_FAILED" }));
  });

  it("prevents draft and archived public exposure by status rule", () => {
    expect(isPublicProductStatus("DRAFT")).toBe(false);
    expect(isPublicProductStatus("ARCHIVED")).toBe(false);
    expect(isPublicProductStatus("ACTIVE")).toBe(true);
  });
});
