import Image from "next/image";
import Link from "next/link";

import type { ProductCardView } from "@/modules/catalog/catalog.queries";

export function ProductCard({
  product,
  priority = false,
}: {
  product: ProductCardView;
  priority?: boolean;
}) {
  return (
    <article className="group grid gap-3">
      <Link
        className="block overflow-hidden bg-[var(--surface-subtle)]"
        href={`/products/${product.slug}`}
        prefetch={false}
      >
        <div className="relative aspect-[4/5]">
          {product.primaryImage ? (
            <Image
              src={product.primaryImage.url}
              alt={product.primaryImage.altText}
              fill
              priority={priority}
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
          ) : (
            <div className="grid h-full place-items-center text-center text-sm text-[var(--foreground-muted)]">
              Product image pending
            </div>
          )}
        </div>
      </Link>
      <div className="grid gap-1">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-base font-semibold">
            <Link href={`/products/${product.slug}`} prefetch={false}>
              {product.name}
            </Link>
          </h3>
          <p className="text-sm font-semibold">{product.priceLabel}</p>
        </div>
        <p className="body-s text-[var(--foreground-muted)]">
          {product.shortDescription}
        </p>
        <p className="utility text-[var(--foreground-muted)]">
          {product.availabilityLabel}
        </p>
      </div>
    </article>
  );
}
