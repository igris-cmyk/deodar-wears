"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/primitives";
import type { ProductDetailView } from "@/modules/catalog/catalog.queries";

type Variant = ProductDetailView["variants"][number];

export function VariantSelector({ variants }: { variants: Variant[] }) {
  const [selectedId, setSelectedId] = useState(variants[0]?.id ?? "");
  const selected = variants.find((variant) => variant.id === selectedId) ?? variants[0];
  const optionNames = useMemo(
    () =>
      Array.from(
        new Set(variants.flatMap((variant) => Object.keys(variant.optionValues))),
      ),
    [variants],
  );

  if (!selected) {
    return (
      <section aria-label="Product options" className="border-y border-[var(--border)] py-6">
        <p className="body-s text-[var(--foreground-muted)]">
          Options are being prepared.
        </p>
      </section>
    );
  }

  return (
    <section aria-label="Product options" className="grid gap-6 border-y border-[var(--border)] py-6">
      <div className="grid gap-4">
        {optionNames.map((optionName) => (
          <div className="grid gap-2" key={optionName}>
            <p className="label text-[var(--foreground-muted)]">{optionName}</p>
            <div className="flex flex-wrap gap-2">
              {optionValues(variants, optionName).map((value) => {
                const matchingVariant = variants.find(
                  (variant) => variant.optionValues[optionName] === value,
                );
                const active = selected.optionValues[optionName] === value;

                return (
                  <button
                    aria-pressed={active}
                    className={`min-h-11 border px-4 text-sm font-semibold ${
                      active
                        ? "border-[var(--foreground)] bg-[var(--foreground)] text-[var(--background)]"
                        : "border-[var(--border-strong)] bg-transparent"
                    }`}
                    key={`${optionName}-${value}`}
                    type="button"
                    onClick={() => {
                      if (matchingVariant) setSelectedId(matchingVariant.id);
                    }}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="grid gap-2">
        <p className="text-lg font-semibold">{selected.priceLabel}</p>
        {selected.compareAtLabel ? (
          <p className="body-s text-[var(--foreground-muted)]">
            Compare at {selected.compareAtLabel}
          </p>
        ) : null}
        <p className="body-s text-[var(--foreground-muted)]">
          {selected.title} · {selected.sku} · {selected.availabilityLabel}
        </p>
      </div>
      <Button disabled type="button" className="w-full md:w-fit">
        Checkout opens in a later phase
      </Button>
    </section>
  );
}

function optionValues(variants: Variant[], optionName: string) {
  return Array.from(
    new Set(
      variants
        .map((variant) => variant.optionValues[optionName])
        .filter((value): value is string => Boolean(value)),
    ),
  );
}
