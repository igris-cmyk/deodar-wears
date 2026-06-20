import Link from "next/link";
import type { Route } from "next";

import { ProductCard } from "@/components/catalog/product-card";
import { Container, EmptyState, Select } from "@/components/ui/primitives";
import { getShopCatalog } from "@/modules/catalog/catalog.queries";

export const revalidate = 300;

type SearchParams = Record<string, string | string[] | undefined>;

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const catalog = await getShopCatalog({
    category: firstParam(params.category),
    collection: firstParam(params.collection),
    sort: firstParam(params.sort),
    page: firstParam(params.page),
    q: firstParam(params.q),
  });

  return (
    <main id="main-content">
      <Container className="grid gap-8 py-10">
        <header className="grid gap-5 border-b border-[var(--border)] pb-8 lg:grid-cols-[1fr_420px] lg:items-end">
          <div>
            <p className="label text-[var(--accent)]">Shop</p>
            <h1 className="heading-1 mt-3">Catalog</h1>
            <p className="body mt-4 max-w-2xl text-[var(--foreground-muted)]">
              Active Deodar Wears products, filtered by category, collection and price.
            </p>
          </div>
          <form className="grid gap-3 sm:grid-cols-[1fr_auto]" action="/shop">
            <label className="sr-only" htmlFor="shop-search">
              Search products
            </label>
            <input
              id="shop-search"
              name="q"
              defaultValue={catalog.filters.q}
              placeholder="Search products"
              className="min-h-11 border border-[var(--border-strong)] bg-[var(--surface)] px-3"
            />
            <button
              className="min-h-11 border border-[var(--foreground)] px-5 text-sm font-semibold"
              type="submit"
            >
              Search
            </button>
          </form>
        </header>

        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
          <aside
            aria-label="Catalog filters"
            className="lg:sticky lg:top-4 lg:self-start"
          >
            <details className="border-y border-[var(--border)] py-4" open>
              <summary className="cursor-pointer text-sm font-semibold">Filters</summary>
              <form className="mt-5 grid gap-5" action="/shop">
                <input type="hidden" name="q" value={catalog.filters.q ?? ""} />
                <div className="grid gap-2">
                  <label
                    className="label text-[var(--foreground-muted)]"
                    htmlFor="category"
                  >
                    Category
                  </label>
                  <Select
                    id="category"
                    name="category"
                    defaultValue={catalog.filters.category ?? ""}
                  >
                    <option value="">All categories</option>
                    {catalog.categories.map((category) => (
                      <option value={category.slug} key={category.slug}>
                        {category.name}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="grid gap-2">
                  <label
                    className="label text-[var(--foreground-muted)]"
                    htmlFor="collection"
                  >
                    Collection
                  </label>
                  <Select
                    id="collection"
                    name="collection"
                    defaultValue={catalog.filters.collection ?? ""}
                  >
                    <option value="">All collections</option>
                    {catalog.collections.map((collection) => (
                      <option value={collection.slug} key={collection.slug}>
                        {collection.name}
                      </option>
                    ))}
                  </Select>
                </div>
                <div className="grid gap-2">
                  <label className="label text-[var(--foreground-muted)]" htmlFor="sort">
                    Sort
                  </label>
                  <Select id="sort" name="sort" defaultValue={catalog.filters.sort}>
                    <option value="newest">Newest</option>
                    <option value="name">Name</option>
                    <option value="price-asc">Price low to high</option>
                    <option value="price-desc">Price high to low</option>
                  </Select>
                </div>
                <button
                  className="min-h-11 border border-[var(--foreground)] bg-[var(--foreground)] px-4 text-sm font-semibold text-[var(--background)]"
                  type="submit"
                >
                  Apply filters
                </button>
                <Link
                  className="body-s underline underline-offset-4"
                  href="/shop"
                  prefetch={false}
                >
                  Clear filters
                </Link>
              </form>
            </details>
          </aside>

          <section className="grid gap-6" aria-live="polite">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="body-s text-[var(--foreground-muted)]">
                {catalog.totalCount} active products
              </p>
              <p className="utility text-[var(--foreground-muted)]">
                Page {catalog.filters.page} of {catalog.pageCount}
              </p>
            </div>
            {catalog.products.length ? (
              <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
                {catalog.products.map((product, index) => (
                  <ProductCard
                    key={product.slug}
                    product={product}
                    priority={index === 0}
                  />
                ))}
              </div>
            ) : (
              <EmptyState title="No active products match these filters">
                Try another category or collection, or return to the full catalog.
              </EmptyState>
            )}
            <nav
              className="flex items-center justify-between border-t border-[var(--border)] pt-5"
              aria-label="Catalog pagination"
            >
              <PaginationLink
                disabled={catalog.filters.page <= 1}
                label="Previous"
                href={pageHref(params, catalog.filters.page - 1)}
              />
              <PaginationLink
                disabled={catalog.filters.page >= catalog.pageCount}
                label="Next"
                href={pageHref(params, catalog.filters.page + 1)}
              />
            </nav>
          </section>
        </div>
      </Container>
    </main>
  );
}

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function pageHref(params: SearchParams, page: number) {
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    const scalar = firstParam(value);
    if (scalar && key !== "page") query.set(key, scalar);
  }

  query.set("page", String(page));
  return `/shop?${query.toString()}`;
}

function PaginationLink({
  disabled,
  href,
  label,
}: {
  disabled: boolean;
  href: string;
  label: string;
}) {
  if (disabled) {
    return (
      <span className="body-s text-[var(--foreground-muted)]" aria-disabled="true">
        {label}
      </span>
    );
  }

  return (
    <Link
      className="body-s font-semibold underline underline-offset-4"
      href={href as Route}
      prefetch={false}
    >
      {label}
    </Link>
  );
}
