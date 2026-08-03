import type { AppRole } from "@krishnas-kitchen/types";

export type AdminTempleRecord = {
  createdAt: string;
  deletedAt: string | null;
  id: string;
  name: string;
  organizationId: string;
  updatedAt: string;
};

export type AdminUserRecord = {
  createdAt: string;
  deletedAt: string | null;
  email: string;
  fullName: string;
  id: string;
  organizationId: string;
  updatedAt: string;
};

export type AdminUserRoleRecord = {
  createdAt: string;
  id: string;
  organizationId: string;
  role: AppRole;
  templeId: string | null;
  userId: string;
};

export type AdminManagementScope = {
  actorUserId: string;
  organizationId: string;
};

export type CreateTempleInput = AdminManagementScope & {
  name: string;
};

export type UpdateTempleInput = AdminManagementScope & {
  id: string;
  name: string;
};

export type SetTempleArchivedInput = AdminManagementScope & {
  archivedAt: string | null;
  id: string;
};

export type UpsertUserInput = AdminManagementScope & {
  email: string;
  fullName: string;
  userId: string;
};

export type SetUserArchivedInput = AdminManagementScope & {
  archivedAt: string | null;
  userId: string;
};

export type AssignRoleInput = AdminManagementScope & {
  role: AppRole;
  templeId: string | null;
  userId: string;
};

export type RemoveRoleInput = AdminManagementScope & {
  roleId: string;
  userId: string;
};

export type AdminManagementState = {
  roles: AdminUserRoleRecord[];
  temples: AdminTempleRecord[];
  users: AdminUserRecord[];
};

export type AdminManagementRepository = {
  assignRole(input: AssignRoleInput): Promise<AdminUserRoleRecord>;
  createTemple(input: CreateTempleInput): Promise<AdminTempleRecord>;
  listState(scope: AdminManagementScope): Promise<AdminManagementState>;
  refreshOrganizationAppMetadata(input: {
    actorUserId: string;
    organizationId: string;
  }): Promise<void>;
  refreshUserAppMetadata(input: {
    actorUserId: string;
    organizationId: string;
    userId: string;
  }): Promise<void>;
  removeRole(input: RemoveRoleInput): Promise<void>;
  setTempleArchived(input: SetTempleArchivedInput): Promise<AdminTempleRecord>;
  setUserArchived(input: SetUserArchivedInput): Promise<AdminUserRecord>;
  updateTemple(input: UpdateTempleInput): Promise<AdminTempleRecord>;
  upsertUser(input: UpsertUserInput): Promise<AdminUserRecord>;
};

export const manageableRoles = [
  "volunteer",
  "cook",
  "senior_cook",
  "inventory_manager",
  "temple_admin",
  "super_admin"
] satisfies AppRole[];

function normalizeText(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

function assertRequired(value: string, message: string): string {
  const normalized = normalizeText(value);

  if (!normalized) {
    throw new Error(message);
  }

  return normalized;
}

function assertId(value: string, message: string): string {
  const id = value.trim();

  if (!id) {
    throw new Error(message);
  }

  return id;
}

function assertValidRole(role: AppRole): AppRole {
  if (!manageableRoles.includes(role)) {
    throw new Error("Choose a valid role.");
  }

  return role;
}

function assertCanAssignRole(input: AssignRoleInput): void {
  if (input.role === "super_admin" && input.templeId) {
    throw new Error("Super admin must be assigned at the organization level.");
  }
}

export function createAdminManagementService(repository: AdminManagementRepository) {
  return {
    assignRole(input: AssignRoleInput) {
      const normalizedInput = {
        ...input,
        actorUserId: assertId(input.actorUserId, "Current admin user is required."),
        organizationId: assertId(input.organizationId, "Organization is required."),
        role: assertValidRole(input.role),
        templeId: input.templeId ? assertId(input.templeId, "Temple is required.") : null,
        userId: assertId(input.userId, "User is required.")
      };
      assertCanAssignRole(normalizedInput);

      return repository.assignRole(normalizedInput);
    },

    createTemple(input: CreateTempleInput) {
      return repository.createTemple({
        ...input,
        actorUserId: assertId(input.actorUserId, "Current admin user is required."),
        name: assertRequired(input.name, "Temple name is required."),
        organizationId: assertId(input.organizationId, "Organization is required.")
      });
    },

    listState(scope: AdminManagementScope) {
      return repository.listState({
        actorUserId: assertId(scope.actorUserId, "Current admin user is required."),
        organizationId: assertId(scope.organizationId, "Organization is required.")
      });
    },

    async removeRole(input: RemoveRoleInput) {
      const normalizedInput = {
        ...input,
        actorUserId: assertId(input.actorUserId, "Current admin user is required."),
        organizationId: assertId(input.organizationId, "Organization is required."),
        roleId: assertId(input.roleId, "Role assignment is required."),
        userId: assertId(input.userId, "User is required.")
      };

      await repository.removeRole(normalizedInput);
    },

    setTempleArchived(input: SetTempleArchivedInput) {
      return repository.setTempleArchived({
        ...input,
        actorUserId: assertId(input.actorUserId, "Current admin user is required."),
        id: assertId(input.id, "Temple is required."),
        organizationId: assertId(input.organizationId, "Organization is required.")
      });
    },

    setUserArchived(input: SetUserArchivedInput) {
      const normalizedInput = {
        ...input,
        actorUserId: assertId(input.actorUserId, "Current admin user is required."),
        organizationId: assertId(input.organizationId, "Organization is required."),
        userId: assertId(input.userId, "User is required.")
      };

      if (normalizedInput.userId === normalizedInput.actorUserId && normalizedInput.archivedAt) {
        throw new Error("You cannot archive your own admin profile while signed in.");
      }

      return repository.setUserArchived(normalizedInput);
    },

    updateTemple(input: UpdateTempleInput) {
      return repository.updateTemple({
        ...input,
        actorUserId: assertId(input.actorUserId, "Current admin user is required."),
        id: assertId(input.id, "Temple is required."),
        name: assertRequired(input.name, "Temple name is required."),
        organizationId: assertId(input.organizationId, "Organization is required.")
      });
    },

    async upsertUser(input: UpsertUserInput) {
      const email = normalizeEmail(input.email);

      if (!email) {
        throw new Error("Email is required.");
      }

      if (!email.includes("@")) {
        throw new Error("Enter a valid email address.");
      }

      const normalizedInput = {
        ...input,
        actorUserId: assertId(input.actorUserId, "Current admin user is required."),
        email,
        fullName: assertRequired(input.fullName, "Full name is required."),
        organizationId: assertId(input.organizationId, "Organization is required."),
        userId: assertId(input.userId, "Supabase Auth user ID is required.")
      };

      const user = await repository.upsertUser(normalizedInput);
      await repository.refreshUserAppMetadata({
        actorUserId: normalizedInput.actorUserId,
        organizationId: normalizedInput.organizationId,
        userId: normalizedInput.userId
      });

      return user;
    }
  };
}
