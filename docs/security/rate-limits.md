# Rate Limits

Phase 1 centralizes high-risk identity policies in `src/infrastructure/rate-limit/provider.ts`.

Policies:

- `auth.sign-in`
- `auth.register`
- `auth.verify-email`
- `auth.resend-verification`
- `auth.forgot-password`
- `auth.reset-password`
- `auth.mfa-verify`
- `auth.mfa-recovery`
- `admin.bootstrap`

Sensitive identifiers such as email addresses must be hashed before use as rate-limit keys. Production and preview use the Upstash-backed provider when configured; local and test use deterministic development limits.
