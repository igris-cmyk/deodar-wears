# 0003 pnpm and Node Version Policy

Status: Accepted
Date: 2026-06-17

Context: Reproducible installs and LTS runtime are required.

Decision: Use Node.js 24.16.0 LTS and pnpm 11.7.0 with a committed lockfile.

Alternatives considered: npm, Yarn, Node 26 Current.

Consequences: Corepack is required for normal development and CI.

Security impact: Frozen lockfile and audit reduce supply-chain drift.

Operational impact: Vercel and CI must use `.nvmrc` and `packageManager`.

Reversal conditions: Managed host cannot support the selected runtime.

Relevant versions: Node 24.16.0 LTS, pnpm 11.7.0.
