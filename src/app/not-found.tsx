import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main-content" className="grid min-h-screen place-items-center px-6">
      <section className="max-w-xl border-y border-[var(--border)] py-12">
        <p className="label text-[var(--accent)]">Not Found</p>
        <h1 className="heading-3 mt-4">This route is not available.</h1>
        <p className="body mt-4 text-[var(--foreground-muted)]">
          The requested page is not published in the current catalog.
        </p>
        <Link className="mt-8 inline-block underline underline-offset-4" href="/">
          Return to Deodar Wears
        </Link>
      </section>
    </main>
  );
}
