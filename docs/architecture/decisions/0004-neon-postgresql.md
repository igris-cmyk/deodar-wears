# 0004 Neon PostgreSQL

Status: Accepted
Date: 2026-06-17

Context: Commerce data needs relational constraints and transaction support.

Decision: Use PostgreSQL, with Neon as the managed-provider target and separate pooled/direct URLs.

Alternatives considered: MySQL, SQLite, document stores.

Consequences: Integration tests must use real PostgreSQL, not SQLite.

Security impact: Preview, staging, and production databases must be isolated.

Operational impact: Migrations run via controlled `prisma migrate deploy`.

Reversal conditions: Provider reliability or compliance requirements force a managed PostgreSQL change.

Relevant versions: PostgreSQL 18 target, Prisma 7.8.0.
