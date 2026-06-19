# 0014 Shared Customer and Admin Identity

Status: Accepted
Date: 2026-06-17

Context: Administrators may also be customers, but admin authorization must not be a public registration path.

Decision: Use one `User` identity and separate `CustomerProfile` and `AdminMembership` records.

Alternatives: Separate admin user table, `isAdmin` boolean.

Consequences: Admin access can be revoked independently from customer identity.

Security impact: Prevents role checks from relying on a single boolean or client-owned state.

Reversal conditions: Legal or operational separation requires distinct identity realms.

Exact package versions: better-auth 1.6.19, Prisma 7.8.0.
