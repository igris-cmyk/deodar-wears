import { PageHeader } from "@/components/ui/primitives";
import { rolePermissionMapping } from "@/modules/admin/permissions";

export default function AdminRolesPage() {
  return (
    <section className="grid gap-8">
      <PageHeader eyebrow="Admin" title="Roles and permissions">
        Role changes require permission checks, fresh session, MFA and audit logging.
      </PageHeader>
      <div className="grid gap-4">
        {Object.entries(rolePermissionMapping).map(([role, permissions]) => (
          <section className="border-y border-[var(--border)] py-4" key={role}>
            <h2 className="heading-3">{role.replaceAll("_", " ")}</h2>
            <p className="body-s mt-2 text-[var(--foreground-muted)]">
              {permissions.length} permissions
            </p>
          </section>
        ))}
      </div>
    </section>
  );
}
