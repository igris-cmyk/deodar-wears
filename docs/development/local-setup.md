# Local Setup

Use Node.js 24.16.0 LTS and pnpm 11.7.0.

```bash
nvm use
corepack enable
corepack prepare pnpm@11.7.0 --activate
pnpm install --frozen-lockfile
cp .env.example .env.local
```

Set `APP_ENV=local`, `APP_URL=http://localhost:3000`, `DATABASE_URL`, and `DIRECT_URL`. Use a local PostgreSQL database or a Neon development branch. Never point local development at production.

For database proof, create a separate empty PostgreSQL database and set:

```bash
TEST_DATABASE_URL=postgresql://...
TEST_DIRECT_URL=postgresql://...
REQUIRE_DATABASE_TESTS=true
```

`TEST_DATABASE_URL` must never point at production data. Without it, local database tests may report that the command completed while the required PostgreSQL tests were skipped.

```bash
pnpm prisma:migrate:deploy
pnpm prisma:seed
pnpm dev
```
