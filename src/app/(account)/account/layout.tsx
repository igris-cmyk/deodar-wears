import type { ReactNode } from "react";

import { AccountNav } from "@/components/account/account-nav";
import { Container, Wordmark } from "@/components/ui/primitives";

export default function AccountLayout({ children }: { children: ReactNode }) {
  return (
    <main id="main-content">
      <Container className="py-8">
        <Wordmark />
        <AccountNav />
        <div className="py-8">{children}</div>
      </Container>
    </main>
  );
}
