import Link from "next/link";

import { Drawer } from "@/components/ui/overlay";
import { Container, LinkButton, Wordmark } from "@/components/ui/primitives";

const liveLinks = [
  { href: "/shop", label: "Shop" },
  { href: "/shop?collection=new-arrivals", label: "New Arrivals" },
  { href: "/#shop-by-season", label: "Seasons" },
] as const;

export function SiteHeader() {
  return (
    <header className="border-b border-[var(--border)] bg-[var(--background)]">
      <Container className="flex min-h-16 items-center justify-between gap-6">
        <Link aria-label="Deodar Wears home" href="/" prefetch={false}>
          <Wordmark />
        </Link>
        <nav aria-label="Primary" className="hidden items-center gap-6 md:flex">
          {liveLinks.map((link) => (
            <Link className="label" href={link.href} key={link.href} prefetch={false}>
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          <LinkButton href="/auth/sign-in" prefetch={false} variant="quiet">
            Account
          </LinkButton>
          <span aria-label="Bag will open in a later commerce phase" className="label">
            Bag pending
          </span>
        </div>
        <div className="md:hidden">
          <Drawer label="Mobile navigation" trigger={<span className="label">Menu</span>}>
            <nav aria-label="Mobile primary" className="grid gap-5">
              {liveLinks.map((link) => (
                <Link
                  className="heading-3"
                  href={link.href}
                  key={link.href}
                  prefetch={false}
                >
                  {link.label}
                </Link>
              ))}
              <Link className="heading-3" href="/auth/sign-in" prefetch={false}>
                Account
              </Link>
            </nav>
          </Drawer>
        </div>
      </Container>
    </header>
  );
}
