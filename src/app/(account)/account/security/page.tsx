import { EmptyState, PageHeader } from "@/components/ui/primitives";

export default function AccountSecurityPage() {
  return (
    <section className="grid gap-8">
      <PageHeader eyebrow="Account" title="Security">
        Session listing and revocation are backed by database sessions.
      </PageHeader>
      <EmptyState title="Session controls require sign-in">
        Current and other sessions will appear here for authenticated customers.
      </EmptyState>
    </section>
  );
}
