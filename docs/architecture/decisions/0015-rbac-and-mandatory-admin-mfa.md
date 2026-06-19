# 0015 RBAC and Mandatory Admin MFA

Status: Accepted
Date: 2026-06-17

Context: Administrative operations need permission granularity and strong session assurance.

Decision: Model roles, permissions and joins in PostgreSQL. Require MFA for admin memberships and fresh sessions for sensitive operations.

Alternatives: Hard-coded roles only, `isAdmin`, optional MFA.

Consequences: Every protected operation must call server-side guards.

Security impact: Disabled memberships and removed roles take effect through database reads.

Reversal conditions: A policy engine becomes necessary for more complex authorization.

Exact package versions: better-auth 1.6.19, otplib 13.4.1, qrcode 1.5.4.
