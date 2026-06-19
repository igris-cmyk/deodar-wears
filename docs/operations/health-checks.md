# Health Checks

- `GET /api/health/live` checks process responsiveness only.
- `GET /api/health/ready` validates environment loading and bounded database reachability.

Responses intentionally avoid database hosts, dependency versions, environment dumps, and stack traces.
