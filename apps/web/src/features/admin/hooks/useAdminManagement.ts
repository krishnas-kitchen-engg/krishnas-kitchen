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

function getAdminErrorMessage(caughtError: unknown, fallback: string): string {
  if (caughtError instanceof Error && caughtError.message) {
    return caughtError.message;
  }

  if (caughtError && typeof caughtError === "object") {
    const errorRecord = caughtError as Record<string, unknown>;
    const message = typeof errorRecord.message === "string" ? errorRecord.message : null;
    const details = typeof errorRecord.details === "string" ? errorRecord.details : null;
    const hint = typeof errorRecord.hint === "string" ? errorRecord.hint : null;
    const code = typeof errorRecord.code === "string" ? errorRecord.code : null;

    return [message, details, hint, code ? `Code: ${code}` : null].filter(Boolean).join(" ");
  }

  return fallback;
}

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
    password: "",
    role: "volunteer" as AppRole,
    scope: "temple" as "organization" | "temple",
    templeId: ""
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
      setError(getAdminErrorMessage(caughtError, "Admin data could not load."));
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
      setError(getAdminErrorMessage(caughtError, "Temple could not be saved."));
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
        setError(getAdminErrorMessage(caughtError, "Temple status could not be updated."));
      } finally {
        setIsSubmitting(false);
      }
    },
    [refresh, scope, service]
  );

  const createUser = useCallback(async () => {
    if (!auth.session?.access_token || !scope) {
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/admin-users", {
        body: JSON.stringify({
          email: userForm.email,
          fullName: userForm.fullName,
          organizationId: scope.organizationId,
          password: userForm.password,
          role: userForm.role,
          templeId: userForm.scope === "organization" ? null : userForm.templeId
        }),
        headers: {
          Authorization: `Bearer ${auth.session.access_token}`,
          "Content-Type": "application/json"
        },
        method: "POST"
      });

      const payload = (await response.json().catch(() => null)) as {
        error?: string;
        linkedExistingAuthUser?: boolean;
        requestCleanupPending?: boolean;
      } | null;

      if (!response.ok) {
        throw new Error(payload?.error ?? "User account could not be created.");
      }

      setUserForm({
        email: "",
        fullName: "",
        password: "",
        role: "volunteer",
        scope: "temple",
        templeId: ""
      });
      setSuccess(
        payload?.requestCleanupPending
          ? "Existing registration linked successfully, but its old request could not be cleared. The user can sign in with the temporary password; refresh Requests before reviewing it again."
          : payload?.linkedExistingAuthUser
            ? "Existing registration linked successfully. Share the temporary password and ask the user to sign in and change it."
            : "User account created. Share the temporary password and ask the user to sign in."
      );
      await refresh();
    } catch (caughtError) {
      setError(getAdminErrorMessage(caughtError, "User account could not be created."));
    } finally {
      setIsSubmitting(false);
    }
  }, [
    auth.session?.access_token,
    refresh,
    scope,
    userForm.email,
    userForm.fullName,
    userForm.password,
    userForm.role,
    userForm.scope,
    userForm.templeId
  ]);

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
        setError(getAdminErrorMessage(caughtError, "User status could not be updated."));
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
      setError(getAdminErrorMessage(caughtError, "Role could not be assigned."));
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
        setError(getAdminErrorMessage(caughtError, "Role could not be removed."));
      } finally {
        setIsSubmitting(false);
      }
    },
    [refresh, scope, service]
  );

  const setTemporaryPassword = useCallback(
    async (userId: string, temporaryPassword: string) => {
      if (!auth.session?.access_token || !scope) return;
      setIsSubmitting(true);
      setError(null);
      setSuccess(null);

      try {
        const response = await fetch("/api/admin-users", {
          body: JSON.stringify({ organizationId: scope.organizationId, temporaryPassword, userId }),
          headers: {
            Authorization: `Bearer ${auth.session.access_token}`,
            "Content-Type": "application/json"
          },
          method: "PATCH"
        });
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        if (!response.ok) throw new Error(payload?.error ?? "Temporary password could not be set.");
        setSuccess("Temporary password set. The user must choose a new password after signing in.");
      } catch (caughtError) {
        setError(getAdminErrorMessage(caughtError, "Temporary password could not be set."));
      } finally {
        setIsSubmitting(false);
      }
    },
    [auth.session?.access_token, scope]
  );

  return {
    activeTemples,
    assignRole,
    canManageAdmin,
    createUser,
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
    setTemporaryPassword,
    setUserArchived,
    setUserForm,
    setUserSearch,
    state,
    submitTemple,
    success,
    templeName,
    templesById,
    userForm,
    userSearch,
    usersById
  };
}
