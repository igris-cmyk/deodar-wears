# 0008 Structured Logging and Sentry

Status: Accepted
Date: 2026-06-17

Context: Production diagnosis requires structured logs and error capture.

Decision: Use a centralized JSON logger with redaction plus Sentry SDK hooks.

Alternatives considered: Raw console logging, only Vercel logs, custom tracing first.

Consequences: Application code should log through the central logger.

Security impact: Redaction blocks common secret keys before output.

Operational impact: Sentry is inactive without DSN and suppressed in tests.

Reversal conditions: Observability vendor change or compliance restriction.

Relevant versions: @sentry/nextjs 10.58.0.
