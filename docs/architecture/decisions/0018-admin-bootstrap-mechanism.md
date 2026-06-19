# 0018 Admin Bootstrap Mechanism

Status: Accepted
Date: 2026-06-17

Context: The first super admin must be created without a public admin registration route or committed password.

Decision: Provide `pnpm admin:bootstrap <email> <reason>` for an existing verified user. The command is idempotent and writes an audit event.

Alternatives: Seed default admin credentials, public invite route, direct database manual edits.

Consequences: Operators must first create and verify the identity account.

Security impact: No default credential exists. Bootstrap is auditable.

Reversal conditions: A later invitation workflow replaces the CLI bootstrap.

Exact package versions: Prisma 7.8.0, Better Auth 1.6.19.
