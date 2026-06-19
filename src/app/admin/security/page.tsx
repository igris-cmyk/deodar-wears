import { Alert, PageHeader } from "@/components/ui/primitives";

export default function AdminSecurityPage() {
  return (
    <section className="grid gap-8">
      <PageHeader eyebrow="Admin" title="Administrator security">
        Administrators must enroll TOTP MFA and keep recovery codes offline.
      </PageHeader>
      <Alert tone="warning">
        MFA reset is intentionally not exposed as a casual self-service button.
      </Alert>
    </section>
  );
}
