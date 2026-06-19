import Link from "next/link";
import type { Route } from "next";

import { Drawer } from "@/components/ui/overlay";
import { Container, LinkButton, Wordmark } from "@/components/ui/primitives";

const liveLinks: { href: Route; label: string }[] = [{ href: "/", label: "Foundation" }];

export function SiteHeader() {
  return (
    <header className="border-b border-[var(--border)] bg-[var(--background)]">
      <Container className="flex min-h-16 items-center justify-between gap-6">
        <Link aria-label="Deodar Wears home" href="/">
          <Wordmark />
        </Link>
        <nav aria-label="Primary" className="hidden items-center gap-6 md:flex">
          {liveLinks.map((link) => (
            <Link className="label" href={link.href} key={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          <LinkButton href="/auth/sign-in" variant="quiet">
            Account
          </LinkButton>
          <span aria-label="Bag unavailable until commerce phase" className="label">
            Bag
          </span>
        </div>
        <div className="md:hidden">
          <Drawer label="Mobile navigation" trigger={<span className="label">Menu</span>}>
            <nav aria-label="Mobile primary" className="grid gap-5">
              {liveLinks.map((link) => (
                <Link className="heading-3" href={link.href} key={link.href}>
                  {link.label}
                </Link>
              ))}
              <Link className="heading-3" href="/auth/sign-in">
                Account
              </Link>
            </nav>
          </Drawer>
        </div>
      </Container>
    </header>
  );
}
