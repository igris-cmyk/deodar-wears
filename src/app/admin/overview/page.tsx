import { Badge, EmptyState, PageHeader } from "@/components/ui/primitives";

export default function AdminOverviewPage() {
  return (
    <section className="grid gap-8">
      <PageHeader eyebrow="Admin" title="Security overview">
        This shell exposes identity and authorization surfaces only. Commerce dashboards
        are not implemented in Phase 1.
      </PageHeader>
      <div className="flex flex-wrap gap-3">
        <Badge>MFA required</Badge>
        <Badge>RBAC active</Badge>
        <Badge>Audit append-only</Badge>
      </div>
      <EmptyState title="No commerce metrics">
        Sales, orders and inventory metrics are intentionally absent until those domains
        exist.
      </EmptyState>
    </section>
  );
}
