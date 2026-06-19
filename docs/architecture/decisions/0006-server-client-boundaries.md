# 0006 Server and Client Boundaries

Status: Accepted
Date: 2026-06-17

Context: Commerce secrets and database access must never reach browser bundles.

Decision: Use `server-only` imports in server infrastructure and separate public/server env schemas.

Alternatives considered: Shared config object, unrestricted barrels.

Consequences: Client components cannot import infrastructure modules.

Security impact: Reduces secret exposure risk and supports bundle leakage tests.

Operational impact: Boundary failures should break lint, typecheck, or tests.

Reversal conditions: None expected; this is a permanent platform constraint.

Relevant versions: Next.js 16.2.9, server-only 0.0.1, Zod 4.4.3.
