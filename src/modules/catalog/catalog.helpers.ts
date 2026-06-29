import { ApplicationError } from "@/infrastructure/errors/application-error";

export type VariantOptionValues = Record<string, string>;

export function normalizeSlug(input: string): string {
  return input
    .trim()
    .normalize("NFKD")
    .replaceAll(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, "-")
    .replaceAll(/^-+|-+$/g, "")
    .replaceAll(/-{2,}/g, "-");
}

export function ensureSlug(input: string): string {
  const slug = normalizeSlug(input);

  if (!slug) {
    throw new ApplicationError({
      code: "VALIDATION_FAILED",
      message: "A valid slug is required.",
      status: 400,
      expose: true,
    });
  }

  return slug;
}

export function isPublicProductStatus(status: string): boolean {
  return status === "ACTIVE";
}

export function validatePriceInput(input: {
  currency: string;
  amountMinor: number;
  compareAtAmountMinor?: number | null;
}): void {
  if (!/^[A-Z]{3}$/.test(input.currency)) {
    throw new ApplicationError({
      code: "VALIDATION_FAILED",
      message: "Currency must be an ISO 4217 uppercase code.",
      status: 400,
      expose: true,
    });
  }

  if (!Number.isInteger(input.amountMinor) || input.amountMinor <= 0) {
    throw new ApplicationError({
      code: "VALIDATION_FAILED",
      message: "Price must be a positive integer minor-unit amount.",
      status: 400,
      expose: true,
    });
  }

  if (
    input.compareAtAmountMinor != null &&
    (!Number.isInteger(input.compareAtAmountMinor) ||
      input.compareAtAmountMinor <= input.amountMinor)
  ) {
    throw new ApplicationError({
      code: "VALIDATION_FAILED",
      message: "Compare-at price must be higher than the active price.",
      status: 400,
      expose: true,
    });
  }
}

export function validateVariantOptionValues(input: unknown): VariantOptionValues {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new ApplicationError({
      code: "VALIDATION_FAILED",
      message: "Variant option values must be an object.",
      status: 400,
      expose: true,
    });
  }

  const entries: [string, unknown][] = Object.entries(
    input as Record<string, unknown>,
  ).map(([key, value]) => [key.trim(), typeof value === "string" ? value.trim() : value]);

  if (entries.length === 0 || entries.length > 8) {
    throw new ApplicationError({
      code: "VALIDATION_FAILED",
      message: "A variant must include between 1 and 8 option values.",
      status: 400,
      expose: true,
    });
  }

  const normalizedKeys = new Set<string>();
  const options: VariantOptionValues = {};

  for (const [key, value] of entries) {
    if (
      !key ||
      key.length > 40 ||
      typeof value !== "string" ||
      !value ||
      value.length > 80
    ) {
      throw new ApplicationError({
        code: "VALIDATION_FAILED",
        message: "Variant option names and values must be non-empty strings.",
        status: 400,
        expose: true,
      });
    }

    const normalizedKey = key.toLowerCase();
    if (normalizedKeys.has(normalizedKey)) {
      throw new ApplicationError({
        code: "VALIDATION_FAILED",
        message: "Variant option names must be unique.",
        status: 400,
        expose: true,
      });
    }

    normalizedKeys.add(normalizedKey);
    options[key] = value;
  }

  return options;
}

export function calculateAvailableQuantity(input: {
  quantityOnHand: number;
  quantityReserved: number;
}): number {
  return input.quantityOnHand - input.quantityReserved;
}

export function assertInventoryAdjustmentAllowed(input: {
  quantityOnHand: number;
  quantityReserved: number;
  allowBackorder: boolean;
  quantityDelta: number;
}): number {
  if (!Number.isInteger(input.quantityDelta) || input.quantityDelta === 0) {
    throw new ApplicationError({
      code: "VALIDATION_FAILED",
      message: "Inventory adjustment quantity must be a non-zero integer.",
      status: 400,
      expose: true,
    });
  }

  const resultingQuantity = input.quantityOnHand + input.quantityDelta;

  if (resultingQuantity < 0) {
    throw new ApplicationError({
      code: "VALIDATION_FAILED",
      message: "Inventory on hand cannot become negative.",
      status: 400,
      expose: true,
    });
  }

  if (!input.allowBackorder && input.quantityReserved > resultingQuantity) {
    throw new ApplicationError({
      code: "VALIDATION_FAILED",
      message: "Adjustment would make reserved stock exceed on-hand stock.",
      status: 400,
      expose: true,
    });
  }

  return resultingQuantity;
}

export function formatMoney(input: { amountMinor: number; currency: string }): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: input.currency,
    maximumFractionDigits: 0,
  }).format(input.amountMinor / 100);
}

export function inventoryLabel(input: {
  trackInventory: boolean;
  allowBackorder: boolean;
  quantityOnHand: number;
  quantityReserved: number;
  reorderThreshold: number;
}): "Untracked" | "Backorder" | "Out of stock" | "Low stock" | "In stock" {
  if (!input.trackInventory) return "Untracked";

  const available = calculateAvailableQuantity(input);

  if (available <= 0 && input.allowBackorder) return "Backorder";
  if (available <= 0) return "Out of stock";
  if (available <= input.reorderThreshold) return "Low stock";

  return "In stock";
}
