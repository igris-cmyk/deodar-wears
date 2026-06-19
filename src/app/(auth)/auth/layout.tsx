import Link from "next/link";
import type { ReactNode } from "react";

import { Container, Wordmark } from "@/components/ui/primitives";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main id="main-content" className="min-h-screen bg-[var(--background)]">
      <Container className="grid min-h-screen gap-10 py-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <section className="border-y border-[var(--border)] py-10">
          <Link href="/">
            <Wordmark />
          </Link>
          <p className="display-l mt-10 max-w-xl">
            Born in the valley. Built for cold cities.
          </p>
        </section>
        <section className="w-full max-w-lg justify-self-end">{children}</section>
      </Container>
    </main>
  );
}
