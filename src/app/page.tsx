import Image from "next/image";
import Link from "next/link";

import { ProductCard } from "@/components/catalog/product-card";
import { SiteFooter } from "@/components/storefront/site-footer";
import { SiteHeader } from "@/components/storefront/site-header";
import { Container, EmptyState, LinkButton } from "@/components/ui/primitives";
import { getStorefrontHomeData } from "@/modules/catalog/catalog.queries";

export const revalidate = 300;

export default async function HomePage() {
  const data = await getStorefrontHomeData();
  const heroProduct = data.featuredProducts[0] ?? data.newArrivals[0];
  const hasCatalog = data.newArrivals.length > 0;

  return (
    <div className="deodar-shell">
      <SiteHeader />
      <main id="main-content" className="deodar-main">
        <section className="relative min-h-[82vh] overflow-hidden bg-[var(--charcoal)] text-[var(--snow)]">
          {heroProduct?.primaryImage ? (
            <Image
              src={heroProduct.primaryImage.url}
              alt={heroProduct.primaryImage.altText}
              fill
              priority
              sizes="100vw"
              className="object-cover opacity-80"
            />
          ) : null}
          <div className="absolute inset-0 bg-black/35" />
          <Container className="relative flex min-h-[82vh] flex-col justify-end pb-16 pt-24">
            <p className="label mb-4 text-[var(--chalk)]">Deodar Wears</p>
            <h1 className="display-l max-w-4xl">
              Made for the weather between forecasts.
            </h1>
            <div className="mt-6 flex max-w-2xl flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <p className="body-l text-[var(--chalk)]">
                Considered shirts, layers and everyday pieces shaped by Kashmir&apos;s
                changing seasons.
              </p>
              <LinkButton href="/shop" prefetch={false} variant="primary">
                Shop the catalog
              </LinkButton>
            </div>
          </Container>
        </section>

        {hasCatalog ? (
          <>
            <section className="py-14">
              <Container className="grid gap-8">
                <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="label text-[var(--accent)]">New arrivals</p>
                    <h2 className="heading-2 mt-3">
                      Quiet pieces, built for repeat wear.
                    </h2>
                  </div>
                  <Link
                    className="label underline underline-offset-4"
                    href="/shop"
                    prefetch={false}
                  >
                    View all
                  </Link>
                </div>
                <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                  {data.newArrivals.slice(0, 4).map((product) => (
                    <ProductCard key={product.slug} product={product} />
                  ))}
                </div>
              </Container>
            </section>

            <section
              className="border-y border-[var(--border)] py-14"
              id="shop-by-season"
            >
              <Container className="grid gap-8">
                <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
                  <div>
                    <p className="label text-[var(--accent)]">Shop by season</p>
                    <h2 className="heading-2 mt-3">
                      A wardrobe that moves with the year.
                    </h2>
                  </div>
                  <p className="body max-w-2xl text-[var(--foreground-muted)]">
                    From first mild days to deep winter, each edit gathers pieces for the
                    way Kashmir&apos;s weather actually changes.
                  </p>
                </div>
                <div className="grid gap-px bg-[var(--border)] md:grid-cols-6">
                  {data.seasonalCollections.map((collection, index) => (
                    <Link
                      className={`group grid bg-[var(--background)] ${
                        index < 2 ? "md:col-span-3" : "md:col-span-2"
                      }`}
                      href={`/shop?collection=${collection.slug}`}
                      key={collection.slug}
                      prefetch={false}
                    >
                      <div className="relative aspect-[5/3] overflow-hidden bg-[var(--surface-subtle)]">
                        {collection.image ? (
                          <Image
                            src={collection.image.url}
                            alt={collection.image.altText}
                            fill
                            sizes={
                              index < 2
                                ? "(min-width: 768px) 50vw, 100vw"
                                : "(min-width: 768px) 33vw, 100vw"
                            }
                            className="object-cover transition-transform duration-300 motion-reduce:transition-none group-hover:scale-[1.02]"
                          />
                        ) : null}
                      </div>
                      <div className="grid gap-3 p-5">
                        <h3 className="heading-3">{collection.name}</h3>
                        <p className="body-s text-[var(--foreground-muted)]">
                          {collection.description}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </Container>
            </section>

            <section className="border-b border-[var(--border)] py-14">
              <Container className="grid gap-8 md:grid-cols-[0.7fr_1.3fr]">
                <div>
                  <p className="label text-[var(--accent)]">Explore</p>
                  <h2 className="heading-2 mt-3">By category</h2>
                </div>
                <div className="grid gap-px border border-[var(--border)] bg-[var(--border)] sm:grid-cols-2">
                  {data.categories.map((category) => (
                    <Link
                      className="grid min-h-36 content-between bg-[var(--background)] p-5"
                      href={`/shop?category=${category.slug}`}
                      key={category.slug}
                      prefetch={false}
                    >
                      <span className="heading-3">{category.name}</span>
                      <span className="body-s text-[var(--foreground-muted)]">
                        {category.description}
                      </span>
                    </Link>
                  ))}
                </div>
              </Container>
            </section>

            <section className="py-16">
              <Container className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-center">
                <div className="aspect-[5/4] bg-[var(--surface-subtle)]">
                  {data.featuredProducts[1]?.primaryImage ? (
                    <Image
                      src={data.featuredProducts[1].primaryImage.url}
                      alt={data.featuredProducts[1].primaryImage.altText}
                      width={900}
                      height={720}
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </div>
                <div className="max-w-xl">
                  <p className="label text-[var(--accent)]">Material note</p>
                  <h2 className="heading-2 mt-3">
                    Cloth chosen for real days, not one season.
                  </h2>
                  <p className="body mt-5 text-[var(--foreground-muted)]">
                    Deodar Wears starts with fabric that earns repeated use: clean
                    shirting, breathable jersey, dry twills and compact knits. Weight and
                    construction shift with the weather; the calm utility remains.
                  </p>
                </div>
              </Container>
            </section>
          </>
        ) : (
          <Container className="py-16">
            <EmptyState title="The catalog is being prepared">
              Products and collections will appear here after the catalog seed or admin
              publishing workflow creates active merchandise.
            </EmptyState>
          </Container>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
