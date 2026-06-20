import type { ReactNode } from "react";

import type { getProductEditorData } from "@/modules/catalog/catalog.queries";
import { Button, Input, Select, Textarea } from "@/components/ui/primitives";

type EditorData = Awaited<ReturnType<typeof getProductEditorData>>;
type Product = NonNullable<EditorData["product"]>;
type Variant = Product["variants"][number];

export function ProductEditorForm({
  action,
  categories,
  collections,
  product,
}: {
  action: (formData: FormData) => Promise<void>;
  categories: EditorData["categories"];
  collections: EditorData["collections"];
  product: EditorData["product"];
}) {
  const assignedCategoryIds = new Set(
    product?.categories.map((entry) => entry.categoryId) ?? [],
  );
  const assignedCollectionIds = new Set(
    product?.collections.map((entry) => entry.collectionId) ?? [],
  );
  const media = product?.media[0];
  const variants = product?.variants.length
    ? [...product.variants, blankVariant()]
    : [blankVariant()];

  return (
    <form action={action} className="grid gap-8">
      <section className="grid gap-4 border-y border-[var(--border)] py-6">
        <div>
          <p className="label text-[var(--accent)]">General</p>
          <h2 className="heading-3 mt-2">Product identity</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Name" name="name">
            <Input name="name" required defaultValue={product?.name ?? ""} />
          </Field>
          <Field label="Slug" name="slug">
            <Input name="slug" required defaultValue={product?.slug ?? ""} />
          </Field>
          <Field label="Status" name="status">
            <Select name="status" defaultValue={product?.status ?? "DRAFT"}>
              <option value="DRAFT">Draft</option>
              <option value="ACTIVE">Active</option>
              <option value="ARCHIVED">Archived</option>
            </Select>
          </Field>
          <label className="flex min-h-11 items-center gap-3 text-sm font-semibold">
            <input
              className="size-5 accent-[var(--brand)]"
              type="checkbox"
              name="featured"
              defaultChecked={product?.featured ?? false}
            />
            Featured product
          </label>
        </div>
        <Field label="Short description" name="shortDescription">
          <Input
            name="shortDescription"
            required
            defaultValue={product?.shortDescription ?? ""}
          />
        </Field>
        <Field label="Description" name="description">
          <Textarea name="description" required defaultValue={product?.description ?? ""} />
        </Field>
      </section>

      <section className="grid gap-4 border-b border-[var(--border)] pb-6">
        <div>
          <p className="label text-[var(--accent)]">Media</p>
          <h2 className="heading-3 mt-2">Primary image</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Image path" name="mediaUrl">
            <Input
              name="mediaUrl"
              required
              defaultValue={media?.url ?? "/catalog/deodar-overshirt.svg"}
            />
          </Field>
          <Field label="Alt text" name="mediaAltText">
            <Input
              name="mediaAltText"
              required
              defaultValue={media?.altText ?? "Deodar Wears product image"}
            />
          </Field>
        </div>
      </section>

      <section className="grid gap-5 border-b border-[var(--border)] pb-6">
        <div>
          <p className="label text-[var(--accent)]">Variants</p>
          <h2 className="heading-3 mt-2">Options, price and inventory</h2>
        </div>
        <div className="grid gap-5">
          {variants.map((variant, index) => (
            <VariantFields key={variant.id ?? `blank-${index}`} variant={variant} />
          ))}
        </div>
      </section>

      <section className="grid gap-4 border-b border-[var(--border)] pb-6">
        <div>
          <p className="label text-[var(--accent)]">Organization</p>
          <h2 className="heading-3 mt-2">Categories and collections</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="grid gap-2">
            <p className="text-sm font-semibold">Categories</p>
            {categories.map((category) => (
              <label className="flex items-center gap-3 text-sm" key={category.id}>
                <input
                  className="size-5 accent-[var(--brand)]"
                  type="checkbox"
                  name="categoryIds"
                  value={category.id}
                  defaultChecked={assignedCategoryIds.has(category.id)}
                />
                {category.name}
              </label>
            ))}
          </div>
          <div className="grid gap-2">
            <p className="text-sm font-semibold">Collections</p>
            {collections.map((collection) => (
              <label className="flex items-center gap-3 text-sm" key={collection.id}>
                <input
                  className="size-5 accent-[var(--brand)]"
                  type="checkbox"
                  name="collectionIds"
                  value={collection.id}
                  defaultChecked={assignedCollectionIds.has(collection.id)}
                />
                {collection.name}
              </label>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 border-b border-[var(--border)] pb-6">
        <div>
          <p className="label text-[var(--accent)]">SEO</p>
          <h2 className="heading-3 mt-2">Search metadata</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="SEO title" name="seoTitle">
            <Input name="seoTitle" defaultValue={product?.seoTitle ?? ""} />
          </Field>
          <Field label="SEO description" name="seoDescription">
            <Input name="seoDescription" defaultValue={product?.seoDescription ?? ""} />
          </Field>
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <Button type="submit">Save product</Button>
      </div>
    </form>
  );
}

function VariantFields({ variant }: { variant: Variant | ReturnType<typeof blankVariant> }) {
  const optionValues = variant.optionValues as Record<string, string>;
  const price = "prices" in variant ? variant.prices[0] : undefined;
  const inventory = "inventoryItem" in variant ? variant.inventoryItem : undefined;

  return (
    <fieldset className="grid gap-4 border border-[var(--border)] p-4">
      <legend className="px-2 text-sm font-semibold">
        {variant.sku ? variant.title || variant.sku : "Additional variant"}
      </legend>
      <div className="grid gap-4 md:grid-cols-3">
        <Field label="SKU" name="variantSku">
          <Input name="variantSku" defaultValue={variant.sku} />
        </Field>
        <Field label="Variant title" name="variantTitle">
          <Input name="variantTitle" defaultValue={variant.title} />
        </Field>
        <Field label="Active" name="variantActive">
          <Select name="variantActive" defaultValue={String(variant.active)}>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </Select>
        </Field>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <Field label="Size" name="optionSize">
          <Input name="optionSize" defaultValue={optionValues.Size ?? ""} />
        </Field>
        <Field label="Waist" name="optionWaist">
          <Input name="optionWaist" defaultValue={optionValues.Waist ?? ""} />
        </Field>
        <Field label="Color" name="optionColor">
          <Input name="optionColor" defaultValue={optionValues.Color ?? ""} />
        </Field>
        <Field label="Fit" name="optionFit">
          <Input name="optionFit" defaultValue={optionValues.Fit ?? ""} />
        </Field>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <Field label="Currency" name="currency">
          <Input name="currency" defaultValue={price?.currency ?? "INR"} />
        </Field>
        <Field label="Price minor units" name="amountMinor">
          <Input
            name="amountMinor"
            inputMode="numeric"
            defaultValue={price?.amountMinor ?? 0}
          />
        </Field>
        <Field label="Compare-at minor units" name="compareAtAmountMinor">
          <Input
            name="compareAtAmountMinor"
            inputMode="numeric"
            defaultValue={price?.compareAtAmountMinor ?? ""}
          />
        </Field>
        <Field label="Barcode" name="barcode">
          <Input name="barcode" defaultValue={variant.barcode ?? ""} />
        </Field>
      </div>
      <div className="grid gap-4 md:grid-cols-5">
        <Field label="On hand" name="quantityOnHand">
          <Input
            name="quantityOnHand"
            inputMode="numeric"
            defaultValue={inventory?.quantityOnHand ?? 0}
          />
        </Field>
        <Field label="Reserved" name="quantityReserved">
          <Input
            name="quantityReserved"
            inputMode="numeric"
            defaultValue={inventory?.quantityReserved ?? 0}
          />
        </Field>
        <Field label="Reorder threshold" name="reorderThreshold">
          <Input
            name="reorderThreshold"
            inputMode="numeric"
            defaultValue={inventory?.reorderThreshold ?? 0}
          />
        </Field>
        <Field label="Track inventory" name="trackInventory">
          <Select
            name="trackInventory"
            defaultValue={String(inventory?.trackInventory ?? true)}
          >
            <option value="true">Track</option>
            <option value="false">Do not track</option>
          </Select>
        </Field>
        <Field label="Backorder" name="allowBackorder">
          <Select
            name="allowBackorder"
            defaultValue={String(inventory?.allowBackorder ?? false)}
          >
            <option value="false">No</option>
            <option value="true">Allow</option>
          </Select>
        </Field>
      </div>
    </fieldset>
  );
}

function Field({
  children,
  label,
}: {
  children: ReactNode;
  label: string;
  name?: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold">
      {label}
      {children}
    </label>
  );
}

function blankVariant() {
  return {
    id: "",
    sku: "",
    title: "",
    barcode: "",
    optionValues: {},
    active: true,
    prices: [],
    inventoryItem: null,
  };
}
