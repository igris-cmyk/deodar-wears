import "server-only";

import type { z } from "zod";

import { ApplicationError } from "@/infrastructure/errors/application-error";
import { mapErrorToSafeResponse } from "@/infrastructure/errors/map-error";
import { createRateLimitProvider } from "@/infrastructure/rate-limit/provider";

import {
  requireAdmin,
  requireMfa,
  requirePermission,
  requireFreshSession,
} from "./authorization";
import { createAnonymousRequestContext, type RequestContext } from "./request-context";
import type { PermissionCode } from "../admin/permissions";

export type ActionResult<T> =
  | {
      ok: true;
      data: T;
      meta?: { requestId: string; warnings?: { code: string; message: string }[] };
    }
  | {
      ok: false;
      error: {
        code: string;
        message: string;
        fieldErrors?: Record<string, string[]>;
        recovery?: {
          action: "RETRY" | "REFRESH" | "SIGN_IN" | "CONTACT_SUPPORT";
          href?: string;
        };
        reference?: string;
      };
    };

export async function executeAction<Input, Output>(options: {
  schema: z.ZodSchema<Input>;
  input: unknown;
  requireAuth?: "CUSTOMER" | "ADMIN";
  permission?: PermissionCode;
  requireFreshSession?: boolean;
  requireMfa?: boolean;
  rateLimit?: { policy: string; key: string; sensitive?: boolean; failClosed?: boolean };
  context?: RequestContext;
  execute: (input: Input, context: RequestContext) => Promise<Output>;
}): Promise<ActionResult<Output>> {
  const context = options.context ?? createAnonymousRequestContext({});

  try {
    const input = options.schema.parse(options.input);

    if (options.rateLimit) {
      const provider = createRateLimitProvider();
      const result = await provider.check(options.rateLimit);

      if (!result.allowed) {
        throw new ApplicationError({
          code: "RATE_LIMITED",
          message: "Too many requests.",
          status: 429,
          expose: true,
        });
      }
    }

    if (options.requireAuth === "ADMIN") {
      requireAdmin(context.actor);
      if (options.permission) requirePermission(context.actor, options.permission);
      if (options.requireMfa) requireMfa(context.actor);
      if (options.requireFreshSession) requireFreshSession(context.actor);
    }

    return {
      ok: true,
      data: await options.execute(input, context),
      meta: { requestId: context.requestId },
    };
  } catch (error) {
    const mapped = mapErrorToSafeResponse(error, context.requestId);
    return {
      ok: false,
      error: {
        code: mapped.error.code,
        message: mapped.error.message,
        reference: mapped.error.reference,
      },
    };
  }
}
