import { PageHeader } from "@/components/ui/primitives";

export default function AdminUsersPage() {
  return (
    <PageHeader eyebrow="Admin" title="Administrator users">
      Administrator membership is separate from customer identity and requires MFA.
    </PageHeader>
  );
}
