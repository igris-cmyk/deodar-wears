import Link from "next/link";
import type { Route } from "next";

const links: { href: Route; label: string }[] = [
  { href: "/admin/overview", label: "Overview" },
  { href: "/admin/catalog/products", label: "Products" },
  { href: "/admin/catalog/categories", label: "Categories" },
  { href: "/admin/catalog/collections", label: "Collections" },
  { href: "/admin/inventory", label: "Inventory" },
  { href: "/admin/settings/users", label: "Users" },
  { href: "/admin/settings/roles", label: "Roles" },
  { href: "/admin/security", label: "Security" },
  { href: "/admin/audit-log", label: "Audit Log" },
];

export function AdminNav() {
  return (
    <nav aria-label="Admin" className="grid gap-2 border-r border-[var(--border)] p-4">
      <p className="utility text-[var(--foreground-muted)]">DW ADMIN</p>
      {links.map((link) => (
        <Link
          className="min-h-11 py-2 text-sm font-semibold"
          href={link.href}
          key={link.href}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
