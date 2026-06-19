import Link from "next/link";

import { AuthFormShell } from "@/components/ui/auth-form-shell";
import {
  Button,
  Field,
  FieldError,
  FieldLabel,
  Input,
  PasswordInput,
} from "@/components/ui/primitives";

export default function SignInPage() {
  return (
    <AuthFormShell
      title="Sign in to continue."
      aside={<Link href="/auth/forgot-password">Forgot your password?</Link>}
    >
      <form action="/api/auth/sign-in/email" className="grid gap-5" method="post">
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input autoComplete="email" id="email" name="email" required type="email" />
          <FieldError />
        </Field>
        <Field>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <PasswordInput id="password" name="password" required />
          <FieldError />
        </Field>
        <Button type="submit">Sign in</Button>
        <Link className="body-s underline underline-offset-4" href="/auth/register">
          Create an account
        </Link>
      </form>
    </AuthFormShell>
  );
}
