# Database Recovery

Phase 0 expects managed PostgreSQL backups through the chosen provider. Recovery procedures must be rehearsed before production launch.

Minimum expectations:

- Point-in-time restore available for production.
- Migration failure blocks deployment.
- Destructive scripts refuse `APP_ENV=production`.
