"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";

import { adjustInventoryItem } from "@/modules/inventory/inventory.service";
import { getCurrentRequestContext } from "@/modules/auth/session-context";

import {
  archiveCatalogProduct,
  upsertCatalogProduct,
  upsertCategory,
  upsertCollection,
} from "./catalog.mutations";
import { PUBLIC_CATALOG_CACHE_TAG } from "./catalog.constants";

export async function createProductAction(formData: FormData) {
  const context = await getCurrentRequestContext();
  const product = await upsertCatalogProduct(productInputFromForm(formData), context);

  revalidateCatalogPaths();
  redirect(`/admin/catalog/products/${product.id}`);
}

export async function updateProductAction(id: string, formData: FormData) {
  const context = await getCurrentRequestContext();
  const product = await upsertCatalogProduct(
    { ...productInputFromForm(formData), id },
    context,
  );

  revalidateCatalogPaths(product.slug);
  redirect(`/admin/catalog/products/${product.id}`);
}

export async function archiveProductAction(id: string) {
  const context = await getCurrentRequestContext();
  const product = await archiveCatalogProduct({ id }, context);

  revalidateCatalogPaths(product.slug);
  redirect("/admin/catalog/products");
}

export async function upsertCategoryAction(formData: FormData) {
  const context = await getCurrentRequestContext();
  await upsertCategory(
    {
      id: optionalString(formData.get("id")),
      name: stringField(formData, "name"),
      slug: stringField(formData, "slug"),
      description: stringField(formData, "description"),
      active: checkboxField(formData, "active"),
      sortOrder: numberField(formData, "sortOrder"),
    },
    context,
  );

  revalidateCatalogPaths();
  redirect("/admin/catalog/categories");
}

export async function upsertCollectionAction(formData: FormData) {
  const context = await getCurrentRequestContext();
  await upsertCollection(
    {
      id: optionalString(formData.get("id")),
      name: stringField(formData, "name"),
      slug: stringField(formData, "slug"),
      description: stringField(formData, "description"),
      active: checkboxField(formData, "active"),
      featured: checkboxField(formData, "featured"),
      sortOrder: numberField(formData, "sortOrder"),
    },
    context,
  );

  revalidateCatalogPaths();
  redirect("/admin/catalog/collections");
}

export async function adjustInventoryAction(formData: FormData) {
  const context = await getCurrentRequestContext();
  await adjustInventoryItem(
    {
      inventoryItemId: stringField(formData, "inventoryItemId"),
      type: stringField(formData, "type"),
      quantityDelta: numberField(formData, "quantityDelta"),
      reason: stringField(formData, "reason"),
    },
    context,
  );

  revalidatePath("/admin/inventory");
  updateTag(PUBLIC_CATALOG_CACHE_TAG);
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/products/[slug]", "page");
}

function productInputFromForm(formData: FormData) {
  const categoryIds = formData.getAll("categoryIds").map(String).filter(Boolean);
  const collectionIds = formData.getAll("collectionIds").map(String).filter(Boolean);
  const mediaUrls = formData.getAll("mediaUrl").map(String);
  const skus = formData.getAll("variantSku").map(String);

  return {
    name: stringField(formData, "name"),
    slug: stringField(formData, "slug"),
    shortDescription: stringField(formData, "shortDescription"),
    description: stringField(formData, "description"),
    status: stringField(formData, "status"),
    featured: checkboxField(formData, "featured"),
    seoTitle: optionalString(formData.get("seoTitle")),
    seoDescription: optionalString(formData.get("seoDescription")),
    categoryIds,
    collectionIds,
    media: mediaUrls
      .map((url, index) => ({
        url,
        altText: indexedString(formData, "mediaAltText", index),
        sortPosition: index,
        isPrimary: index === 0,
      }))
      .filter((media) => media.url.trim()),
    variants: skus
      .map((sku, index) => ({
        sku,
        title: indexedString(formData, "variantTitle", index),
        barcode: optionalString(indexedValue(formData, "barcode", index)),
        optionValues: variantOptionsFromForm(formData, index),
        active: indexedCheckbox(formData, "variantActive", index),
        sortPosition: index,
        price: {
          currency: optionalString(indexedValue(formData, "currency", index)) ?? "INR",
          amountMinor: indexedNumber(formData, "amountMinor", index),
          compareAtAmountMinor: optionalNumber(
            indexedValue(formData, "compareAtAmountMinor", index),
          ),
        },
        inventory: {
          quantityOnHand: indexedNumber(formData, "quantityOnHand", index),
          quantityReserved: indexedNumber(formData, "quantityReserved", index),
          reorderThreshold: indexedNumber(formData, "reorderThreshold", index),
          trackInventory: indexedCheckbox(formData, "trackInventory", index),
          allowBackorder: indexedCheckbox(formData, "allowBackorder", index),
        },
      }))
      .filter((variant) => variant.sku.trim()),
  };
}

function stringField(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function optionalString(value: FormDataEntryValue | null): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function numberField(formData: FormData, key: string): number {
  return Number(stringField(formData, key) || 0);
}

function optionalNumber(value: FormDataEntryValue | null): number | undefined {
  if (typeof value !== "string" || !value.trim()) return undefined;
  return Number(value);
}

function checkboxField(formData: FormData, key: string): boolean {
  return formData.get(key) === "on" || formData.get(key) === "true";
}

function indexedValue(formData: FormData, key: string, index: number) {
  return formData.getAll(key)[index] ?? null;
}

function indexedString(formData: FormData, key: string, index: number): string {
  const value = indexedValue(formData, key, index);
  return typeof value === "string" ? value : "";
}

function indexedNumber(formData: FormData, key: string, index: number): number {
  return Number(indexedString(formData, key, index) || 0);
}

function indexedCheckbox(formData: FormData, key: string, index: number): boolean {
  const value = indexedValue(formData, key, index);
  return value === "on" || value === "true";
}

function variantOptionsFromForm(formData: FormData, index: number) {
  return Object.fromEntries(
    [
      ["Size", optionalString(indexedValue(formData, "optionSize", index))],
      ["Color", optionalString(indexedValue(formData, "optionColor", index))],
      ["Fit", optionalString(indexedValue(formData, "optionFit", index))],
      ["Waist", optionalString(indexedValue(formData, "optionWaist", index))],
    ].filter((entry): entry is [string, string] => Boolean(entry[1])),
  );
}

function revalidateCatalogPaths(slug?: string) {
  updateTag(PUBLIC_CATALOG_CACHE_TAG);
  revalidatePath("/");
  revalidatePath("/shop");
  revalidatePath("/products/[slug]", "page");
  revalidatePath("/admin/catalog/products");
  if (slug) revalidatePath(`/products/${slug}`);
}
