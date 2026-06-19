# Environment Strategy

`APP_ENV` is the authoritative application mode and must be one of `local`, `test`, `preview`, `staging`, or `production`.

Preview, staging, and production must use separate databases and provider credentials. Preview deployments must never access production databases or production provider secrets.
