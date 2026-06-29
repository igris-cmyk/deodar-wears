import "server-only";

import { requireAdmin, requirePermission } from "@/modules/auth/authorization";
import { getCurrentRequestContext } from "@/modules/auth/session-context";

import type { PermissionCode } from "./permissions";

export async function requireAdminPagePermission(permission: PermissionCode) {
  const context = await getCurrentRequestContext();
  requireAdmin(context.actor);
  requirePermission(context.actor, permission);
  return context;
}
