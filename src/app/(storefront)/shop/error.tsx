"use client";

import { Button, Container } from "@/components/ui/primitives";

export default function ShopError({ reset }: { reset: () => void }) {
  return (
    <main id="main-content">
      <Container className="py-10">
        <section className="border-y border-[var(--border)] py-8">
          <p className="label text-[var(--accent)]">Shop</p>
          <h1 className="heading-3 mt-3">Catalog could not be loaded.</h1>
          <div className="mt-5">
            <Button type="button" variant="secondary" onClick={reset}>
              Retry
            </Button>
          </div>
        </section>
      </Container>
    </main>
  );
}
