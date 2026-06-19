import "server-only";

import { z } from "zod";

export const appEnvValues = [
  "local",
  "test",
  "preview",
  "staging",
  "production",
] as const;

const optionalSecret = z.string().trim().min(1).optional();

export const serverEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  APP_ENV: z.enum(appEnvValues),
  APP_URL: z.string().url(),
  DATABASE_URL: z.string().url(),
  DIRECT_URL: z.string().url(),
  SENTRY_DSN: optionalSecret,
  SENTRY_AUTH_TOKEN: optionalSecret,
  SENTRY_ORG: optionalSecret,
  SENTRY_PROJECT: optionalSecret,
  INNGEST_EVENT_KEY: optionalSecret,
  INNGEST_SIGNING_KEY: optionalSecret,
  UPSTASH_REDIS_REST_URL: optionalSecret,
  UPSTASH_REDIS_REST_TOKEN: optionalSecret,
  BETTER_AUTH_SECRET: optionalSecret,
  BETTER_AUTH_URL: optionalSecret,
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export function parseServerEnv(input: Record<string, string | undefined>): ServerEnv {
  return serverEnvSchema.parse(input);
}

let cachedServerEnv: ServerEnv | undefined;

export function getServerEnv(): ServerEnv {
  cachedServerEnv ??= parseServerEnv(process.env);
  return cachedServerEnv;
}

export function resetServerEnvCacheForTests(): void {
  cachedServerEnv = undefined;
}

export function isProductionEnvironment(env = getServerEnv()): boolean {
  return env.APP_ENV === "production";
}

export function getAuthSecret(env = getServerEnv()): string {
  if (env.BETTER_AUTH_SECRET) {
    return env.BETTER_AUTH_SECRET;
  }

  if (env.APP_ENV === "production" || env.APP_ENV === "staging") {
    throw new Error("BETTER_AUTH_SECRET is required outside local/test/preview.");
  }

  return "deodar-wears-local-development-auth-secret-change-before-production";
}
