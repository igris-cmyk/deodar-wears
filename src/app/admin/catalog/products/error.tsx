"use client";

import { Button } from "@/components/ui/primitives";

export default function AdminProductsError({ reset }: { reset: () => void }) {
  return (
    <section className="border-y border-[var(--border)] py-8">
      <p className="label text-[var(--accent)]">Catalog</p>
      <h1 className="heading-3 mt-3">Products could not be loaded.</h1>
      <div className="mt-5">
        <Button type="button" variant="secondary" onClick={reset}>
          Retry
        </Button>
      </div>
    </section>
  );
}
