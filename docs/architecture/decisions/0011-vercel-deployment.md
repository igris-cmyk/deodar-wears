# 0011 Vercel Deployment

Status: Accepted
Date: 2026-06-17

Context: The platform targets Vercel for previews and production.

Decision: Configure Vercel for Next.js builds; run migrations outside application startup.

Alternatives considered: Self-hosted Node server, Kubernetes, Fly.io.

Consequences: Build and runtime environment variables must be scoped per environment.

Security impact: Preview deployments must not receive production secrets.

Operational impact: Production promotion requires successful migration deployment first.

Reversal conditions: Regional, cost, or operational constraints require another host.

Relevant versions: Next.js 16.2.9, Node 24.16.0.
