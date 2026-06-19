import { AuthFormShell } from "@/components/ui/auth-form-shell";
import {
  Button,
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  Input,
} from "@/components/ui/primitives";

export default function ForgotPasswordPage() {
  return (
    <AuthFormShell title="Reset access to your account.">
      <form action="/api/auth/forget-password" className="grid gap-5" method="post">
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input autoComplete="email" id="email" name="email" required type="email" />
          <FieldDescription>
            If an account matches this address, instructions will be sent.
          </FieldDescription>
          <FieldError />
        </Field>
        <Button type="submit">Send reset instructions</Button>
      </form>
    </AuthFormShell>
  );
}
