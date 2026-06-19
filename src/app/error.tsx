"use client";

import { useEffect } from "react";

export default function ErrorBoundary({
  error,
  reset,
}: Readonly<{ error: Error & { digest?: string }; reset: () => void }>) {
  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("deodar:error-boundary", {
        detail: { digest: error.digest ?? "unavailable" },
      }),
    );
  }, [error.digest]);

  return (
    <main id="main-content" className="grid min-h-screen place-items-center px-6">
      <section className="max-w-xl border-y border-[var(--line)] py-12">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
          Platform Error
        </p>
        <h1 className="mt-4 text-3xl font-semibold">
          The request could not be completed.
        </h1>
        <p className="mt-4 leading-7 text-[var(--muted)]">
          Reference: {error.digest ?? "unavailable"}
        </p>
        <button
          className="mt-8 border border-[var(--foreground)] px-4 py-2 text-sm font-semibold"
          type="button"
          onClick={() => reset()}
        >
          Retry
        </button>
      </section>
    </main>
  );
}
