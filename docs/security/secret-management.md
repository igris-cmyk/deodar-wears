# Secret Management

Secrets are stored in environment managers, not Git. `.env`, `.env.local`, certificates, and dumps are ignored.

Server secrets must never use `NEXT_PUBLIC_`. Browser-visible values must be allowlisted through `src/config/public-env.ts`.
