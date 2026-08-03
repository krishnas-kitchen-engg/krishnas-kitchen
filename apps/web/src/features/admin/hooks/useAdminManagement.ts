import { useCallback, useEffect, useMemo, useState } from "react";
import type { AppRole } from "@krishnas-kitchen/types";

import {
  createAdminManagementService,
  createSupabaseAdminManagementRepository,
  manageableRoles,
  type AdminManagementState,
  type AdminTempleRecord,
  type AdminUserRecord,
  type AdminUserRoleRecord
} from "@/domains/admin";
import { hasAnyPermission, useAuth } from "@/features/auth";

const emptyState: AdminManagementState = {
  roles: [],
  temples: [],
  users: []
};

export type AdminRoleFormState = {
  role: AppRole;
  scope: "organization" | "temple";
  templeId: string;
  userId: string;
};

export function useAdminManagement() {
  const auth = useAuth();
  const canManageAdmin = hasAnyPermission(auth.permissions, [
    "temple.manage",
    "users.manage",
    "roles.manage"
  ]);
  const [state, setState] = useState<AdminManagementState>(emptyState);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [templeName, setTempleName] = useState("");
  const [editingTempleId, setEditingTempleId] = useState<string | null>(null);
  const [userForm, setUserForm] = useState({
    email: "",
    fullName: "",
    userId: ""
  });
  const [roleForm, setRoleForm] = useState<AdminRoleFormState>({
    role: "volunteer",
    scope: "temple",
    templeId: "",
    userId: ""
  });
  const [userSearch, setUserSearch] = useState("");

  const service = useMemo(() => {
    return auth.client
      ? createAdminManagementService(createSupabaseAdminManagementRepository(auth.client))
      : null;
  }, [auth.client]);

  const scope = useMemo(() => {
    if (!auth.profile?.authUserId || !auth.currentOrganization?.id) {
      return null;
    }

    return {
      actorUserId: auth.profile.authUserId,
      organizationId: auth.currentOrganization.id
    };
  }, [auth.currentOrganization?.id, auth.profile?.authUserId]);

  const refresh = useCallback(async () => {
    if (!service || !scope || !canManageAdmin) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      setState(await service.listState(scope));
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Admin data could not load.");
    } finally {
      setIsLoading(false);
    }
  }, [canManageAdmin, scope, service]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const activeTemples = useMemo(
    () => state.temples.filter((temple) => !temple.deletedAt),
    [state.temples]
  );

  const usersById = useMemo(
    () => new Map(state.users.map((user) => [user.id, user])),
    [state.users]
  );

  const templesById = useMemo(
    () => new Map(state.temples.map((temple) => [temple.id, temple])),
    [state.temples]
  );

  const rolesByUserId = useMemo(() => {
    const grouped = new Map<string, AdminUserRoleRecord[]>();

    for (const role of state.roles) {
      grouped.set(role.userId, [...(grouped.get(role.userId) ?? []), role]);
    }

    return grouped;
  }, [state.roles]);

  const filteredUsers = useMemo(() => {
    const query = userSearch.trim().toLowerCase();

    if (!query) {
      return state.users;
    }

    return state.users.filter(
      (user) =>
        user.fullName.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.id.toLowerCase().includes(query)
    );
  }, [state.users, userSearch]);

  const submitTemple = useCallback(async () => {
    if (!service || !scope) {
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      if (editingTempleId) {
        await service.updateTemple({
          ...scope,
          id: editingTempleId,
          name: templeName
        });
        setSuccess("Temple updated.");
      } else {
        await service.createTemple({
          ...scope,
          name: templeName
        });
        setSuccess("Temple created.");
      }

      setTempleName("");
      setEditingTempleId(null);
      await refresh();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Temple could not be saved.");
    } finally {
      setIsSubmitting(false);
    }
  }, [editingTempleId, refresh, scope, service, templeName]);

  const editTemple = useCallback((temple: AdminTempleRecord) => {
    setEditingTempleId(temple.id);
    setTempleName(temple.name);
  }, []);

  const setTempleArchived = useCallback(
    async (temple: AdminTempleRecord, shouldArchive: boolean) => {
      if (!service || !scope) {
        return;
      }

      setIsSubmitting(true);
      setError(null);
      setSuccess(null);

      try {
        await service.setTempleArchived({
          ...scope,
          archivedAt: shouldArchive ? new Date().toISOString() : null,
          id: temple.id
        });
        setSuccess(shouldArchive ? "Temple archived." : "Temple restored.");
        await refresh();
      } catch (caughtError) {
        setError(
          caughtError instanceof Error ? caughtError.message : "Temple status could not be updated."
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [refresh, scope, service]
  );

  const upsertUser = useCallback(async () => {
    if (!service || !scope) {
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      await service.upsertUser({
        ...scope,
        email: userForm.email,
        fullName: userForm.fullName,
        userId: userForm.userId
      });
      setUserForm({
        email: "",
        fullName: "",
        userId: ""
      });
      setSuccess(
        "User profile saved. Ask the user to sign out and sign in again after roles are assigned."
      );
      await refresh();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error ? caughtError.message : "User profile could not be saved."
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [refresh, scope, service, userForm.email, userForm.fullName, userForm.userId]);

  const setUserArchived = useCallback(
    async (user: AdminUserRecord, shouldArchive: boolean) => {
      if (!service || !scope) {
        return;
      }

      setIsSubmitting(true);
      setError(null);
      setSuccess(null);

      try {
        await service.setUserArchived({
          ...scope,
          archivedAt: shouldArchive ? new Date().toISOString() : null,
          userId: user.id
        });
        setSuccess(shouldArchive ? "User archived." : "User restored.");
        await refresh();
      } catch (caughtError) {
        setError(
          caughtError instanceof Error ? caughtError.message : "User status could not be updated."
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [refresh, scope, service]
  );

  const assignRole = useCallback(async () => {
    if (!service || !scope) {
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      await service.assignRole({
        ...scope,
        role: roleForm.role,
        templeId: roleForm.scope === "organization" ? null : roleForm.templeId,
        userId: roleForm.userId
      });
      setSuccess(
        "Role assigned. The user should sign out and sign in again to receive the updated app session."
      );
      await refresh();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Role could not be assigned.");
    } finally {
      setIsSubmitting(false);
    }
  }, [refresh, roleForm.role, roleForm.scope, roleForm.templeId, roleForm.userId, scope, service]);

  const removeRole = useCallback(
    async (role: AdminUserRoleRecord) => {
      if (!service || !scope) {
        return;
      }

      setIsSubmitting(true);
      setError(null);
      setSuccess(null);

      try {
        await service.removeRole({
          ...scope,
          roleId: role.id,
          userId: role.userId
        });
        setSuccess("Role removed. The user should sign out and sign in again.");
        await refresh();
      } catch (caughtError) {
        setError(caughtError instanceof Error ? caughtError.message : "Role could not be removed.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [refresh, scope, service]
  );

  return {
    activeTemples,
    assignRole,
    canManageAdmin,
    editTemple,
    editingTempleId,
    error,
    filteredUsers,
    isLoading,
    isSubmitting,
    manageableRoles,
    refresh,
    removeRole,
    roleForm,
    rolesByUserId,
    setRoleForm,
    setTempleArchived,
    setTempleName,
    setUserArchived,
    setUserForm,
    setUserSearch,
    state,
    submitTemple,
    success,
    templeName,
    templesById,
    upsertUser,
    userForm,
    userSearch,
    usersById
  };
}
