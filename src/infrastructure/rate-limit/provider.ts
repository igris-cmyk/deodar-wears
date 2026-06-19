import "server-only";

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

import { ApplicationError } from "@/infrastructure/errors/application-error";
import { hashSensitiveKey } from "@/infrastructure/logging/redaction";

export type RateLimitCheck = {
  policy: string;
  key: string;
  sensitive?: boolean;
};

export type RateLimitResult = {
  allowed: boolean;
  limit: number;
  remaining: number;
  retryAfterSeconds?: number;
};

export type RateLimitProvider = {
  check(input: RateLimitCheck): Promise<RateLimitResult>;
};

export const rateLimitPolicies = {
  "platform.health-sensitive": { requests: 60, window: "1 m" },
  "auth.sign-in": { requests: 5, window: "10 m" },
  "auth.register": { requests: 4, window: "30 m" },
  "auth.verify-email": { requests: 8, window: "30 m" },
  "auth.resend-verification": { requests: 3, window: "30 m" },
  "auth.forgot-password": { requests: 3, window: "30 m" },
  "auth.password-reset": { requests: 3, window: "30 m" },
  "auth.reset-password": { requests: 3, window: "30 m" },
  "auth.mfa-verify": { requests: 6, window: "10 m" },
  "auth.mfa-recovery": { requests: 3, window: "30 m" },
  "admin.bootstrap": { requests: 2, window: "1 h" },
  "payment.create": { requests: 10, window: "1 m" },
  "guest-order.lookup": { requests: 20, window: "10 m" },
} as const;

export class DevelopmentRateLimitProvider implements RateLimitProvider {
  private readonly counters = new Map<string, number>();

  public async check(input: RateLimitCheck): Promise<RateLimitResult> {
    const policy = getPolicy(input.policy);
    const key = `${input.policy}:${input.sensitive ? hashSensitiveKey(input.key) : input.key}`;
    const count = (this.counters.get(key) ?? 0) + 1;
    this.counters.set(key, count);

    return {
      allowed: count <= policy.requests,
      limit: policy.requests,
      remaining: Math.max(policy.requests - count, 0),
      retryAfterSeconds: count > policy.requests ? 60 : undefined,
    };
  }
}

export class UpstashRateLimitProvider implements RateLimitProvider {
  public async check(input: RateLimitCheck): Promise<RateLimitResult> {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url || !token) {
      throw new ApplicationError({
        code: "CONFIGURATION_ERROR",
        message: "Upstash rate limit provider requires Redis configuration.",
        status: 500,
      });
    }

    const policy = getPolicy(input.policy);
    const redis = new Redis({ url, token });
    const ratelimit = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(policy.requests, policy.window),
      analytics: false,
      prefix: `deodar:${input.policy}`,
    });
    const identifier = input.sensitive ? hashSensitiveKey(input.key) : input.key;
    const result = await ratelimit.limit(identifier);

    return {
      allowed: result.success,
      limit: result.limit,
      remaining: result.remaining,
      retryAfterSeconds: Math.max(Math.ceil((result.reset - Date.now()) / 1000), 0),
    };
  }
}

export function createRateLimitProvider(appEnv = process.env.APP_ENV): RateLimitProvider {
  if (appEnv === "production" || appEnv === "staging" || appEnv === "preview") {
    return new UpstashRateLimitProvider();
  }

  return new DevelopmentRateLimitProvider();
}

function getPolicy(policy: string): {
  requests: number;
  window: `${number} ${"s" | "m" | "h"}`;
} {
  const value = rateLimitPolicies[policy as keyof typeof rateLimitPolicies];

  if (!value) {
    throw new ApplicationError({
      code: "CONFIGURATION_ERROR",
      message: `Unknown rate limit policy: ${policy}`,
      status: 500,
    });
  }

  return value;
}
