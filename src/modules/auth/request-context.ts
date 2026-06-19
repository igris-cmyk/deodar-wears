import "server-only";

import type { AuthenticatedAdmin, AuthenticatedCustomer } from "./authorization";
import { createRequestContext } from "@/infrastructure/request/context";

export type RequestActor =
  | AuthenticatedCustomer
  | AuthenticatedAdmin
  | { type: "GUEST"; guestId: string }
  | { type: "ANONYMOUS" }
  | { type: "SYSTEM"; source: string };

export type RequestContext = ReturnType<typeof createRequestContext> & {
  actor: RequestActor;
};

export function createAnonymousRequestContext(input: {
  headers?: Headers;
  ipAddress?: string;
  now?: Date;
  environment?: string;
}): RequestContext {
  return {
    ...createRequestContext(input),
    actor: { type: "ANONYMOUS" },
  };
}
