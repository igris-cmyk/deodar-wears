# 0009 Environment and Secret Management

Status: Accepted
Date: 2026-06-17

Context: Preview, staging, and production need explicit separation.

Decision: Use `APP_ENV` plus Zod schemas for server and public environment validation.

Alternatives considered: Inferring behavior from `NODE_ENV`, untyped `process.env` reads.

Consequences: Runtime config failures fail readiness rather than leaking partial behavior.

Security impact: Server secrets are not allowlisted for the browser.

Operational impact: Vercel environment groups must be configured deliberately.

Reversal conditions: A platform-native typed secret system replaces env variables.

Relevant versions: Zod 4.4.3.
