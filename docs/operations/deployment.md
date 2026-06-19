# Deployment

Vercel preview and production builds use:

```bash
pnpm install --frozen-lockfile
pnpm build
```

Migrations must be executed by a controlled CI or release job before the application deployment is promoted:

```bash
pnpm prisma:migrate:deploy
```

Do not run migrations from serverless function startup.
