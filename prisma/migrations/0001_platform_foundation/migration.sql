CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE "system_metadata" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "key" varchar(120) NOT NULL UNIQUE,
  "value" jsonb NOT NULL,
  "created_at" timestamptz(6) NOT NULL DEFAULT now(),
  "updated_at" timestamptz(6) NOT NULL DEFAULT now()
);

CREATE TABLE "outbox_events" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "event_type" varchar(160) NOT NULL,
  "aggregate_type" varchar(120) NOT NULL,
  "aggregate_id" varchar(160) NOT NULL,
  "payload" jsonb NOT NULL,
  "schema_version" integer NOT NULL DEFAULT 1,
  "idempotency_key" varchar(200) NOT NULL UNIQUE,
  "occurred_at" timestamptz(6) NOT NULL DEFAULT now(),
  "dispatched_at" timestamptz(6),
  "attempts" integer NOT NULL DEFAULT 0,
  "last_error" text,
  "locked_at" timestamptz(6),
  "lock_owner" varchar(120),
  CONSTRAINT "outbox_events_attempts_nonnegative" CHECK ("attempts" >= 0),
  CONSTRAINT "outbox_events_schema_version_positive" CHECK ("schema_version" > 0)
);

CREATE INDEX "outbox_event_pending_idx"
  ON "outbox_events" ("dispatched_at", "locked_at", "occurred_at");

CREATE INDEX "outbox_event_aggregate_idx"
  ON "outbox_events" ("aggregate_type", "aggregate_id");

CREATE TABLE "idempotency_records" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "scope" varchar(120) NOT NULL,
  "key" varchar(200) NOT NULL,
  "request_hash" varchar(128) NOT NULL,
  "response_status" integer,
  "response_body" jsonb,
  "resource_type" varchar(120),
  "resource_id" varchar(160),
  "expires_at" timestamptz(6) NOT NULL,
  "created_at" timestamptz(6) NOT NULL DEFAULT now(),
  CONSTRAINT "idempotency_response_status_valid"
    CHECK ("response_status" IS NULL OR ("response_status" >= 100 AND "response_status" <= 599))
);

CREATE UNIQUE INDEX "idempotency_scope_key_unique"
  ON "idempotency_records" ("scope", "key");

CREATE INDEX "idempotency_expires_at_idx"
  ON "idempotency_records" ("expires_at");
