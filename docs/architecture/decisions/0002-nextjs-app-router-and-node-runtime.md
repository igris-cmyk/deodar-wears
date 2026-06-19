# 0002 Next.js App Router and Node Runtime

Status: Accepted
Date: 2026-06-17

Context: The platform needs server-authoritative rendering, route handlers, and Vercel compatibility.

Decision: Use Next.js App Router with Node.js runtime for database and provider operations.

Alternatives considered: Pages Router, Remix, custom Express.

Consequences: Server Components are default; client components are limited to real interactivity.

Security impact: Reduces accidental client-side secret handling when boundaries are respected.

Operational impact: Vercel deployment path is straightforward; Edge is deferred unless needed.

Reversal conditions: Hosting constraints or framework regressions affecting commerce correctness.

Relevant versions: Next.js 16.2.9, React 19.2.7, Node 24.16.0.
