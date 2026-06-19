# 0010 Testing Strategy

Status: Accepted
Date: 2026-06-17

Context: Foundation code must be testable before commerce behavior is added.

Decision: Use Vitest for unit/integration/security tests and Playwright with Axe for E2E/accessibility.

Alternatives considered: Jest, Cypress, SQLite-backed integration tests.

Consequences: PostgreSQL integration requires `TEST_DATABASE_URL`.

Security impact: Tests cover redaction, safe errors, headers, and public env boundaries.

Operational impact: CI provisions PostgreSQL for integration tests.

Reversal conditions: Tooling incompatibility with Next.js or CI.

Relevant versions: Vitest 4.1.9, Playwright 1.61.0, Axe 4.12.1, ESLint 9.39.4.
