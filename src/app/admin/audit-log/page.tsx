import { EmptyState, PageHeader } from "@/components/ui/primitives";

export default function AdminAuditLogPage() {
  return (
    <section className="grid gap-8">
      <PageHeader eyebrow="Admin" title="Audit log">
        Identity and authorization events are written to append-only audit records.
      </PageHeader>
      <EmptyState title="Database-backed audit inspection">
        Audit rows appear after migrated environments record identity events.
      </EmptyState>
    </section>
  );
}
