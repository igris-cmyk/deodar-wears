import { z } from "zod";

import {
  ensureSlug,
  validatePriceInput,
  validateVariantOptionValues,
} from "./catalog.helpers";

const trimmedText = (max: number) => z.string().trim().min(1).max(max);
const optionalTrimmedText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((value) => {
      if (value === "") return undefined;
      return value;
    });

export const productStatusSchema = z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]);

export const catalogSortSchema = z
  .enum(["newest", "price-asc", "price-desc", "name"])
  .default("newest");

export const publicCatalogSearchSchema = z.object({
  category: z.string().trim().optional(),
  collection: z.string().trim().optional(),
  sort: catalogSortSchema.optional(),
  page: z.coerce.number().int().min(1).max(100).default(1),
  q: z.string().trim().max(120).optional(),
});

export const adminCatalogSearchSchema = z.object({
  status: z.enum(["ALL", "DRAFT", "ACTIVE", "ARCHIVED"]).default("ALL"),
  category: z.string().trim().optional(),
  q: z.string().trim().max(120).optional(),
  page: z.coerce.number().int().min(1).max(100).default(1),
});

export const productMediaInputSchema = z.object({
  url: trimmedText(400),
  altText: trimmedText(240),
  sortPosition: z.number().int().min(0).default(0),
  isPrimary: z.boolean().default(false),
});

export const productVariantInputSchema = z
  .object({
    sku: trimmedText(80),
    title: trimmedText(180),
    barcode: optionalTrimmedText(120),
    optionValues: z.unknown(),
    active: z.boolean().default(true),
    sortPosition: z.number().int().min(0).default(0),
    price: z.object({
      currency: trimmedText(3).transform((value) => value.toUpperCase()),
      amountMinor: z.number().int().positive(),
      compareAtAmountMinor: z.number().int().positive().optional().nullable(),
    }),
    inventory: z.object({
      quantityOnHand: z.number().int().min(0),
      quantityReserved: z.number().int().min(0).default(0),
      reorderThreshold: z.number().int().min(0).default(0),
      trackInventory: z.boolean().default(true),
      allowBackorder: z.boolean().default(false),
    }),
  })
  .transform((value) => {
    const optionValues = validateVariantOptionValues(value.optionValues);
    validatePriceInput(value.price);

    return { ...value, optionValues };
  });

export const productUpsertInputSchema = z.object({
  id: z.string().uuid().optional(),
  name: trimmedText(180),
  slug: z.string().trim().min(1).max(160).transform(ensureSlug),
  shortDescription: trimmedText(260),
  description: trimmedText(8_000),
  status: productStatusSchema,
  featured: z.boolean().default(false),
  seoTitle: optionalTrimmedText(180),
  seoDescription: optionalTrimmedText(320),
  categoryIds: z.array(z.string().uuid()).default([]),
  collectionIds: z.array(z.string().uuid()).default([]),
  media: z.array(productMediaInputSchema).min(1).max(12),
  variants: z.array(productVariantInputSchema).min(1).max(40),
});

export const categoryInputSchema = z.object({
  id: z.string().uuid().optional(),
  name: trimmedText(160),
  slug: z.string().trim().min(1).max(140).transform(ensureSlug),
  description: trimmedText(2_000),
  active: z.boolean().default(true),
  sortOrder: z.number().int().min(0).default(0),
});

export const collectionInputSchema = categoryInputSchema.extend({
  featured: z.boolean().default(false),
});

export const inventoryAdjustmentInputSchema = z.object({
  inventoryItemId: z.string().uuid(),
  type: z.enum(["INITIAL", "RECEIPT", "CORRECTION", "DAMAGE", "RETURN", "MANUAL"]),
  quantityDelta: z.number().int(),
  reason: trimmedText(600),
});

export const formProductInputSchema = productUpsertInputSchema.omit({
  media: true,
  variants: true,
});

export type ProductUpsertInput = z.infer<typeof productUpsertInputSchema>;
export type CategoryInput = z.infer<typeof categoryInputSchema>;
export type CollectionInput = z.infer<typeof collectionInputSchema>;
export type InventoryAdjustmentInput = z.infer<typeof inventoryAdjustmentInputSchema>;
