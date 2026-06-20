import Link from "next/link";

import { Container, Wordmark } from "@/components/ui/primitives";

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--border)]">
      <Container className="grid gap-8 py-10 md:grid-cols-[1.2fr_1fr_1fr]">
        <div className="grid gap-3">
          <Wordmark />
          <p className="body-s max-w-md text-[var(--foreground-muted)]">
            Grounded clothing for changing seasons, daily movement and quiet repeat wear.
          </p>
        </div>
        <div>
          <p className="label mb-3 text-[var(--foreground-muted)]">Visit</p>
          <nav aria-label="Footer shop" className="grid gap-2 body-s">
            <Link href="/shop" prefetch={false}>
              Shop all
            </Link>
            <Link href="/shop?collection=new-arrivals" prefetch={false}>
              New arrivals
            </Link>
            <Link href="/#shop-by-season">Shop by season</Link>
          </nav>
        </div>
        <div>
          <p className="label mb-3 text-[var(--foreground-muted)]">Care</p>
          <p className="body-s text-[var(--foreground-muted)]">
            Checkout, shipping, returns and order support arrive in later commerce phases.
          </p>
        </div>
      </Container>
    </footer>
  );
}
