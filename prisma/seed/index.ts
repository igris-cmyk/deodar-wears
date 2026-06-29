import "dotenv/config";
import { fileURLToPath } from "node:url";

import { PrismaPg } from "@prisma/adapter-pg";
import { Prisma, PrismaClient } from "@prisma/client";

import { assertNonProductionDatabase } from "../../src/infrastructure/database/safety";
import {
  permissionCodes,
  roleDefinitions,
  rolePermissionMapping,
  type RoleCode,
} from "../../src/modules/admin/permissions";

type SeedClient = PrismaClient;

type SeedVariant = {
  sku: string;
  title: string;
  optionValues: Record<string, string>;
  priceMinor: number;
  compareAtMinor?: number;
  quantityOnHand: number;
  reorderThreshold: number;
  allowBackorder?: boolean;
};

type SeedProduct = {
  slug: string;
  name: string;
  shortDescription: string;
  description: string;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  featured: boolean;
  seoTitle: string;
  seoDescription: string;
  image: string;
  imageAlt: string;
  categories: string[];
  collections: string[];
  variants: SeedVariant[];
};

export async function seedDatabase(prisma: SeedClient) {
  const appEnv = process.env.APP_ENV ?? "local";
  const databaseUrl = process.env.DATABASE_URL ?? "";

  assertNonProductionDatabase({ appEnv, databaseUrl });

  await prisma.systemMetadata.upsert({
    where: { key: "platform.phase" },
    update: {
      value: {
        product: "Deodar Wears",
        phase: "2",
        seededAt: new Date("2026-06-19T00:00:00.000Z").toISOString(),
      },
    },
    create: {
      key: "platform.phase",
      value: {
        product: "Deodar Wears",
        phase: "2",
        seededAt: new Date("2026-06-19T00:00:00.000Z").toISOString(),
      },
    },
  });

  const permissions = await Promise.all(
    permissionCodes.map((permissionCode) =>
      prisma.adminPermission.upsert({
        where: { code: permissionCode },
        update: {
          description: `Allows ${permissionCode.replaceAll(".", " ")} operations.`,
        },
        create: {
          code: permissionCode,
          description: `Allows ${permissionCode.replaceAll(".", " ")} operations.`,
        },
        select: {
          id: true,
          code: true,
        },
      }),
    ),
  );

  const roleEntries = Object.entries(roleDefinitions) as [
    RoleCode,
    (typeof roleDefinitions)[RoleCode],
  ][];

  const roles = await Promise.all(
    roleEntries.map(([roleCode, definition]) =>
      prisma.adminRole.upsert({
        where: { code: roleCode },
        update: {
          name: definition.name,
          description: definition.description,
          systemRole: true,
        },
        create: {
          code: roleCode,
          name: definition.name,
          description: definition.description,
          systemRole: true,
        },
        select: {
          id: true,
          code: true,
        },
      }),
    ),
  );

  const permissionIdByCode = new Map(
    permissions.map((permission) => [permission.code, permission.id]),
  );

  const roleIdByCode = new Map(roles.map((role) => [role.code, role.id]));

  const rolePermissions = roleEntries.flatMap(([roleCode]) => {
    const roleId = roleIdByCode.get(roleCode);

    if (!roleId) {
      throw new Error(`Seeded role could not be resolved: ${roleCode}`);
    }

    return rolePermissionMapping[roleCode].map((permissionCode) => {
      const permissionId = permissionIdByCode.get(permissionCode);

      if (!permissionId) {
        throw new Error(`Seeded permission could not be resolved: ${permissionCode}`);
      }

      return {
        roleId,
        permissionId,
      };
    });
  });

  await prisma.rolePermission.createMany({
    data: rolePermissions,
    skipDuplicates: true,
  });

  await seedCatalog(prisma);
}

const categories = [
  {
    slug: "outerwear",
    name: "Outerwear",
    description: "Weather-ready shells, parkas and field layers with grounded utility.",
    sortOrder: 10,
  },
  {
    slug: "knits",
    name: "Knits",
    description: "Dense seasonal knitwear built around hand feel and recovery.",
    sortOrder: 20,
  },
  {
    slug: "shirting",
    name: "Shirting",
    description: "Layer shirts and overshirts designed for everyday rotation.",
    sortOrder: 30,
  },
  {
    slug: "trousers",
    name: "Trousers",
    description: "Structured trousers with calm proportions and durable cloth.",
    sortOrder: 40,
  },
];

const collections = [
  {
    slug: "new-arrivals",
    name: "New Arrivals",
    description: "Recently released pieces for daily rotation and changing weather.",
    featured: true,
    sortOrder: 10,
  },
  {
    slug: "essentials",
    name: "Essentials",
    description: "Quiet foundations for repeat wear.",
    featured: false,
    sortOrder: 20,
  },
  {
    slug: "spring-edit",
    name: "Spring Edit",
    description: "Light layers and breathable structure for mild, shifting days.",
    featured: true,
    sortOrder: 100,
  },
  {
    slug: "summer-edit",
    name: "Summer Edit",
    description: "Easy shirts, tees and trousers for warmer daily wear.",
    featured: true,
    sortOrder: 110,
  },
  {
    slug: "rain-transition",
    name: "Rain & Transition",
    description: "Adaptable layers for changing skies and in-between weather.",
    featured: true,
    sortOrder: 120,
  },
  {
    slug: "autumn-edit",
    name: "Autumn Edit",
    description: "Textured mid-weight pieces for cooler light and layered days.",
    featured: true,
    sortOrder: 130,
  },
  {
    slug: "winter-edit",
    name: "Winter Edit",
    description: "Warm knits and protective outer layers for the coldest months.",
    featured: true,
    sortOrder: 140,
  },
];

const products: SeedProduct[] = [
  {
    slug: "deodar-overshirt",
    name: "Deodar Overshirt",
    shortDescription: "Brushed cotton twill overshirt with a softened alpine hand.",
    description:
      "A daily outer layer cut with enough room for knitwear, finished with quiet patch pockets and dense twin-needle seams.",
    status: "ACTIVE",
    featured: true,
    seoTitle: "Deodar Overshirt",
    seoDescription: "A refined twill overshirt from Deodar Wears.",
    image: "/catalog/deodar-overshirt.svg",
    imageAlt: "Olive Deodar Overshirt on a neutral studio background",
    categories: ["shirting", "outerwear"],
    collections: [
      "new-arrivals",
      "essentials",
      "spring-edit",
      "rain-transition",
      "autumn-edit",
    ],
    variants: [
      variant(
        "DW-OVS-BLK-M",
        "Black / M",
        { Size: "M", Color: "Black" },
        780000,
        980000,
        18,
        5,
      ),
      variant(
        "DW-OVS-BLK-L",
        "Black / L",
        { Size: "L", Color: "Black" },
        780000,
        980000,
        12,
        5,
      ),
      variant(
        "DW-OVS-MOS-M",
        "Moss / M",
        { Size: "M", Color: "Moss" },
        780000,
        undefined,
        9,
        4,
      ),
    ],
  },
  {
    slug: "cedar-knit-crew",
    name: "Cedar Knit Crew",
    shortDescription: "Compact rib knit crew with substantial warmth and recovery.",
    description:
      "A composed cold-weather knit made for layering under jackets or wearing as a clean standalone piece.",
    status: "ACTIVE",
    featured: true,
    seoTitle: "Cedar Knit Crew",
    seoDescription: "Dense seasonal knitwear from Deodar Wears.",
    image: "/catalog/cedar-knit-crew.svg",
    imageAlt: "Charcoal Cedar Knit Crew on a neutral studio background",
    categories: ["knits"],
    collections: ["winter-edit", "autumn-edit", "essentials"],
    variants: [
      variant(
        "DW-KNT-CHR-S",
        "Charcoal / S",
        { Size: "S", Color: "Charcoal" },
        640000,
        undefined,
        8,
        3,
      ),
      variant(
        "DW-KNT-CHR-M",
        "Charcoal / M",
        { Size: "M", Color: "Charcoal" },
        640000,
        undefined,
        16,
        4,
      ),
      variant(
        "DW-KNT-CHR-L",
        "Charcoal / L",
        { Size: "L", Color: "Charcoal" },
        640000,
        undefined,
        5,
        5,
      ),
    ],
  },
  {
    slug: "alpine-field-jacket",
    name: "Alpine Field Jacket",
    shortDescription: "Structured field jacket with large utility pockets.",
    description:
      "A composed outerwear piece with a protective collar, crisp pocket architecture and a dry forest-green finish.",
    status: "ACTIVE",
    featured: true,
    seoTitle: "Alpine Field Jacket",
    seoDescription: "A structured field jacket from Deodar Wears.",
    image: "/catalog/alpine-field-jacket.svg",
    imageAlt: "Forest green Alpine Field Jacket on a neutral studio background",
    categories: ["outerwear"],
    collections: ["new-arrivals", "rain-transition", "autumn-edit", "winter-edit"],
    variants: [
      variant(
        "DW-FLD-FIR-M",
        "Fir / M",
        { Size: "M", Color: "Fir" },
        1240000,
        1480000,
        10,
        3,
      ),
      variant(
        "DW-FLD-FIR-L",
        "Fir / L",
        { Size: "L", Color: "Fir" },
        1240000,
        1480000,
        7,
        3,
      ),
    ],
  },
  {
    slug: "valley-weight-tee",
    name: "Valley Weight Tee",
    shortDescription: "Heavyweight tee with a dry, structured drape.",
    description:
      "A daily foundation with a substantial jersey body and a calm neckline that holds shape through repeated wear.",
    status: "ACTIVE",
    featured: false,
    seoTitle: "Valley Weight Tee",
    seoDescription: "A heavyweight everyday tee from Deodar Wears.",
    image: "/catalog/valley-weight-tee.svg",
    imageAlt: "Off-white Valley Weight Tee on a neutral studio background",
    categories: ["shirting"],
    collections: ["essentials", "spring-edit", "summer-edit"],
    variants: [
      variant(
        "DW-TEE-SNO-M",
        "Snow / M",
        { Size: "M", Color: "Snow" },
        280000,
        undefined,
        28,
        8,
      ),
      variant(
        "DW-TEE-SNO-L",
        "Snow / L",
        { Size: "L", Color: "Snow" },
        280000,
        undefined,
        22,
        8,
      ),
      variant(
        "DW-TEE-GRF-M",
        "Graphite / M",
        { Size: "M", Color: "Graphite" },
        300000,
        undefined,
        19,
        8,
      ),
    ],
  },
  {
    slug: "timber-trouser",
    name: "Timber Trouser",
    shortDescription: "Tapered trouser in dense cotton with a softened waistband.",
    description:
      "A clean daily trouser with utility roots, a calm taper and a cloth weight that sits neatly through long wear.",
    status: "ACTIVE",
    featured: false,
    seoTitle: "Timber Trouser",
    seoDescription: "A structured tapered trouser from Deodar Wears.",
    image: "/catalog/timber-trouser.svg",
    imageAlt: "Muted bark Timber Trouser on a neutral studio background",
    categories: ["trousers"],
    collections: ["essentials", "summer-edit", "rain-transition", "autumn-edit"],
    variants: [
      variant(
        "DW-TRS-BRK-30",
        "Bark / 30",
        { Waist: "30", Color: "Bark" },
        720000,
        undefined,
        11,
        4,
      ),
      variant(
        "DW-TRS-BRK-32",
        "Bark / 32",
        { Waist: "32", Color: "Bark" },
        720000,
        undefined,
        13,
        4,
      ),
      variant(
        "DW-TRS-BRK-34",
        "Bark / 34",
        { Waist: "34", Color: "Bark" },
        720000,
        undefined,
        4,
        4,
      ),
    ],
  },
  {
    slug: "dawn-layer-shirt",
    name: "Dawn Layer Shirt",
    shortDescription: "Pale layer shirt with crisp structure and soft color.",
    description:
      "A light seasonal shirt with enough body to sit open over tees and enough refinement to wear buttoned.",
    status: "ACTIVE",
    featured: false,
    seoTitle: "Dawn Layer Shirt",
    seoDescription: "A pale blue layer shirt from Deodar Wears.",
    image: "/catalog/dawn-layer-shirt.svg",
    imageAlt: "Pale blue Dawn Layer Shirt on a neutral studio background",
    categories: ["shirting"],
    collections: ["new-arrivals", "spring-edit", "summer-edit"],
    variants: [
      variant(
        "DW-SHT-ICE-M",
        "Ice / M",
        { Size: "M", Color: "Ice" },
        520000,
        undefined,
        14,
        4,
      ),
      variant(
        "DW-SHT-ICE-L",
        "Ice / L",
        { Size: "L", Color: "Ice" },
        520000,
        undefined,
        9,
        4,
      ),
    ],
  },
  {
    slug: "ridge-cargo-vest",
    name: "Ridge Cargo Vest",
    shortDescription: "Compact utility vest for transitional layering.",
    description:
      "A pocketed mid-layer that carries fieldwear language without overstatement, cut to layer over shirts and knits.",
    status: "ACTIVE",
    featured: true,
    seoTitle: "Ridge Cargo Vest",
    seoDescription: "A compact utility vest from Deodar Wears.",
    image: "/catalog/ridge-cargo-vest.svg",
    imageAlt: "Washed moss Ridge Cargo Vest on a neutral studio background",
    categories: ["outerwear"],
    collections: ["new-arrivals", "spring-edit", "rain-transition", "autumn-edit"],
    variants: [
      variant(
        "DW-VST-MOS-M",
        "Moss / M",
        { Size: "M", Color: "Moss" },
        690000,
        undefined,
        6,
        3,
      ),
      variant(
        "DW-VST-MOS-L",
        "Moss / L",
        { Size: "L", Color: "Moss" },
        690000,
        undefined,
        0,
        3,
        true,
      ),
    ],
  },
  {
    slug: "snowline-parka",
    name: "Snowline Parka",
    shortDescription: "Long insulated parka for hard cold and quiet movement.",
    description:
      "A protective cold-weather layer with a longer body, controlled quilting and a silhouette kept deliberately calm.",
    status: "ACTIVE",
    featured: true,
    seoTitle: "Snowline Parka",
    seoDescription: "A long insulated parka from Deodar Wears.",
    image: "/catalog/snowline-parka.svg",
    imageAlt: "Slate green Snowline Parka on a neutral studio background",
    categories: ["outerwear"],
    collections: ["winter-edit"],
    variants: [
      variant(
        "DW-PRK-SLT-M",
        "Slate / M",
        { Size: "M", Color: "Slate" },
        1680000,
        1880000,
        5,
        2,
      ),
      variant(
        "DW-PRK-SLT-L",
        "Slate / L",
        { Size: "L", Color: "Slate" },
        1680000,
        1880000,
        3,
        2,
      ),
    ],
  },
  {
    slug: "hearth-hoodie",
    name: "Hearth Hoodie",
    shortDescription: "Washed fleece hoodie with a dense, steady hand.",
    description:
      "A soft but structured fleece layer with restrained color, made for winter mornings and late train rides.",
    status: "DRAFT",
    featured: false,
    seoTitle: "Hearth Hoodie",
    seoDescription: "A washed fleece hoodie from Deodar Wears.",
    image: "/catalog/hearth-hoodie.svg",
    imageAlt: "Washed rust Hearth Hoodie on a neutral studio background",
    categories: ["knits"],
    collections: ["winter-edit"],
    variants: [
      variant(
        "DW-HDY-RST-M",
        "Rust / M",
        { Size: "M", Color: "Rust" },
        580000,
        undefined,
        10,
        4,
      ),
    ],
  },
  {
    slug: "archive-rain-shell",
    name: "Archive Rain Shell",
    shortDescription: "Previous-season shell retained for admin archive workflows.",
    description:
      "An archived shell kept in the database for visibility, archival and public-exclusion checks.",
    status: "ARCHIVED",
    featured: false,
    seoTitle: "Archive Rain Shell",
    seoDescription: "Archived Deodar Wears shell.",
    image: "/catalog/archive-shell.svg",
    imageAlt: "Muted grey archived rain shell on a neutral studio background",
    categories: ["outerwear"],
    collections: ["winter-edit"],
    variants: [
      variant(
        "DW-ARC-GRY-M",
        "Grey / M",
        { Size: "M", Color: "Grey" },
        860000,
        undefined,
        2,
        1,
      ),
    ],
  },
];

function variant(
  sku: string,
  title: string,
  optionValues: Record<string, string>,
  priceMinor: number,
  compareAtMinor: number | undefined,
  quantityOnHand: number,
  reorderThreshold: number,
  allowBackorder = false,
): SeedVariant {
  return {
    sku,
    title,
    optionValues,
    priceMinor,
    compareAtMinor,
    quantityOnHand,
    reorderThreshold,
    allowBackorder,
  };
}

async function seedCatalog(prisma: SeedClient) {
  const [seededCategories, seededCollections] = await Promise.all([
    Promise.all(
      categories.map((category) =>
        prisma.category.upsert({
          where: { slug: category.slug },
          update: { ...category, active: true },
          create: { ...category, active: true },
          select: { id: true, slug: true },
        }),
      ),
    ),
    Promise.all(
      collections.map((collection) =>
        prisma.collection.upsert({
          where: { slug: collection.slug },
          update: { ...collection, active: true },
          create: { ...collection, active: true },
          select: { id: true, slug: true },
        }),
      ),
    ),
  ]);

  const categoryIdBySlug = new Map(
    seededCategories.map((category) => [category.slug, category.id]),
  );
  const collectionIdBySlug = new Map(
    seededCollections.map((collection) => [collection.slug, collection.id]),
  );

  await Promise.all(
    products.map((product) =>
      seedProduct(prisma, product, categoryIdBySlug, collectionIdBySlug),
    ),
  );
}

async function seedProduct(
  prisma: SeedClient,
  seedProduct: SeedProduct,
  categoryIdBySlug: Map<string, string>,
  collectionIdBySlug: Map<string, string>,
) {
  const product = await prisma.product.upsert({
    where: { slug: seedProduct.slug },
    update: {
      name: seedProduct.name,
      shortDescription: seedProduct.shortDescription,
      description: seedProduct.description,
      status: seedProduct.status,
      featured: seedProduct.featured,
      seoTitle: seedProduct.seoTitle,
      seoDescription: seedProduct.seoDescription,
    },
    create: {
      slug: seedProduct.slug,
      name: seedProduct.name,
      shortDescription: seedProduct.shortDescription,
      description: seedProduct.description,
      status: seedProduct.status,
      featured: seedProduct.featured,
      seoTitle: seedProduct.seoTitle,
      seoDescription: seedProduct.seoDescription,
    },
    select: { id: true },
  });

  await Promise.all([
    prisma.productCategory.deleteMany({ where: { productId: product.id } }),
    prisma.productCollection.deleteMany({ where: { productId: product.id } }),
  ]);

  const productCategories = seedProduct.categories.map((slug, index) => ({
    productId: product.id,
    categoryId: requiredMapValue(categoryIdBySlug, slug, "category"),
    sortPosition: index,
  }));
  const productCollections = seedProduct.collections.map((slug, index) => ({
    productId: product.id,
    collectionId: requiredMapValue(collectionIdBySlug, slug, "collection"),
    sortPosition: index,
  }));

  await Promise.all([
    prisma.productCategory.createMany({
      data: productCategories,
      skipDuplicates: true,
    }),
    prisma.productCollection.createMany({
      data: productCollections,
      skipDuplicates: true,
    }),
  ]);

  await upsertSeedPrimaryMedia(prisma, product.id, seedProduct);

  const desiredSkus = seedProduct.variants.map((seedVariant) => seedVariant.sku);

  await prisma.productVariant.updateMany({
    where: { productId: product.id, sku: { notIn: desiredSkus } },
    data: { active: false },
  });

  await Promise.all(
    seedProduct.variants.map((seedVariant, index) =>
      seedVariantRecord(prisma, product.id, seedVariant, index),
    ),
  );
}

async function upsertSeedPrimaryMedia(
  prisma: SeedClient,
  productId: string,
  seedProduct: SeedProduct,
) {
  const data = {
    url: seedProduct.image,
    altText: seedProduct.imageAlt,
    mediaType: "IMAGE" as const,
    sortPosition: 0,
    isPrimary: true,
  };
  const existing = await prisma.productMedia.findFirst({
    where: { productId, isPrimary: true },
    select: { id: true },
  });

  if (existing) {
    await prisma.productMedia.update({ where: { id: existing.id }, data });
    return;
  }

  try {
    await prisma.productMedia.create({ data: { productId, ...data } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const createdByConcurrentSeed = await prisma.productMedia.findFirstOrThrow({
        where: { productId, isPrimary: true },
        select: { id: true },
      });

      await prisma.productMedia.update({
        where: { id: createdByConcurrentSeed.id },
        data,
      });
      return;
    }

    throw error;
  }
}

async function seedVariantRecord(
  prisma: SeedClient,
  productId: string,
  seedVariant: SeedVariant,
  index: number,
) {
  const variantRecord = await prisma.productVariant.upsert({
    where: { sku: seedVariant.sku },
    update: {
      productId,
      title: seedVariant.title,
      optionValues: seedVariant.optionValues as Prisma.InputJsonObject,
      active: true,
      sortPosition: index,
    },
    create: {
      productId,
      sku: seedVariant.sku,
      title: seedVariant.title,
      optionValues: seedVariant.optionValues as Prisma.InputJsonObject,
      active: true,
      sortPosition: index,
    },
    select: { id: true },
  });

  const activePrice = await prisma.productPrice.findFirst({
    where: { variantId: variantRecord.id, currency: "INR", active: true },
    select: { id: true, amountMinor: true, compareAtAmountMinor: true },
  });

  if (
    activePrice?.amountMinor !== seedVariant.priceMinor ||
    activePrice?.compareAtAmountMinor !== (seedVariant.compareAtMinor ?? null)
  ) {
    await prisma.productPrice.updateMany({
      where: { variantId: variantRecord.id, currency: "INR", active: true },
      data: { active: false },
    });
    await prisma.productPrice.create({
      data: {
        variantId: variantRecord.id,
        currency: "INR",
        amountMinor: seedVariant.priceMinor,
        compareAtAmountMinor: seedVariant.compareAtMinor,
        active: true,
      },
    });
  }

  const inventoryItem = await prisma.inventoryItem.upsert({
    where: { variantId: variantRecord.id },
    update: {
      quantityReserved: 0,
      reorderThreshold: seedVariant.reorderThreshold,
      trackInventory: true,
      allowBackorder: seedVariant.allowBackorder ?? false,
    },
    create: {
      variantId: variantRecord.id,
      quantityOnHand: 0,
      quantityReserved: 0,
      reorderThreshold: seedVariant.reorderThreshold,
      trackInventory: true,
      allowBackorder: seedVariant.allowBackorder ?? false,
    },
  });

  const quantityDelta = seedVariant.quantityOnHand - inventoryItem.quantityOnHand;

  if (quantityDelta === 0) return;

  await prisma.inventoryItem.update({
    where: { id: inventoryItem.id },
    data: { quantityOnHand: seedVariant.quantityOnHand },
  });
  await prisma.inventoryAdjustment.create({
    data: {
      inventoryItemId: inventoryItem.id,
      type: inventoryItem.quantityOnHand === 0 ? "INITIAL" : "CORRECTION",
      quantityDelta,
      previousQuantity: inventoryItem.quantityOnHand,
      resultingQuantity: seedVariant.quantityOnHand,
      reason: "Deterministic catalog seed stock",
      requestId: `seed-catalog-${seedVariant.sku}`,
    },
  });
}

function requiredMapValue(
  values: Map<string, string>,
  key: string,
  label: string,
): string {
  const value = values.get(key);

  if (!value) {
    throw new Error(`Missing seeded ${label}: ${key}`);
  }

  return value;
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL ?? "";

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required to run the Prisma seed.");
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({
      connectionString: databaseUrl,
    }),
  });

  await seedDatabase(prisma).finally(async () => {
    await prisma.$disconnect();
  });
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  await main().catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
}
