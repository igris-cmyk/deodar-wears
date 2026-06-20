export const permissionCodes = [
  "admin.access",
  "admin.manage_roles",
  "admin.disable",
  "audit.read",
  "customer.read",
  "customer.read_sensitive",
  "product.read",
  "product.write",
  "product.publish",
  "catalog.products.read",
  "catalog.products.create",
  "catalog.products.update",
  "catalog.products.archive",
  "catalog.categories.manage",
  "catalog.collections.manage",
  "catalog.media.manage",
  "inventory.read",
  "inventory.adjust",
  "inventory.override",
  "order.read",
  "order.hold",
  "order.fulfil",
  "return.read",
  "return.review",
  "return.receive",
  "return.inspect",
  "refund.read",
  "refund.approve",
  "refund.submit",
  "promotion.read",
  "promotion.write",
  "content.read",
  "content.write",
  "drop.schedule",
  "settings.read",
  "settings.commerce.write",
  "settings.legal.write",
  "support.read",
  "support.respond",
  "analytics.read",
] as const;

export type PermissionCode = (typeof permissionCodes)[number];

export const roleCodes = [
  "SUPER_ADMIN",
  "CATALOGUE_MANAGER",
  "INVENTORY_OPERATOR",
  "ORDER_OPERATOR",
  "RETURNS_OPERATOR",
  "CONTENT_EDITOR",
  "SUPPORT_AGENT",
  "ANALYST",
] as const;

export type RoleCode = (typeof roleCodes)[number];

export const roleDefinitions: Record<RoleCode, { name: string; description: string }> = {
  SUPER_ADMIN: {
    name: "Super admin",
    description:
      "Full administrative authority across identity, security and commerce settings.",
  },
  CATALOGUE_MANAGER: {
    name: "Catalogue manager",
    description: "Manages future product and content publication workflows.",
  },
  INVENTORY_OPERATOR: {
    name: "Inventory operator",
    description: "Manages future inventory reads and adjustments.",
  },
  ORDER_OPERATOR: {
    name: "Order operator",
    description: "Manages future order fulfilment workflows.",
  },
  RETURNS_OPERATOR: {
    name: "Returns operator",
    description: "Manages future return review and inspection workflows.",
  },
  CONTENT_EDITOR: {
    name: "Content editor",
    description: "Manages future editorial and campaign content.",
  },
  SUPPORT_AGENT: {
    name: "Support agent",
    description: "Supports customers with limited customer and order context.",
  },
  ANALYST: {
    name: "Analyst",
    description: "Reads approved aggregate analytics without customer-sensitive access.",
  },
};

export const rolePermissionMapping: Record<RoleCode, readonly PermissionCode[]> = {
  SUPER_ADMIN: permissionCodes,
  CATALOGUE_MANAGER: [
    "admin.access",
    "product.read",
    "product.write",
    "product.publish",
    "catalog.products.read",
    "catalog.products.create",
    "catalog.products.update",
    "catalog.products.archive",
    "catalog.categories.manage",
    "catalog.collections.manage",
    "catalog.media.manage",
    "content.read",
    "content.write",
    "promotion.read",
  ],
  INVENTORY_OPERATOR: [
    "admin.access",
    "product.read",
    "catalog.products.read",
    "inventory.read",
    "inventory.adjust",
  ],
  ORDER_OPERATOR: [
    "admin.access",
    "order.read",
    "order.hold",
    "order.fulfil",
    "customer.read",
  ],
  RETURNS_OPERATOR: [
    "admin.access",
    "return.read",
    "return.review",
    "return.receive",
    "return.inspect",
    "order.read",
  ],
  CONTENT_EDITOR: [
    "admin.access",
    "content.read",
    "content.write",
    "product.read",
    "catalog.products.read",
  ],
  SUPPORT_AGENT: [
    "admin.access",
    "support.read",
    "support.respond",
    "customer.read",
    "order.read",
    "return.read",
  ],
  ANALYST: ["admin.access", "analytics.read", "product.read", "catalog.products.read"],
};

export function resolvePermissionUnion(
  roles: readonly RoleCode[],
): ReadonlySet<PermissionCode> {
  const permissions = new Set<PermissionCode>();

  for (const role of roles) {
    for (const permission of rolePermissionMapping[role]) {
      permissions.add(permission);
    }
  }

  return permissions;
}

export function isPermissionCode(value: string): value is PermissionCode {
  return (permissionCodes as readonly string[]).includes(value);
}

export function isRoleCode(value: string): value is RoleCode {
  return (roleCodes as readonly string[]).includes(value);
}
