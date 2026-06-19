import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main-content" className="grid min-h-screen place-items-center px-6">
      <section className="max-w-xl border-y border-[var(--line)] py-12">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--accent)]">
          Not Found
        </p>
        <h1 className="mt-4 text-3xl font-semibold">This route is not available.</h1>
        <p className="mt-4 leading-7 text-[var(--muted)]">
          The Phase 0 platform exposes only foundation surfaces.
        </p>
        <Link className="mt-8 inline-block underline underline-offset-4" href="/">
          Return to platform status
        </Link>
      </section>
    </main>
  );
}
