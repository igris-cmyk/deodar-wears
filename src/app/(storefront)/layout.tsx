import type { ReactNode } from "react";

import { SiteFooter } from "@/components/storefront/site-footer";
import { SiteHeader } from "@/components/storefront/site-header";

export default function StorefrontLayout({ children }: { children: ReactNode }) {
  return (
    <div className="deodar-shell">
      <SiteHeader />
      <div className="deodar-main">{children}</div>
      <SiteFooter />
    </div>
  );
}
