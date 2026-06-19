# Identity Setup

Phase 1 uses Better Auth with the Prisma adapter, database-backed sessions, email/password authentication, email verification, password reset, and the Better Auth two-factor plugin.

Required production variables:

- `APP_ENV`
- `APP_URL`
- `DATABASE_URL`
- `DIRECT_URL`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`

Email delivery currently uses the provider boundary in `src/infrastructure/email/provider.ts`. Production must configure the Resend adapter in a later phase before live transactional email is enabled.

Bootstrap the first super administrator only after creating and verifying the user account:

```bash
pnpm prisma:migrate:deploy
pnpm prisma:seed
pnpm admin:bootstrap admin@example.com "initial super admin"
```

The bootstrap command is idempotent, does not create passwords, and writes an audit event.
