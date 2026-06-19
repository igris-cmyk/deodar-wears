# 0007 Inngest and Transactional Outbox

Status: Accepted
Date: 2026-06-17

Context: Later commerce workflows need durable asynchronous execution.

Decision: Use Inngest for workflows and a PostgreSQL outbox for transactional event handoff.

Alternatives considered: Inline work in request handlers, queues without database outbox, Kafka.

Consequences: Dispatchers must mark events dispatched only after external acceptance.

Security impact: Events avoid unnecessary PII and use signed endpoints in production.

Operational impact: Outbox dispatch failures are logged and monitored.

Reversal conditions: Workflow volume or compliance requirements outgrow Inngest.

Relevant versions: Inngest 4.6.0, Prisma 7.8.0.
