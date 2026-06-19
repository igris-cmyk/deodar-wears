import { AuthFormShell } from "@/components/ui/auth-form-shell";
import { Alert, LinkButton } from "@/components/ui/primitives";

export default function VerifyPage() {
  return (
    <AuthFormShell title="Check your email to verify your address.">
      <Alert>
        Verification links are managed by the identity provider and expire automatically.
      </Alert>
      <LinkButton href="/auth/sign-in" variant="secondary">
        Return to sign in
      </LinkButton>
    </AuthFormShell>
  );
}
