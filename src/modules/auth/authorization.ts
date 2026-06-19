import "server-only";

import { ApplicationError } from "@/infrastructure/errors/application-error";

import type { PermissionCode } from "../admin/permissions";

export type AuthenticatedCustomer = {
  type: "CUSTOMER";
  userId: string;
  customerId: string;
  sessionId: string;
};

export type AuthenticatedAdmin = {
  type: "ADMIN";
  userId: string;
  adminMembershipId: string;
  sessionId: string;
  permissions: ReadonlySet<string>;
  mfaVerifiedAt: Date | null;
  sessionFreshUntil: Date | null;
  active: boolean;
  requiresMfa: boolean;
  userDisabledAt?: Date | null;
};

export function requireCustomer(actor: unknown): asserts actor is AuthenticatedCustomer {
  if (
    !actor ||
    typeof actor !== "object" ||
    (actor as { type?: string }).type !== "CUSTOMER"
  ) {
    throw new ApplicationError({
      code: "AUTHENTICATION_REQUIRED",
      message: "Customer sign in is required.",
      status: 401,
    });
  }
}

export function requireCustomerOwnership(
  actor: AuthenticatedCustomer,
  resourceCustomerId: string,
): void {
  if (actor.customerId !== resourceCustomerId) {
    throw new ApplicationError({
      code: "RESOURCE_NOT_OWNED",
      message: "This resource is not owned by the current customer.",
      status: 403,
    });
  }
}

export function requireAdmin(actor: unknown): asserts actor is AuthenticatedAdmin {
  if (
    !actor ||
    typeof actor !== "object" ||
    (actor as { type?: string }).type !== "ADMIN"
  ) {
    throw new ApplicationError({
      code: "AUTHENTICATION_REQUIRED",
      message: "Administrator sign in is required.",
      status: 401,
    });
  }

  const admin = actor as AuthenticatedAdmin;

  if (admin.userDisabledAt) {
    throw new ApplicationError({
      code: "USER_DISABLED",
      message: "This user is disabled.",
      status: 403,
    });
  }

  if (!admin.active) {
    throw new ApplicationError({
      code: "ADMIN_MEMBERSHIP_INACTIVE",
      message: "Administrator membership is inactive.",
      status: 403,
    });
  }
}

export function requirePermission(
  actor: AuthenticatedAdmin,
  permission: PermissionCode,
): void {
  if (!actor.permissions.has(permission)) {
    throw new ApplicationError({
      code: "PERMISSION_DENIED",
      message: "Permission denied.",
      status: 403,
    });
  }
}

export function requireMfa(actor: AuthenticatedAdmin): void {
  if (actor.requiresMfa && !actor.mfaVerifiedAt) {
    throw new ApplicationError({
      code: "MFA_REQUIRED",
      message: "Multi-factor verification is required.",
      status: 403,
    });
  }
}

export function requireFreshSession(actor: AuthenticatedAdmin, now = new Date()): void {
  if (!actor.sessionFreshUntil || actor.sessionFreshUntil <= now) {
    throw new ApplicationError({
      code: "SESSION_NOT_FRESH",
      message: "A fresh administrator session is required.",
      status: 403,
    });
  }
}

export function requireGuestAccessToken(): never {
  throw new ApplicationError({
    code: "AUTHENTICATION_REQUIRED",
    message: "Guest access tokens are not active until later commerce phases.",
    status: 401,
  });
}
