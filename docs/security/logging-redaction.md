# Logging Redaction

Application logs use `src/infrastructure/logging/logger.ts` and redact sensitive keys before writing structured JSON.

Never log passwords, tokens, cookies, provider secrets, database URLs, card data, complete addresses, or full payment payloads.
