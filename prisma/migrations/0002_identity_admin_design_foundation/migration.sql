CREATE TABLE "user" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" varchar(160) NOT NULL,
  "email" varchar(320) NOT NULL UNIQUE,
  "email_verified" boolean NOT NULL DEFAULT false,
  "image" text,
  "two_factor_enabled" boolean NOT NULL DEFAULT false,
  "disabled_at" timestamptz(6),
  "created_at" timestamptz(6) NOT NULL DEFAULT now(),
  "updated_at" timestamptz(6) NOT NULL DEFAULT now(),
  CONSTRAINT "user_email_lowercase" CHECK ("email" = lower("email")),
  CONSTRAINT "user_email_not_blank" CHECK (length(trim("email")) > 3)
);

CREATE INDEX "user_email_idx" ON "user" ("email");

CREATE TABLE "session" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "expires_at" timestamptz(6) NOT NULL,
  "token" varchar(255) NOT NULL UNIQUE,
  "created_at" timestamptz(6) NOT NULL DEFAULT now(),
  "updated_at" timestamptz(6) NOT NULL DEFAULT now(),
  "ip_address" varchar(80),
  "user_agent" text,
  "user_id" uuid NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "revoked_at" timestamptz(6),
  "last_seen_at" timestamptz(6),
  "mfa_verified_at" timestamptz(6),
  "fresh_until" timestamptz(6)
);

CREATE INDEX "session_user_id_idx" ON "session" ("user_id");
CREATE INDEX "session_expires_at_idx" ON "session" ("expires_at");

CREATE TABLE "account" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "account_id" varchar(255) NOT NULL,
  "provider_id" varchar(120) NOT NULL,
  "user_id" uuid NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
  "access_token" text,
  "refresh_token" text,
  "id_token" text,
  "access_token_expires_at" timestamptz(6),
  "refresh_token_expires_at" timestamptz(6),
  "scope" text,
  "password" text,
  "created_at" timestamptz(6) NOT NULL DEFAULT now(),
  "updated_at" timestamptz(6) NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX "account_provider_account_unique" ON "account" ("provider_id", "account_id");
CREATE INDEX "account_user_id_idx" ON "account" ("user_id");

CREATE TABLE "verification" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "identifier" varchar(320) NOT NULL,
  "value" text NOT NULL,
  "expires_at" timestamptz(6) NOT NULL,
  "created_at" timestamptz(6) NOT NULL DEFAULT now(),
  "updated_at" timestamptz(6) NOT NULL DEFAULT now(),
  "user_id" uuid REFERENCES "user"("id") ON DELETE CASCADE
);

CREATE INDEX "verification_identifier_idx" ON "verification" ("identifier");
CREATE INDEX "verification_expires_at_idx" ON "verification" ("expires_at");

CREATE TABLE "two_factor" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "secret" text NOT NULL,
  "backup_codes" text NOT NULL,
  "user_id" uuid NOT NULL UNIQUE REFERENCES "user"("id") ON DELETE CASCADE,
  "created_at" timestamptz(6) NOT NULL DEFAULT now(),
  "updated_at" timestamptz(6) NOT NULL DEFAULT now()
);

CREATE TABLE "customer_profiles" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL UNIQUE REFERENCES "user"("id") ON DELETE CASCADE,
  "phone" varchar(32),
  "phone_verified_at" timestamptz(6),
  "marketing_email" boolean NOT NULL DEFAULT false,
  "marketing_sms" boolean NOT NULL DEFAULT false,
  "created_at" timestamptz(6) NOT NULL DEFAULT now(),
  "updated_at" timestamptz(6) NOT NULL DEFAULT now()
);

CREATE TABLE "admin_memberships" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" uuid NOT NULL UNIQUE REFERENCES "user"("id") ON DELETE CASCADE,
  "active" boolean NOT NULL DEFAULT true,
  "requires_mfa" boolean NOT NULL DEFAULT true,
  "created_at" timestamptz(6) NOT NULL DEFAULT now(),
  "updated_at" timestamptz(6) NOT NULL DEFAULT now(),
  "disabled_at" timestamptz(6),
  CONSTRAINT "admin_membership_disabled_state"
    CHECK (("active" = true AND "disabled_at" IS NULL) OR ("active" = false AND "disabled_at" IS NOT NULL))
);

CREATE TABLE "admin_roles" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "code" varchar(80) NOT NULL UNIQUE,
  "name" varchar(120) NOT NULL,
  "description" text NOT NULL,
  "system_role" boolean NOT NULL DEFAULT true,
  "created_at" timestamptz(6) NOT NULL DEFAULT now(),
  "updated_at" timestamptz(6) NOT NULL DEFAULT now(),
  CONSTRAINT "admin_role_code_format" CHECK ("code" ~ '^[A-Z][A-Z0-9_]{2,79}$')
);

CREATE TABLE "admin_permissions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "code" varchar(120) NOT NULL UNIQUE,
  "description" text NOT NULL,
  "created_at" timestamptz(6) NOT NULL DEFAULT now(),
  CONSTRAINT "admin_permission_code_format" CHECK ("code" ~ '^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$')
);

CREATE TABLE "admin_membership_roles" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "admin_membership_id" uuid NOT NULL REFERENCES "admin_memberships"("id") ON DELETE CASCADE,
  "role_id" uuid NOT NULL REFERENCES "admin_roles"("id") ON DELETE CASCADE,
  "assigned_at" timestamptz(6) NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX "admin_membership_role_unique"
  ON "admin_membership_roles" ("admin_membership_id", "role_id");

CREATE TABLE "role_permissions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "role_id" uuid NOT NULL REFERENCES "admin_roles"("id") ON DELETE CASCADE,
  "permission_id" uuid NOT NULL REFERENCES "admin_permissions"("id") ON DELETE CASCADE
);

CREATE UNIQUE INDEX "role_permission_unique" ON "role_permissions" ("role_id", "permission_id");

CREATE TABLE "admin_recovery_codes" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "admin_membership_id" uuid NOT NULL REFERENCES "admin_memberships"("id") ON DELETE CASCADE,
  "code_hash" varchar(128) NOT NULL UNIQUE,
  "used_at" timestamptz(6),
  "created_at" timestamptz(6) NOT NULL DEFAULT now()
);

CREATE INDEX "admin_recovery_code_membership_idx"
  ON "admin_recovery_codes" ("admin_membership_id", "used_at");

CREATE TABLE "audit_logs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "actor_user_id" uuid REFERENCES "user"("id") ON DELETE SET NULL,
  "actor_type" varchar(40) NOT NULL,
  "permission_code" varchar(120),
  "action" varchar(120) NOT NULL,
  "entity_type" varchar(120) NOT NULL,
  "entity_id" varchar(160),
  "request_id" varchar(128) NOT NULL,
  "reason" text,
  "before_data" jsonb,
  "after_data" jsonb,
  "ip_address" varchar(80),
  "user_agent" text,
  "created_at" timestamptz(6) NOT NULL DEFAULT now(),
  CONSTRAINT "audit_actor_type_known"
    CHECK ("actor_type" IN ('CUSTOMER', 'ADMIN', 'GUEST', 'ANONYMOUS', 'SYSTEM'))
);

CREATE INDEX "audit_log_action_created_at_idx" ON "audit_logs" ("action", "created_at");
CREATE INDEX "audit_log_actor_created_at_idx" ON "audit_logs" ("actor_user_id", "created_at");

CREATE OR REPLACE FUNCTION prevent_audit_log_mutation()
RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'audit_logs are append-only';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER audit_logs_no_update
BEFORE UPDATE ON "audit_logs"
FOR EACH ROW EXECUTE FUNCTION prevent_audit_log_mutation();

CREATE TRIGGER audit_logs_no_delete
BEFORE DELETE ON "audit_logs"
FOR EACH ROW EXECUTE FUNCTION prevent_audit_log_mutation();
