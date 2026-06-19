# Testing

Unit and security tests run without external services:

```bash
pnpm test:unit
pnpm test:security
```

Integration tests require isolated PostgreSQL:

```bash
APP_ENV=test TEST_DATABASE_URL=postgresql://... TEST_DIRECT_URL=postgresql://... pnpm test:integration
```

CI and release verification must also set `REQUIRE_DATABASE_TESTS=true`. In that
mode, `pnpm test:integration` and `pnpm test:migrations` fail immediately if
`TEST_DATABASE_URL` is missing instead of reporting a skipped success.

E2E and accessibility tests use Playwright:

```bash
pnpm exec playwright install chromium
pnpm test:e2e
pnpm test:accessibility
```
