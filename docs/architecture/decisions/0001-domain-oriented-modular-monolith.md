# 0001 Domain-Oriented Modular Monolith

Status: Accepted
Date: 2026-06-17

Context: Deodar Wears needs commerce correctness without premature distributed systems.

Decision: Use one Next.js deployable with explicit modules under `src/modules` and infrastructure boundaries under `src/infrastructure`.

Alternatives considered: Microservices, monorepo packages, separate internal APIs.

Consequences: Simpler transactions and deployments; boundaries must be enforced by reviews and tests.

Security impact: Fewer network trust boundaries; stronger need for server/client import discipline.

Operational impact: One build, one deployment, one database migration stream.

Reversal conditions: Independent scale or ownership pressure that cannot be solved inside one deployable.

Relevant versions: Node 24.16.0, pnpm 11.7.0, Next.js 16.2.9, React 19.2.7, TypeScript 6.0.3.
