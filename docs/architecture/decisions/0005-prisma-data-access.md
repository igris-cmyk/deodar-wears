# 0005 Prisma Data Access

Status: Accepted
Date: 2026-06-17

Context: The team needs typed database access and reviewed migrations.

Decision: Use Prisma with a single server-only client owner in `src/infrastructure/database`.

Alternatives considered: Drizzle, Kysely, raw SQL.

Consequences: Prisma types stay inside server infrastructure and repository code.

Security impact: Prevents browser imports of database credentials when `server-only` is respected.

Operational impact: Schema validation and generation are CI gates.

Reversal conditions: Prisma blocks required PostgreSQL features or migration safety.

Relevant versions: Prisma 7.8.0, @prisma/client 7.8.0, @prisma/adapter-pg 7.8.0, pg 8.21.0, PostgreSQL 18 target.
