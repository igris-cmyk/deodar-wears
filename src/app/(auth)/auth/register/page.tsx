import Link from "next/link";

import { AuthFormShell } from "@/components/ui/auth-form-shell";
import {
  Button,
  Checkbox,
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  Input,
  PasswordInput,
} from "@/components/ui/primitives";

export default function RegisterPage() {
  return (
    <AuthFormShell
      title="Create your Deodar Wears account."
      aside={
        <Link href="/auth/sign-in" prefetch={false}>
          Already have an account? Sign in.
        </Link>
      }
    >
      <form
        action="/api/auth/sign-up/email"
        className="grid gap-3 lg:gap-2"
        method="post"
      >
        <Field>
          <FieldLabel htmlFor="name">Name</FieldLabel>
          <Input autoComplete="name" id="name" name="name" required />
          <FieldError />
        </Field>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input autoComplete="email" id="email" name="email" required type="email" />
          <FieldError />
        </Field>
        <Field>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <PasswordInput
            autoComplete="new-password"
            id="password"
            minLength={12}
            name="password"
            required
          />
          <FieldDescription>
            Use at least 12 characters. Passphrases are welcome.
          </FieldDescription>
          <FieldError />
        </Field>
        <Field>
          <FieldLabel htmlFor="confirmPassword">Confirm password</FieldLabel>
          <PasswordInput
            autoComplete="new-password"
            id="confirmPassword"
            minLength={12}
            name="confirmPassword"
            required
          />
          <FieldError />
        </Field>
        <label className="flex gap-3 text-sm">
          <Checkbox name="termsAccepted" required />
          <span>I acknowledge the account terms and privacy notice.</span>
        </label>
        <Button type="submit">Create account</Button>
      </form>
    </AuthFormShell>
  );
}
