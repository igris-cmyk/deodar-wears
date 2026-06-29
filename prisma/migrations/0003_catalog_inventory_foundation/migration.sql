CREATE TYPE "ProductStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');
CREATE TYPE "ProductMediaType" AS ENUM ('IMAGE');
CREATE TYPE "InventoryAdjustmentType" AS ENUM (
  'INITIAL',
  'RECEIPT',
  'CORRECTION',
  'DAMAGE',
  'RETURN',
  'MANUAL'
);

CREATE TABLE "products" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "slug" varchar(160) NOT NULL UNIQUE,
  "name" varchar(180) NOT NULL,
  "short_description" varchar(260) NOT NULL,
  "description" text NOT NULL,
  "status" "ProductStatus" NOT NULL DEFAULT 'DRAFT',
  "featured" boolean NOT NULL DEFAULT false,
  "seo_title" varchar(180),
  "seo_description" varchar(320),
  "created_at" timestamptz(6) NOT NULL DEFAULT now(),
  "updated_at" timestamptz(6) NOT NULL DEFAULT now(),
  CONSTRAINT "product_slug_format"
    CHECK ("slug" ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  CONSTRAINT "product_name_not_blank"
    CHECK (length(trim("name")) > 0),
  CONSTRAINT "product_short_description_not_blank"
    CHECK (length(trim("short_description")) > 0),
  CONSTRAINT "product_description_not_blank"
    CHECK (length(trim("description")) > 0)
);

CREATE INDEX "product_public_listing_idx"
  ON "products" ("status", "featured", "updated_at");
CREATE INDEX "product_featured_status_idx"
  ON "products" ("featured", "status");
CREATE INDEX "product_updated_at_idx"
  ON "products" ("updated_at");

CREATE TABLE "product_variants" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "product_id" uuid NOT NULL REFERENCES "products"("id") ON DELETE RESTRICT,
  "sku" varchar(80) NOT NULL UNIQUE,
  "title" varchar(180) NOT NULL,
  "barcode" varchar(120) UNIQUE,
  "option_values" jsonb NOT NULL,
  "active" boolean NOT NULL DEFAULT true,
  "sort_position" integer NOT NULL DEFAULT 0,
  "created_at" timestamptz(6) NOT NULL DEFAULT now(),
  "updated_at" timestamptz(6) NOT NULL DEFAULT now(),
  CONSTRAINT "product_variant_sku_not_blank"
    CHECK (length(trim("sku")) > 0),
  CONSTRAINT "product_variant_title_not_blank"
    CHECK (length(trim("title")) > 0),
  CONSTRAINT "product_variant_options_object"
    CHECK (jsonb_typeof("option_values") = 'object'),
  CONSTRAINT "product_variant_sort_nonnegative"
    CHECK ("sort_position" >= 0)
);

CREATE INDEX "product_variant_product_active_sort_idx"
  ON "product_variants" ("product_id", "active", "sort_position");
CREATE INDEX "product_variant_sku_idx" ON "product_variants" ("sku");

CREATE TABLE "categories" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "slug" varchar(140) NOT NULL UNIQUE,
  "name" varchar(160) NOT NULL,
  "description" text NOT NULL,
  "active" boolean NOT NULL DEFAULT true,
  "sort_order" integer NOT NULL DEFAULT 0,
  "created_at" timestamptz(6) NOT NULL DEFAULT now(),
  "updated_at" timestamptz(6) NOT NULL DEFAULT now(),
  CONSTRAINT "category_slug_format"
    CHECK ("slug" ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  CONSTRAINT "category_name_not_blank"
    CHECK (length(trim("name")) > 0),
  CONSTRAINT "category_description_not_blank"
    CHECK (length(trim("description")) > 0),
  CONSTRAINT "category_sort_order_nonnegative"
    CHECK ("sort_order" >= 0)
);

CREATE INDEX "category_active_sort_idx"
  ON "categories" ("active", "sort_order", "name");

CREATE TABLE "collections" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "slug" varchar(140) NOT NULL UNIQUE,
  "name" varchar(160) NOT NULL,
  "description" text NOT NULL,
  "active" boolean NOT NULL DEFAULT true,
  "featured" boolean NOT NULL DEFAULT false,
  "sort_order" integer NOT NULL DEFAULT 0,
  "created_at" timestamptz(6) NOT NULL DEFAULT now(),
  "updated_at" timestamptz(6) NOT NULL DEFAULT now(),
  CONSTRAINT "collection_slug_format"
    CHECK ("slug" ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  CONSTRAINT "collection_name_not_blank"
    CHECK (length(trim("name")) > 0),
  CONSTRAINT "collection_description_not_blank"
    CHECK (length(trim("description")) > 0),
  CONSTRAINT "collection_sort_order_nonnegative"
    CHECK ("sort_order" >= 0)
);

CREATE INDEX "collection_active_featured_sort_idx"
  ON "collections" ("active", "featured", "sort_order");

CREATE TABLE "product_categories" (
  "product_id" uuid NOT NULL REFERENCES "products"("id") ON DELETE CASCADE,
  "category_id" uuid NOT NULL REFERENCES "categories"("id") ON DELETE CASCADE,
  "sort_position" integer NOT NULL DEFAULT 0,
  "created_at" timestamptz(6) NOT NULL DEFAULT now(),
  PRIMARY KEY ("product_id", "category_id"),
  CONSTRAINT "product_category_sort_nonnegative"
    CHECK ("sort_position" >= 0)
);

CREATE INDEX "product_category_category_sort_idx"
  ON "product_categories" ("category_id", "sort_position");

CREATE TABLE "product_collections" (
  "product_id" uuid NOT NULL REFERENCES "products"("id") ON DELETE CASCADE,
  "collection_id" uuid NOT NULL REFERENCES "collections"("id") ON DELETE CASCADE,
  "sort_position" integer NOT NULL DEFAULT 0,
  "created_at" timestamptz(6) NOT NULL DEFAULT now(),
  PRIMARY KEY ("product_id", "collection_id"),
  CONSTRAINT "product_collection_sort_nonnegative"
    CHECK ("sort_position" >= 0)
);

CREATE INDEX "product_collection_collection_sort_idx"
  ON "product_collections" ("collection_id", "sort_position");

CREATE TABLE "product_media" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "product_id" uuid NOT NULL REFERENCES "products"("id") ON DELETE RESTRICT,
  "variant_id" uuid REFERENCES "product_variants"("id") ON DELETE SET NULL,
  "url" text NOT NULL,
  "alt_text" varchar(240) NOT NULL,
  "media_type" "ProductMediaType" NOT NULL DEFAULT 'IMAGE',
  "sort_position" integer NOT NULL DEFAULT 0,
  "is_primary" boolean NOT NULL DEFAULT false,
  "created_at" timestamptz(6) NOT NULL DEFAULT now(),
  "updated_at" timestamptz(6) NOT NULL DEFAULT now(),
  CONSTRAINT "product_media_url_not_blank"
    CHECK (length(trim("url")) > 0),
  CONSTRAINT "product_media_alt_text_not_blank"
    CHECK (length(trim("alt_text")) > 0),
  CONSTRAINT "product_media_sort_nonnegative"
    CHECK ("sort_position" >= 0)
);

CREATE INDEX "product_media_product_primary_sort_idx"
  ON "product_media" ("product_id", "is_primary", "sort_position");
CREATE INDEX "product_media_variant_sort_idx"
  ON "product_media" ("variant_id", "sort_position");
CREATE UNIQUE INDEX "product_media_one_primary_per_product_idx"
  ON "product_media" ("product_id")
  WHERE "is_primary" = true;

CREATE TABLE "product_prices" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "variant_id" uuid NOT NULL REFERENCES "product_variants"("id") ON DELETE RESTRICT,
  "currency" varchar(3) NOT NULL,
  "amount_minor" integer NOT NULL,
  "compare_at_amount_minor" integer,
  "active" boolean NOT NULL DEFAULT true,
  "created_at" timestamptz(6) NOT NULL DEFAULT now(),
  "updated_at" timestamptz(6) NOT NULL DEFAULT now(),
  CONSTRAINT "product_price_currency_format"
    CHECK ("currency" ~ '^[A-Z]{3}$'),
  CONSTRAINT "product_price_amount_positive"
    CHECK ("amount_minor" > 0),
  CONSTRAINT "product_price_compare_at_higher"
    CHECK (
      "compare_at_amount_minor" IS NULL
      OR "compare_at_amount_minor" > "amount_minor"
    )
);

CREATE INDEX "product_price_variant_currency_active_idx"
  ON "product_prices" ("variant_id", "currency", "active");
CREATE UNIQUE INDEX "product_price_one_active_per_variant_currency_idx"
  ON "product_prices" ("variant_id", "currency")
  WHERE "active" = true;

CREATE TABLE "inventory_items" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "variant_id" uuid NOT NULL UNIQUE REFERENCES "product_variants"("id") ON DELETE RESTRICT,
  "quantity_on_hand" integer NOT NULL DEFAULT 0,
  "quantity_reserved" integer NOT NULL DEFAULT 0,
  "reorder_threshold" integer NOT NULL DEFAULT 0,
  "track_inventory" boolean NOT NULL DEFAULT true,
  "allow_backorder" boolean NOT NULL DEFAULT false,
  "created_at" timestamptz(6) NOT NULL DEFAULT now(),
  "updated_at" timestamptz(6) NOT NULL DEFAULT now(),
  CONSTRAINT "inventory_item_quantities_nonnegative"
    CHECK (
      "quantity_on_hand" >= 0
      AND "quantity_reserved" >= 0
      AND "reorder_threshold" >= 0
    ),
  CONSTRAINT "inventory_item_reserved_possible"
    CHECK ("allow_backorder" = true OR "quantity_reserved" <= "quantity_on_hand")
);

CREATE INDEX "inventory_item_availability_idx"
  ON "inventory_items" ("track_inventory", "quantity_on_hand", "quantity_reserved");
CREATE INDEX "inventory_item_reorder_idx"
  ON "inventory_items" ("quantity_on_hand", "reorder_threshold");

CREATE TABLE "inventory_adjustments" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "inventory_item_id" uuid NOT NULL REFERENCES "inventory_items"("id") ON DELETE RESTRICT,
  "type" "InventoryAdjustmentType" NOT NULL,
  "quantity_delta" integer NOT NULL,
  "previous_quantity" integer NOT NULL,
  "resulting_quantity" integer NOT NULL,
  "reason" text NOT NULL,
  "actor_user_id" uuid REFERENCES "user"("id") ON DELETE SET NULL,
  "request_id" varchar(128) NOT NULL,
  "created_at" timestamptz(6) NOT NULL DEFAULT now(),
  CONSTRAINT "inventory_adjustment_delta_nonzero"
    CHECK ("quantity_delta" <> 0),
  CONSTRAINT "inventory_adjustment_quantities_nonnegative"
    CHECK ("previous_quantity" >= 0 AND "resulting_quantity" >= 0),
  CONSTRAINT "inventory_adjustment_math"
    CHECK ("resulting_quantity" = "previous_quantity" + "quantity_delta"),
  CONSTRAINT "inventory_adjustment_reason_not_blank"
    CHECK (length(trim("reason")) >= 8)
);

CREATE INDEX "inventory_adjustment_item_created_idx"
  ON "inventory_adjustments" ("inventory_item_id", "created_at");
CREATE INDEX "inventory_adjustment_request_idx"
  ON "inventory_adjustments" ("request_id");
CREATE INDEX "inventory_adjustment_actor_created_idx"
  ON "inventory_adjustments" ("actor_user_id", "created_at");

CREATE OR REPLACE FUNCTION prevent_inventory_adjustment_mutation()
RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'inventory adjustments are append-only';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER inventory_adjustments_no_update
BEFORE UPDATE ON "inventory_adjustments"
FOR EACH ROW EXECUTE FUNCTION prevent_inventory_adjustment_mutation();

CREATE TRIGGER inventory_adjustments_no_delete
BEFORE DELETE ON "inventory_adjustments"
FOR EACH ROW EXECUTE FUNCTION prevent_inventory_adjustment_mutation();
