import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@krishnas-kitchen/types";

import type {
  AdminManagementRepository,
  AdminTempleRecord,
  AdminUserRecord,
  AdminUserRoleRecord
} from "../../application/adminManagementService";

type TempleRow = Database["public"]["Tables"]["temples"]["Row"];
type UserRow = Database["public"]["Tables"]["users"]["Row"];
type UserRoleRow = Database["public"]["Tables"]["user_roles"]["Row"];

function mapTemple(row: TempleRow): AdminTempleRecord {
  return {
    createdAt: row.created_at,
    deletedAt: row.deleted_at,
    id: row.id,
    name: row.name,
    organizationId: row.organization_id,
    updatedAt: row.updated_at
  };
}

function mapUser(row: UserRow): AdminUserRecord {
  return {
    createdAt: row.created_at,
    deletedAt: row.deleted_at,
    email: row.email,
    fullName: row.full_name,
    id: row.id,
    organizationId: row.organization_id,
    updatedAt: row.updated_at
  };
}

function mapRole(row: UserRoleRow): AdminUserRoleRecord {
  return {
    createdAt: row.created_at,
    id: row.id,
    organizationId: row.organization_id,
    role: row.role,
    templeId: row.temple_id,
    userId: row.user_id
  };
}

export function createSupabaseAdminManagementRepository(
  client: SupabaseClient<Database>
): AdminManagementRepository {
  async function refreshUserAppMetadata(input: {
    actorUserId: string;
    organizationId: string;
    userId: string;
  }) {
    const { error } = await client.rpc("admin_refresh_user_app_metadata", {
      p_actor_user_id: input.actorUserId,
      p_organization_id: input.organizationId,
      p_user_id: input.userId
    });

    if (error) {
      throw error;
    }
  }

  async function refreshOrganizationAppMetadata(input: {
    actorUserId: string;
    organizationId: string;
  }) {
    const { error } = await client.rpc("admin_refresh_organization_app_metadata", {
      p_actor_user_id: input.actorUserId,
      p_organization_id: input.organizationId
    });

    if (error) {
      throw error;
    }
  }

  return {
    async assignRole(input) {
      const { data: existingRoles, error: existingRolesError } = await client
        .from("user_roles")
        .select("*")
        .eq("organization_id", input.organizationId)
        .eq("user_id", input.userId)
        .eq("role", input.role);

      if (existingRolesError) {
        throw existingRolesError;
      }

      const duplicateRole = existingRoles.some(
        (role) => (role.temple_id ?? null) === (input.templeId ?? null)
      );

      if (duplicateRole) {
        throw new Error("This role assignment already exists.");
      }

      const { data, error } = await client
        .from("user_roles")
        .insert({
          organization_id: input.organizationId,
          role: input.role,
          temple_id: input.templeId,
          user_id: input.userId
        })
        .select("*")
        .single();

      if (error || !data) {
        throw error ?? new Error("Role assignment returned no row.");
      }

      await refreshUserAppMetadata({
        actorUserId: input.actorUserId,
        organizationId: input.organizationId,
        userId: input.userId
      });

      return mapRole(data);
    },

    async createTemple(input) {
      const { data, error } = await client
        .from("temples")
        .insert({
          name: input.name,
          organization_id: input.organizationId
        })
        .select("*")
        .single();

      if (error || !data) {
        throw error ?? new Error("Temple creation returned no row.");
      }

      await refreshOrganizationAppMetadata({
        actorUserId: input.actorUserId,
        organizationId: input.organizationId
      });

      return mapTemple(data);
    },

    async listState(scope) {
      const [templesResult, usersResult, rolesResult] = await Promise.all([
        client
          .from("temples")
          .select("*")
          .eq("organization_id", scope.organizationId)
          .order("deleted_at", { ascending: true, nullsFirst: true })
          .order("name", { ascending: true })
          .order("id", { ascending: true }),
        client
          .from("users")
          .select("*")
          .eq("organization_id", scope.organizationId)
          .order("deleted_at", { ascending: true, nullsFirst: true })
          .order("full_name", { ascending: true })
          .order("id", { ascending: true }),
        client
          .from("user_roles")
          .select("*")
          .eq("organization_id", scope.organizationId)
          .order("user_id", { ascending: true })
          .order("role", { ascending: true })
      ]);

      if (templesResult.error) {
        throw templesResult.error;
      }

      if (usersResult.error) {
        throw usersResult.error;
      }

      if (rolesResult.error) {
        throw rolesResult.error;
      }

      return {
        roles: rolesResult.data.map(mapRole),
        temples: templesResult.data.map(mapTemple),
        users: usersResult.data.map(mapUser)
      };
    },

    refreshOrganizationAppMetadata,

    refreshUserAppMetadata,

    async removeRole(input) {
      const { error } = await client
        .from("user_roles")
        .delete()
        .eq("id", input.roleId)
        .eq("organization_id", input.organizationId)
        .eq("user_id", input.userId);

      if (error) {
        throw error;
      }

      await refreshUserAppMetadata({
        actorUserId: input.actorUserId,
        organizationId: input.organizationId,
        userId: input.userId
      });
    },

    async setTempleArchived(input) {
      const { data, error } = await client
        .from("temples")
        .update({
          deleted_at: input.archivedAt
        })
        .eq("id", input.id)
        .eq("organization_id", input.organizationId)
        .select("*")
        .single();

      if (error || !data) {
        throw error ?? new Error("Temple archive update returned no row.");
      }

      await refreshOrganizationAppMetadata({
        actorUserId: input.actorUserId,
        organizationId: input.organizationId
      });

      return mapTemple(data);
    },

    async setUserArchived(input) {
      const { data, error } = await client
        .from("users")
        .update({
          deleted_at: input.archivedAt
        })
        .eq("id", input.userId)
        .eq("organization_id", input.organizationId)
        .select("*")
        .single();

      if (error || !data) {
        throw error ?? new Error("User archive update returned no row.");
      }

      await refreshUserAppMetadata({
        actorUserId: input.actorUserId,
        organizationId: input.organizationId,
        userId: input.userId
      });

      return mapUser(data);
    },

    async updateTemple(input) {
      const { data, error } = await client
        .from("temples")
        .update({
          name: input.name
        })
        .eq("id", input.id)
        .eq("organization_id", input.organizationId)
        .select("*")
        .single();

      if (error || !data) {
        throw error ?? new Error("Temple update returned no row.");
      }

      await refreshOrganizationAppMetadata({
        actorUserId: input.actorUserId,
        organizationId: input.organizationId
      });

      return mapTemple(data);
    },

    async upsertUser(input) {
      const { data, error } = await client
        .from("users")
        .upsert(
          {
            deleted_at: null,
            email: input.email,
            full_name: input.fullName,
            id: input.userId,
            organization_id: input.organizationId
          },
          {
            onConflict: "id"
          }
        )
        .select("*")
        .single();

      if (error || !data) {
        throw error ?? new Error("User profile upsert returned no row.");
      }

      return mapUser(data);
    }
  };
}
