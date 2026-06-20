import "server-only";

import type { Prisma } from "@prisma/client";
import { unstable_cache } from "next/cache";

import { prisma } from "@/infrastructure/database/prisma";

import {
  calculateAvailableQuantity,
  formatMoney,
  inventoryLabel,
  type VariantOptionValues,
} from "./catalog.helpers";
import { adminCatalogSearchSchema, publicCatalogSearchSchema } from "./catalog.schemas";
import {
  CATALOG_PAGE_SIZE,
  HOMEPAGE_PRODUCT_LIMIT,
  PUBLIC_CATALOG_CACHE_TAG,
  PUBLIC_MEDIA_LIMIT,
  PUBLIC_VARIANT_LIMIT,
  RELATED_PRODUCT_LIMIT,
  SEASONAL_COLLECTION_SLUGS,
} from "./catalog.constants";

const PRICE_SORT_LIMIT = 96;
export { CATALOG_PAGE_SIZE } from "./catalog.constants";

const publicProductCardSelect = {
  slug: true,
  name: true,
  shortDescription: true,
  featured: true,
  media: {
    orderBy: [{ isPrimary: "desc" }, { sortPosition: "asc" }],
    take: 1,
    select: { url: true, altText: true },
  },
  categories: {
    orderBy: { sortPosition: "asc" },
    take: 12,
    select: { category: { select: { slug: true, name: true, active: true } } },
  },
  collections: {
    orderBy: { sortPosition: "asc" },
    take: 12,
    select: { collection: { select: { slug: true, name: true, active: true } } },
  },
  variants: {
    where: { active: true },
    orderBy: { sortPosition: "asc" },
    take: PUBLIC_VARIANT_LIMIT,
    select: {
      prices: {
        where: { active: true },
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          amountMinor: true,
          currency: true,
          compareAtAmountMinor: true,
        },
      },
      inventoryItem: {
        select: {
          trackInventory: true,
          allowBackorder: true,
          quantityOnHand: true,
          quantityReserved: true,
          reorderThreshold: true,
        },
      },
    },
  },
} satisfies Prisma.ProductSelect;

const publicProductDetailSelect = {
  ...publicProductCardSelect,
  description: true,
  seoTitle: true,
  seoDescription: true,
  media: {
    orderBy: [{ isPrimary: "desc" }, { sortPosition: "asc" }],
    take: PUBLIC_MEDIA_LIMIT,
    select: { url: true, altText: true },
  },
  variants: {
    where: { active: true },
    orderBy: { sortPosition: "asc" },
    take: PUBLIC_VARIANT_LIMIT,
    select: {
      id: true,
      sku: true,
      title: true,
      optionValues: true,
      prices: {
        where: { active: true },
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          amountMinor: true,
          currency: true,
          compareAtAmountMinor: true,
        },
      },
      inventoryItem: {
        select: {
          trackInventory: true,
          allowBackorder: true,
          quantityOnHand: true,
          quantityReserved: true,
          reorderThreshold: true,
        },
      },
    },
  },
} satisfies Prisma.ProductSelect;

type ProductCardRecord = Prisma.ProductGetPayload<{
  select: typeof publicProductCardSelect;
}>;
type ProductDetailRecord = Prisma.ProductGetPayload<{
  select: typeof publicProductDetailSelect;
}>;

type PricedVariant = {
  prices: {
    amountMinor: number;
    currency: string;
    compareAtAmountMinor?: number | null;
  }[];
};

type InventoryVariant = {
  inventoryItem: {
    trackInventory: boolean;
    allowBackorder: boolean;
    quantityOnHand: number;
    quantityReserved: number;
    reorderThreshold: number;
  } | null;
};

export type ProductCardView = {
  slug: string;
  name: string;
  shortDescription: string;
  featured: boolean;
  primaryImage: { url: string; altText: string } | null;
  priceLabel: string;
  compareAtLabel?: string;
  availabilityLabel: string;
  categories: { slug: string; name: string }[];
  collections: { slug: string; name: string }[];
};

export type ProductDetailView = ProductCardView & {
  description: string;
  seoTitle?: string;
  seoDescription?: string;
  gallery: { url: string; altText: string }[];
  variants: {
    id: string;
    sku: string;
    title: string;
    optionValues: VariantOptionValues;
    priceLabel: string;
    compareAtLabel?: string;
    availableQuantity: number | null;
    availabilityLabel: string;
  }[];
};

const getCachedStorefrontHomeData = unstable_cache(
  loadStorefrontHomeData,
  ["storefront-home-v3"],
  { revalidate: 300, tags: [PUBLIC_CATALOG_CACHE_TAG] },
);

export async function getStorefrontHomeData() {
  return getCachedStorefrontHomeData();
}

async function loadStorefrontHomeData() {
  const [seasonalCollections, categories, products] = await Promise.all([
    prisma.collection.findMany({
      where: { active: true, slug: { in: [...SEASONAL_COLLECTION_SLUGS] } },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      take: SEASONAL_COLLECTION_SLUGS.length,
      select: {
        slug: true,
        name: true,
        description: true,
        products: {
          where: { product: { status: "ACTIVE" } },
          orderBy: [{ sortPosition: "asc" }, { product: { name: "asc" } }],
          take: 1,
          select: {
            product: {
              select: {
                media: {
                  orderBy: [{ isPrimary: "desc" }, { sortPosition: "asc" }],
                  take: 1,
                  select: { url: true, altText: true },
                },
              },
            },
          },
        },
      },
    }),
    prisma.category.findMany({
      where: { active: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      take: 4,
      select: { slug: true, name: true, description: true },
    }),
    prisma.product.findMany({
      where: { status: "ACTIVE" },
      select: publicProductCardSelect,
      orderBy: [{ featured: "desc" }, { updatedAt: "desc" }, { name: "asc" }],
      take: HOMEPAGE_PRODUCT_LIMIT,
    }),
  ]);

  const productViews = products.map(toProductCardView);

  return {
    seasonalCollections: seasonalCollections.map((collection) => {
      const image = collection.products[0]?.product.media[0];
      return {
        slug: collection.slug,
        name: collection.name,
        description: collection.description,
        image: image ? { url: image.url, altText: image.altText } : null,
      };
    }),
    categories,
    featuredProducts: productViews.filter((product) => product.featured).slice(0, 4),
    newArrivals: productViews,
  };
}

export async function getShopCatalog(input: unknown) {
  const filters = publicCatalogSearchSchema.parse(input);

  if (process.env.NODE_ENV === "test" || process.env.VITEST === "true") {
    return loadShopCatalog(filters);
  }

  return getCachedShopCatalog(filters);
}

const getCachedShopCatalog = unstable_cache(loadShopCatalog, ["shop-catalog-v2"], {
  revalidate: 300,
  tags: [PUBLIC_CATALOG_CACHE_TAG],
});

async function loadShopCatalog(
  filters: ReturnType<typeof publicCatalogSearchSchema.parse>,
) {
  const page = filters.page;
  const where = publicProductWhere(filters);
  const orderBy: Prisma.ProductOrderByWithRelationInput[] =
    filters.sort === "name"
      ? [{ name: "asc" }, { updatedAt: "desc" }]
      : [{ updatedAt: "desc" }, { name: "asc" }];

  const [categories, collections, totalCount, products] = await Promise.all([
    prisma.category.findMany({
      where: { active: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      take: 24,
      select: { slug: true, name: true },
    }),
    prisma.collection.findMany({
      where: { active: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      take: 32,
      select: { slug: true, name: true },
    }),
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      select: publicProductCardSelect,
      orderBy,
      skip: needsPriceSort(filters.sort) ? 0 : (page - 1) * CATALOG_PAGE_SIZE,
      take: needsPriceSort(filters.sort) ? PRICE_SORT_LIMIT : CATALOG_PAGE_SIZE,
    }),
  ]);

  const sortedProducts = needsPriceSort(filters.sort)
    ? sortProductsByPrice(products, filters.sort).slice(
        (page - 1) * CATALOG_PAGE_SIZE,
        page * CATALOG_PAGE_SIZE,
      )
    : products;

  return {
    filters,
    categories,
    collections,
    products: sortedProducts.map(toProductCardView),
    totalCount,
    pageCount: Math.max(1, Math.ceil(totalCount / CATALOG_PAGE_SIZE)),
  };
}

const getCachedProductDetail = unstable_cache(queryProductDetail, ["product-detail-v2"], {
  revalidate: 300,
  tags: [PUBLIC_CATALOG_CACHE_TAG],
});

export async function getProductDetail(slug: string) {
  if (process.env.NODE_ENV === "test" || process.env.VITEST === "true") {
    return queryProductDetail(slug);
  }

  return getCachedProductDetail(slug);
}

async function queryProductDetail(slug: string) {
  const product = await prisma.product.findFirst({
    where: { slug, status: "ACTIVE" },
    select: publicProductDetailSelect,
  });

  return product ? toProductDetailView(product) : null;
}

export async function getRelatedProducts(slug: string, categorySlugs: string[]) {
  if (categorySlugs.length === 0) return [];
  return getCachedRelatedProducts(slug, [...categorySlugs].sort());
}

const getCachedRelatedProducts = unstable_cache(
  loadRelatedProducts,
  ["related-products-v2"],
  { revalidate: 300, tags: [PUBLIC_CATALOG_CACHE_TAG] },
);

async function loadRelatedProducts(slug: string, categorySlugs: string[]) {
  const products = await prisma.product.findMany({
    where: {
      status: "ACTIVE",
      slug: { not: slug },
      categories: { some: { category: { slug: { in: categorySlugs }, active: true } } },
    },
    select: publicProductCardSelect,
    orderBy: [{ featured: "desc" }, { updatedAt: "desc" }],
    take: RELATED_PRODUCT_LIMIT,
  });

  return products.map(toProductCardView);
}

export async function getAdminProductList(input: unknown) {
  const filters = adminCatalogSearchSchema.parse(input);
  const where: Prisma.ProductWhereInput = {
    ...(filters.status === "ALL" ? {} : { status: filters.status }),
    ...(filters.q
      ? {
          OR: [
            { name: { contains: filters.q, mode: "insensitive" } },
            { slug: { contains: filters.q, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(filters.category
      ? { categories: { some: { category: { slug: filters.category } } } }
      : {}),
  };

  const [categories, totalCount, products] = await Promise.all([
    prisma.category.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }),
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      include: {
        _count: { select: { variants: true } },
        categories: { include: { category: true } },
        variants: {
          include: {
            prices: { where: { active: true } },
            inventoryItem: true,
          },
        },
      },
      orderBy: [{ updatedAt: "desc" }, { name: "asc" }],
      skip: (filters.page - 1) * CATALOG_PAGE_SIZE,
      take: CATALOG_PAGE_SIZE,
    }),
  ]);

  return {
    filters,
    categories,
    products: products.map((product) => ({
      id: product.id,
      slug: product.slug,
      name: product.name,
      status: product.status,
      featured: product.featured,
      variantCount: product._count.variants,
      priceLabel: priceRangeLabel(product.variants),
      inventoryStatus: productInventoryStatus(product.variants),
      updatedAt: product.updatedAt,
    })),
    totalCount,
    pageCount: Math.max(1, Math.ceil(totalCount / CATALOG_PAGE_SIZE)),
  };
}

export async function getProductEditorData(id?: string) {
  const [categories, collections, product] = await Promise.all([
    prisma.category.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }),
    prisma.collection.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] }),
    id
      ? prisma.product.findUnique({
          where: { id },
          include: {
            categories: true,
            collections: true,
            media: { orderBy: [{ isPrimary: "desc" }, { sortPosition: "asc" }] },
            variants: {
              orderBy: { sortPosition: "asc" },
              include: {
                prices: {
                  where: { active: true },
                  orderBy: { createdAt: "desc" },
                  take: 1,
                },
                inventoryItem: true,
              },
            },
          },
        })
      : null,
  ]);

  return { categories, collections, product };
}

export async function getCategoryAdminData() {
  return prisma.category.findMany({ orderBy: [{ sortOrder: "asc" }, { name: "asc" }] });
}

export async function getCollectionAdminData() {
  return prisma.collection.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
}

export function toProductCardView(product: ProductCardRecord): ProductCardView {
  const primaryImage = product.media[0]
    ? { url: product.media[0].url, altText: product.media[0].altText }
    : null;

  return {
    slug: product.slug,
    name: product.name,
    shortDescription: product.shortDescription,
    featured: product.featured,
    primaryImage,
    priceLabel: priceRangeLabel(product.variants),
    compareAtLabel: compareAtRangeLabel(product.variants),
    availabilityLabel: productInventoryStatus(product.variants),
    categories: product.categories
      .filter((entry) => entry.category.active)
      .map((entry) => ({ slug: entry.category.slug, name: entry.category.name })),
    collections: product.collections
      .filter((entry) => entry.collection.active)
      .map((entry) => ({ slug: entry.collection.slug, name: entry.collection.name })),
  };
}

function toProductDetailView(product: ProductDetailRecord): ProductDetailView {
  const card = toProductCardView(product);

  return {
    ...card,
    description: product.description,
    seoTitle: product.seoTitle ?? undefined,
    seoDescription: product.seoDescription ?? undefined,
    gallery: product.media.map((media) => ({
      url: media.url,
      altText: media.altText,
    })),
    variants: product.variants.map((variant) => {
      const price = variant.prices[0];
      const inventory = variant.inventoryItem;
      const availableQuantity = inventory ? calculateAvailableQuantity(inventory) : null;

      return {
        id: variant.id,
        sku: variant.sku,
        title: variant.title,
        optionValues: variant.optionValues as VariantOptionValues,
        priceLabel: price ? formatMoney(price) : "Price pending",
        compareAtLabel: price?.compareAtAmountMinor
          ? formatMoney({
              amountMinor: price.compareAtAmountMinor,
              currency: price.currency,
            })
          : undefined,
        availableQuantity,
        availabilityLabel: inventory ? inventoryLabel(inventory) : "Untracked",
      };
    }),
  };
}

function publicProductWhere(
  filters: ReturnType<typeof publicCatalogSearchSchema.parse>,
): Prisma.ProductWhereInput {
  return {
    status: "ACTIVE",
    ...(filters.q
      ? {
          OR: [
            { name: { contains: filters.q, mode: "insensitive" } },
            { shortDescription: { contains: filters.q, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(filters.category
      ? { categories: { some: { category: { slug: filters.category, active: true } } } }
      : {}),
    ...(filters.collection
      ? {
          collections: {
            some: { collection: { slug: filters.collection, active: true } },
          },
        }
      : {}),
  };
}

function needsPriceSort(sort: string | undefined): sort is "price-asc" | "price-desc" {
  return sort === "price-asc" || sort === "price-desc";
}

function sortProductsByPrice(
  products: ProductCardRecord[],
  sort: "price-asc" | "price-desc" | undefined,
) {
  return [...products].sort((left, right) => {
    const difference = minPrice(left.variants) - minPrice(right.variants);
    return sort === "price-desc" ? -difference : difference;
  });
}

function minPrice(variants: ProductCardRecord["variants"]) {
  const prices = variants.flatMap((variant) =>
    variant.prices.map((price) => price.amountMinor),
  );

  return prices.length ? Math.min(...prices) : Number.MAX_SAFE_INTEGER;
}

function priceRangeLabel(variants: PricedVariant[]) {
  const prices = variants.flatMap(
    (variant) =>
      variant.prices?.map((price) => ({
        amountMinor: price.amountMinor,
        currency: price.currency,
      })) ?? [],
  );

  if (prices.length === 0) return "Price pending";

  const currency = prices[0]?.currency ?? "INR";
  const amounts = prices.map((price) => price.amountMinor);
  const low = Math.min(...amounts);
  const high = Math.max(...amounts);

  if (low === high) return formatMoney({ amountMinor: low, currency });

  return `${formatMoney({ amountMinor: low, currency })} - ${formatMoney({
    amountMinor: high,
    currency,
  })}`;
}

function compareAtRangeLabel(variants: PricedVariant[]) {
  const prices = variants.flatMap((variant) =>
    variant.prices
      .filter((price) => price.compareAtAmountMinor != null)
      .map((price) => ({
        amountMinor: price.compareAtAmountMinor ?? price.amountMinor,
        currency: price.currency,
      })),
  );

  if (prices.length === 0) return undefined;

  const currency = prices[0]?.currency ?? "INR";
  const high = Math.max(...prices.map((price) => price.amountMinor));

  return formatMoney({ amountMinor: high, currency });
}

function productInventoryStatus(variants: InventoryVariant[]) {
  if (variants.length === 0) return "Unavailable";

  const labels = new Set(
    variants.map((variant) =>
      variant.inventoryItem ? inventoryLabel(variant.inventoryItem) : "Untracked",
    ),
  );

  if (labels.has("In stock")) return "In stock";
  if (labels.has("Low stock")) return "Low stock";
  if (labels.has("Backorder")) return "Backorder";
  if (labels.has("Untracked")) return "Available";

  return "Out of stock";
}
