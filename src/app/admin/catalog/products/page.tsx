import Link from "next/link";
import type { Route } from "next";

import {
  Badge,
  EmptyState,
  LinkButton,
  PageHeader,
  Select,
} from "@/components/ui/primitives";
import { requireAdminPagePermission } from "@/modules/admin/admin-page-auth";
import { getAdminProductList } from "@/modules/catalog/catalog.queries";

type SearchParams = Record<string, string | string[] | undefined>;

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  await requireAdminPagePermission("catalog.products.read");
  const params = await searchParams;
  const data = await getAdminProductList({
    status: firstParam(params.status),
    category: firstParam(params.category),
    q: firstParam(params.q),
    page: firstParam(params.page),
  });

  return (
    <section className="grid gap-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <PageHeader eyebrow="Catalog" title="Products">
          Manage product identity, merchandising, variants, pricing and inventory.
        </PageHeader>
        <LinkButton href="/admin/catalog/products/new">New product</LinkButton>
      </div>

      <form className="grid gap-3 border-y border-[var(--border)] py-4 md:grid-cols-[1fr_180px_220px_auto]">
        <label className="sr-only" htmlFor="product-q">
          Search products
        </label>
        <input
          id="product-q"
          name="q"
          defaultValue={data.filters.q}
          placeholder="Search name or slug"
          className="min-h-11 border border-[var(--border-strong)] bg-[var(--surface)] px-3"
        />
        <Select name="status" defaultValue={data.filters.status} aria-label="Status">
          <option value="ALL">All statuses</option>
          <option value="DRAFT">Draft</option>
          <option value="ACTIVE">Active</option>
          <option value="ARCHIVED">Archived</option>
        </Select>
        <Select
          name="category"
          defaultValue={data.filters.category ?? ""}
          aria-label="Category"
        >
          <option value="">All categories</option>
          {data.categories.map((category) => (
            <option value={category.slug} key={category.slug}>
              {category.name}
            </option>
          ))}
        </Select>
        <button
          className="min-h-11 border border-[var(--foreground)] px-4 text-sm font-semibold"
          type="submit"
        >
          Filter
        </button>
      </form>

      {data.products.length ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="py-3 pr-4">Product</th>
                <th className="py-3 pr-4">Status</th>
                <th className="py-3 pr-4">Featured</th>
                <th className="py-3 pr-4">Variants</th>
                <th className="py-3 pr-4">Price</th>
                <th className="py-3 pr-4">Inventory</th>
                <th className="py-3 pr-4">Updated</th>
              </tr>
            </thead>
            <tbody>
              {data.products.map((product) => (
                <tr className="border-b border-[var(--border)]" key={product.id}>
                  <td className="py-4 pr-4">
                    <Link
                      className="font-semibold underline-offset-4 hover:underline"
                      href={`/admin/catalog/products/${product.id}`}
                    >
                      {product.name}
                    </Link>
                    <p className="utility mt-1 text-[var(--foreground-muted)]">
                      {product.slug}
                    </p>
                  </td>
                  <td className="py-4 pr-4">
                    <Badge>{product.status}</Badge>
                  </td>
                  <td className="py-4 pr-4">{product.featured ? "Yes" : "No"}</td>
                  <td className="py-4 pr-4">{product.variantCount}</td>
                  <td className="py-4 pr-4">{product.priceLabel}</td>
                  <td className="py-4 pr-4">{product.inventoryStatus}</td>
                  <td className="py-4 pr-4">
                    {new Intl.DateTimeFormat("en-IN", {
                      dateStyle: "medium",
                    }).format(product.updatedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState title="No products found">
          Create the first product or relax the active filters.
        </EmptyState>
      )}

      <nav className="flex justify-between" aria-label="Admin product pagination">
        <PaginationLink
          disabled={data.filters.page <= 1}
          href={pageHref(params, data.filters.page - 1)}
          label="Previous"
        />
        <PaginationLink
          disabled={data.filters.page >= data.pageCount}
          href={pageHref(params, data.filters.page + 1)}
          label="Next"
        />
      </nav>
    </section>
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
  return `/admin/catalog/products?${query.toString()}`;
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
    <Link className="body-s font-semibold underline underline-offset-4" href={href as Route}>
      {label}
    </Link>
  );
}
