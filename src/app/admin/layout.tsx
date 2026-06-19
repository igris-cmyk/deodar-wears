import type { Metadata } from "next";
import type { ReactNode } from "react";

import { AdminNav } from "@/components/admin/admin-nav";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <main id="main-content" className="min-h-screen lg:grid lg:grid-cols-[240px_1fr]">
      <AdminNav />
      <section className="p-4 md:p-8">{children}</section>
    </main>
  );
}
