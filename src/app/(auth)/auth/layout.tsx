import Link from "next/link";
import type { ReactNode } from "react";

import { Container, Wordmark } from "@/components/ui/primitives";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main id="main-content" className="min-h-dvh bg-[var(--background)]">
      <Container className="grid min-h-dvh gap-6 py-5 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-10 lg:py-2">
        <section className="border-y border-[var(--border)] py-7 lg:py-8">
          <Link href="/" prefetch={false}>
            <Wordmark />
          </Link>
          <p className="heading-1 mt-7 max-w-xl">
            Born in the valley. Made for changing days.
          </p>
        </section>
        <section className="w-full max-w-lg justify-self-end">{children}</section>
      </Container>
    </main>
  );
}
