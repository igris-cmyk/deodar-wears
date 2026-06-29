import "server-only";

import { headers } from "next/headers";

import { prisma } from "@/infrastructure/database/prisma";
import { createRequestContext } from "@/infrastructure/request/context";

import { auth } from "./auth.config";
import type { RequestContext } from "./request-context";

type BetterAuthSessionResult = {
  session?: {
    id?: string;
    userId?: string;
    mfaVerifiedAt?: Date | string | null;
    freshUntil?: Date | string | null;
  } | null;
  user?: { id?: string } | null;
} | null;

export async function getCurrentRequestContext(): Promise<RequestContext> {
  const requestHeaders = await headers();
  const base = createRequestContext({
    headers: requestHeaders,
    environment: process.env.APP_ENV ?? "unknown",
  });
  const authSession = (await auth.api.getSession({
    headers: requestHeaders,
  })) as BetterAuthSessionResult;
  const userId = authSession?.user?.id ?? authSession?.session?.userId;

  if (!userId) {
    return { ...base, actor: { type: "ANONYMOUS" } };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      disabledAt: true,
      customerProfile: { select: { id: true } },
      adminMembership: {
        select: {
          id: true,
          active: true,
          requiresMfa: true,
          roles: {
            include: {
              role: {
                include: {
                  permissions: { include: { permission: true } },
                },
              },
            },
          },
        },
      },
    },
  });

  if (user?.adminMembership) {
    return {
      ...base,
      actor: {
        type: "ADMIN",
        userId,
        adminMembershipId: user.adminMembership.id,
        sessionId: authSession?.session?.id ?? "unknown-session",
        permissions: new Set(
          user.adminMembership.roles.flatMap((entry) =>
            entry.role.permissions.map(
              (permissionEntry) => permissionEntry.permission.code,
            ),
          ),
        ),
        mfaVerifiedAt: toDate(authSession?.session?.mfaVerifiedAt),
        sessionFreshUntil: toDate(authSession?.session?.freshUntil),
        active: user.adminMembership.active,
        requiresMfa: user.adminMembership.requiresMfa,
        userDisabledAt: user.disabledAt,
      },
    };
  }

  if (user?.customerProfile) {
    return {
      ...base,
      actor: {
        type: "CUSTOMER",
        userId,
        customerId: user.customerProfile.id,
        sessionId: authSession?.session?.id ?? "unknown-session",
      },
    };
  }

  return { ...base, actor: { type: "ANONYMOUS" } };
}

function toDate(value: Date | string | null | undefined): Date | null {
  if (!value) return null;
  return value instanceof Date ? value : new Date(value);
}
