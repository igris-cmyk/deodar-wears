import { Container, Wordmark } from "@/components/ui/primitives";

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--border)]">
      <Container className="flex flex-col gap-4 py-8 md:flex-row md:items-end md:justify-between">
        <Wordmark />
        <p className="body-s max-w-md text-[var(--foreground-muted)]">
          Born in the valley. Built for cold cities.
        </p>
      </Container>
    </footer>
  );
}
