import Link from "next/link";
import type { Route } from "next";

const links: { href: Route; label: string }[] = [
  { href: "/account/profile", label: "Profile" },
  { href: "/account/security", label: "Security" },
  { href: "/account/preferences", label: "Preferences" },
];

export function AccountNav() {
  return (
    <nav
      aria-label="Account"
      className="flex flex-wrap gap-3 border-b border-[var(--border)] py-4"
    >
      {links.map((link) => (
        <Link className="label" href={link.href} key={link.href}>
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
