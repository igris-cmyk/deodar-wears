# 0013 Better Auth Identity

Status: Accepted
Date: 2026-06-17

Context: Phase 1 needs customer authentication, email verification, password reset, revocable sessions, and administrator MFA without building password storage from scratch.

Decision: Use Better Auth 1.6.19 with its Prisma adapter and two-factor plugin. Deodar-owned authorization, customer profile, admin membership and audit data remain in domain modules.

Alternatives: Custom auth, Auth.js, external hosted identity.

Consequences: Better Auth owns base user/session/account/verification behavior. Application code owns RBAC and audit policy.

Security impact: Avoids custom password hashing and token handling. Production requires `BETTER_AUTH_SECRET`.

Reversal conditions: Better Auth cannot meet future compliance, session or MFA requirements.

Exact package versions: better-auth 1.6.19, @better-auth/prisma-adapter 1.6.19, Prisma 7.8.0.
