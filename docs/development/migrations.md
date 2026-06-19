# Migrations

Production uses reviewed Prisma migrations and `prisma migrate deploy`. Do not use `prisma db push` for deployment.

Policy:

- Add expand-and-contract migrations for backwards-incompatible changes.
- Run backfills as reviewed scripts or jobs, not from request handlers.
- Never edit a migration after it has been applied outside a disposable local database.
- Restore from backup is the rollback path for destructive data mistakes.
