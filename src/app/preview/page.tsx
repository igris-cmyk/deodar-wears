import type { Metadata } from "next";

import { Alert, LinkButton, PageHeader } from "@/components/ui/primitives";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function PreviewPage() {
  return (
    <main id="main-content" className="mx-auto max-w-4xl px-4 py-12">
      <Alert tone="warning">
        Preview mode is a protected shell. Product preview is not implemented.
      </Alert>
      <PageHeader eyebrow="Preview" title="Preview shell">
        Future content preview will require protected access and noindex behavior.
      </PageHeader>
      <LinkButton href="/" variant="secondary">
        Exit preview
      </LinkButton>
    </main>
  );
}
