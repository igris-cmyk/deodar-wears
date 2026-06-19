import { AuthFormShell } from "@/components/ui/auth-form-shell";
import {
  Button,
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  PasswordInput,
} from "@/components/ui/primitives";

export default function ResetPasswordPage() {
  return (
    <AuthFormShell title="Choose a new password.">
      <form action="/api/auth/reset-password" className="grid gap-5" method="post">
        <Field>
          <FieldLabel htmlFor="password">New password</FieldLabel>
          <PasswordInput
            autoComplete="new-password"
            id="password"
            minLength={12}
            name="password"
            required
          />
          <FieldDescription>
            Existing sessions are revoked after a password reset.
          </FieldDescription>
          <FieldError />
        </Field>
        <Button type="submit">Update password</Button>
      </form>
    </AuthFormShell>
  );
}
