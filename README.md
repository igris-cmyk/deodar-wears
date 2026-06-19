# Deodar Wears

Phase 0 establishes the production engineering foundation for Deodar Wears, an India-first outerwear and contemporary streetwear commerce platform.
Phase 1 adds identity, administrator RBAC/MFA, audit, route shells and design-system foundations.

Current scope: Next.js App Router, strict TypeScript, PostgreSQL through Prisma, validated environment configuration, structured logging, Sentry hooks, Inngest boundary, provider adapter interfaces, security headers, health endpoints, tests, CI, and deployment documentation.

## Stack

- Node.js 24.16.0 LTS
- pnpm 11.7.0
- Next.js 16.2.9 with React 19.2.7
- TypeScript 6.0.3
- Prisma 7.8.0 with PostgreSQL
- Tailwind CSS 4.3.1
- Vitest 4.1.9 and Playwright 1.61.0

## Setup

```bash
nvm use
corepack enable
corepack prepare pnpm@11.7.0 --activate
pnpm install --frozen-lockfile
cp .env.example .env.local
```

Configure `DATABASE_URL` and `DIRECT_URL` for a local PostgreSQL database or a Neon development branch. Configure `TEST_DATABASE_URL` and `TEST_DIRECT_URL` for a separate empty PostgreSQL database before treating integration, migration, or seed gates as passed.

```bash
pnpm prisma:migrate:deploy
pnpm prisma:seed
pnpm admin:bootstrap admin@example.com "initial super admin"
pnpm dev
```

## Verification

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm prisma:validate
pnpm prisma:generate
pnpm test:unit
pnpm test:integration
pnpm test:security
pnpm test:e2e
pnpm test:accessibility
pnpm test:migrations
pnpm audit:dependencies
pnpm build
```

Integration and migration tests require `TEST_DATABASE_URL` pointing to an isolated PostgreSQL database. Set `REQUIRE_DATABASE_TESTS=true` for release or CI-style verification so missing database credentials fail instead of producing an optional local skip.

## Security

No secrets belong in Git. Server secrets are validated only through `src/config/env.ts`; browser-safe values are allowlisted through `src/config/public-env.ts`. Provider adapters fail closed in production until real credentials and implementations are added in later phases.

## Limitations

Phase 0 and Phase 1 do not implement products, cart, checkout, payments, orders, product dashboards, or storefront commerce experiences. Phase 1 is limited to identity, customer account foundations, administrator access control, MFA, audit, and layout shells.
