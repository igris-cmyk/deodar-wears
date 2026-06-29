import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductCard } from "@/components/catalog/product-card";
import { VariantSelector } from "@/components/catalog/variant-selector";
import { Container } from "@/components/ui/primitives";
import { getProductDetail, getRelatedProducts } from "@/modules/catalog/catalog.queries";

export const revalidate = 300;

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductDetail(slug);

  if (!product) {
    return { title: "Product not found" };
  }

  return {
    title: product.seoTitle ?? product.name,
    description: product.seoDescription ?? product.shortDescription,
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductDetail(slug);

  if (!product) notFound();

  const related = await getRelatedProducts(
    product.slug,
    product.categories.map((category) => category.slug),
  );
  const primaryImage = product.gallery[0];

  return (
    <main id="main-content">
      <Container className="grid gap-12 py-10">
        <nav aria-label="Breadcrumb" className="body-s text-[var(--foreground-muted)]">
          <Link className="underline underline-offset-4" href="/shop" prefetch={false}>
            Shop
          </Link>{" "}
          / {product.name}
        </nav>

        <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="grid gap-4">
            <div className="relative aspect-[4/5] overflow-hidden bg-[var(--surface-subtle)]">
              {primaryImage ? (
                <Image
                  src={primaryImage.url}
                  alt={primaryImage.altText}
                  fill
                  priority
                  sizes="(min-width: 1024px) 55vw, 100vw"
                  className="object-cover"
                />
              ) : (
                <div className="grid h-full place-items-center text-[var(--foreground-muted)]">
                  Product image pending
                </div>
              )}
            </div>
            {product.gallery.length > 1 ? (
              <div className="grid grid-cols-3 gap-3">
                {product.gallery.slice(1, 4).map((image) => (
                  <div
                    className="relative aspect-[4/5] bg-[var(--surface-subtle)]"
                    key={image.url}
                  >
                    <Image
                      src={image.url}
                      alt={image.altText}
                      fill
                      sizes="20vw"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <div className="grid content-start gap-7">
            <div>
              <p className="label text-[var(--accent)]">
                {product.categories[0]?.name ?? "Deodar Wears"}
              </p>
              <h1 className="heading-1 mt-3">{product.name}</h1>
              <p className="body-l mt-5 text-[var(--foreground-muted)]">
                {product.shortDescription}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-xl font-semibold">{product.priceLabel}</p>
              {product.compareAtLabel ? (
                <p className="body-s text-[var(--foreground-muted)] line-through">
                  {product.compareAtLabel}
                </p>
              ) : null}
              <p className="utility text-[var(--foreground-muted)]">
                {product.availabilityLabel}
              </p>
            </div>
            <VariantSelector variants={product.variants} />
            <section className="grid gap-3">
              <h2 className="text-lg font-semibold">Product details</h2>
              <p className="body text-[var(--foreground-muted)]">{product.description}</p>
              <div className="flex flex-wrap gap-2">
                {product.collections.map((collection) => (
                  <Link
                    className="utility border border-[var(--border)] px-2 py-1"
                    href={`/shop?collection=${collection.slug}`}
                    key={collection.slug}
                    prefetch={false}
                  >
                    {collection.name}
                  </Link>
                ))}
              </div>
            </section>
          </div>
        </section>

        {related.length ? (
          <section className="grid gap-6 border-t border-[var(--border)] pt-10">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="label text-[var(--accent)]">Related</p>
                <h2 className="heading-2 mt-3">Pieces for the same rotation</h2>
              </div>
              <Link
                className="label underline underline-offset-4"
                href="/shop"
                prefetch={false}
              >
                Shop all
              </Link>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((item) => (
                <ProductCard key={item.slug} product={item} />
              ))}
            </div>
          </section>
        ) : null}
      </Container>
    </main>
  );
}
