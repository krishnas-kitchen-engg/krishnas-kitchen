import type { AppRole, Permission } from "@krishnas-kitchen/types";

export const appRoles = [
  "volunteer",
  "cook",
  "senior_cook",
  "inventory_manager",
  "temple_admin",
  "super_admin"
] satisfies AppRole[];

export const inventoryPermissions = [
  "inventory.read",
  "inventory.receive",
  "inventory.transfer",
  "inventory.consume",
  "inventory.return",
  "inventory.adjust",
  "inventory.undo"
] satisfies Permission[];

const operationalInventoryPermissions = [
  "inventory.read",
  "inventory.receive",
  "inventory.transfer",
  "inventory.consume",
  "inventory.return"
] satisfies Permission[];

export const rolePermissions = {
  volunteer: [
    "locations.read",
    "items.read",
    "inventory.read",
    "inventory.receive",
    "inventory.transfer",
    "inventory.consume",
    "inventory.return",
    "volunteer_sessions.create"
  ],
  cook: [
    "locations.read",
    "items.read",
    ...operationalInventoryPermissions,
    "volunteer_sessions.create"
  ],
  senior_cook: [
    "locations.read",
    "items.read",
    "items.create",
    "items.edit",
    ...operationalInventoryPermissions,
    "volunteer_sessions.create"
  ],
  inventory_manager: [
    "locations.read",
    "locations.create",
    "locations.edit",
    "items.read",
    "items.create",
    "items.edit",
    "items.archive",
    ...inventoryPermissions,
    "volunteer_sessions.create",
    "volunteer_sessions.expire"
  ],
  temple_admin: [
    "temple.manage",
    "users.manage",
    "roles.manage",
    "locations.read",
    "locations.create",
    "locations.edit",
    "items.read",
    "items.create",
    "items.edit",
    "items.archive",
    ...inventoryPermissions,
    "volunteer_sessions.create",
    "volunteer_sessions.expire",
    "audit.read"
  ],
  super_admin: [
    "organization.manage",
    "temple.manage",
    "users.manage",
    "roles.manage",
    "locations.read",
    "locations.create",
    "locations.edit",
    "items.read",
    "items.create",
    "items.edit",
    "items.archive",
    ...inventoryPermissions,
    "volunteer_sessions.create",
    "volunteer_sessions.expire",
    "audit.read"
  ]
} satisfies Record<AppRole, Permission[]>;

const temporaryVolunteerPermissions = [
  "locations.read",
  "items.read",
  "inventory.read",
  "inventory.transfer",
  "inventory.consume",
  "inventory.return"
] satisfies Permission[];

const privilegedRoles: readonly AppRole[] = ["inventory_manager", "temple_admin", "super_admin"];

export function isAppRole(value: unknown): value is AppRole {
  return typeof value === "string" && appRoles.includes(value as AppRole);
}

export function getPermissionsForRoles(roles: readonly AppRole[]): Permission[] {
  return Array.from(new Set(roles.flatMap((role) => rolePermissions[role])));
}

export function getTemporaryVolunteerPermissions(): Permission[] {
  return [...temporaryVolunteerPermissions];
}

export function hasPermission(
  permissions: readonly Permission[],
  permission: Permission | undefined
): boolean {
  return permission ? permissions.includes(permission) : true;
}

export function hasAnyPermission(
  permissions: readonly Permission[],
  requiredPermissions: readonly Permission[]
): boolean {
  return (
    requiredPermissions.length === 0 ||
    requiredPermissions.some((permission) => permissions.includes(permission))
  );
}

export function isPrivilegedRole(role: AppRole): boolean {
  return privilegedRoles.includes(role);
}
