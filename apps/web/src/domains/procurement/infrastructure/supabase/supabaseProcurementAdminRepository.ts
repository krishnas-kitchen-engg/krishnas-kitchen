import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@krishnas-kitchen/types";

import type {
  ProcurementAdminRepository,
  ProcurementPurchaserCandidate,
  UpdatePurchaseLocationInput
} from "../../application/procurementAdminService";
import type {
  ItemPurchasePreferenceRecord,
  PurchaseLocationRecord
} from "../../application/procurementRepository";
import type { ItemPurchasePreferenceInput, ProcurementActor } from "../../domain/types";

type PurchaseLocationRow = Database["public"]["Tables"]["purchase_locations"]["Row"];
type PurchaseLocationInsert = Database["public"]["Tables"]["purchase_locations"]["Insert"];
type PurchaseLocationUpdate = Database["public"]["Tables"]["purchase_locations"]["Update"];
type ItemPurchasePreferenceRow = Database["public"]["Tables"]["item_purchase_preferences"]["Row"];
type ItemPurchasePreferenceInsert =
  Database["public"]["Tables"]["item_purchase_preferences"]["Insert"];
type UserRow = Database["public"]["Tables"]["users"]["Row"];

function actorColumns(actor: ProcurementActor): {
  created_by_actor_temp_session_id: string | null;
  created_by_actor_type: ProcurementActor["type"];
  created_by_actor_user_id: string | null;
} {
  return {
    created_by_actor_temp_session_id:
      actor.type === "temporary_volunteer" ? (actor.tempSessionId ?? null) : null,
    created_by_actor_type: actor.type,
    created_by_actor_user_id: actor.type === "user" ? (actor.userId ?? null) : null
  };
}

function mapActor(row: {
  actor_temp_session_id: string | null;
  actor_type: ProcurementActor["type"];
  actor_user_id: string | null;
}): ProcurementActor {
  if (row.actor_type === "temporary_volunteer") {
    return {
      tempSessionId: row.actor_temp_session_id,
      type: row.actor_type
    };
  }

  if (row.actor_type === "user") {
    return {
      type: row.actor_type,
      userId: row.actor_user_id
    };
  }

  return {
    type: "system"
  };
}

function mapPurchaseLocation(row: PurchaseLocationRow): PurchaseLocationRecord {
  return {
    archivedAt: row.archived_at,
    createdAt: row.created_at,
    createdBy: mapActor({
      actor_temp_session_id: row.created_by_actor_temp_session_id,
      actor_type: row.created_by_actor_type,
      actor_user_id: row.created_by_actor_user_id
    }),
    defaultPurchaserUserId: row.default_purchaser_user_id,
    description: row.description,
    id: row.id,
    name: row.name,
    notes: row.notes,
    organizationId: row.organization_id,
    templeId: row.temple_id,
    updatedAt: row.updated_at
  };
}

function mapItemPurchasePreference(row: ItemPurchasePreferenceRow): ItemPurchasePreferenceRecord {
  return {
    archivedAt: row.archived_at,
    backupPurchaseLocationId: row.backup_purchase_location_id,
    createdAt: row.created_at,
    createdBy: mapActor({
      actor_temp_session_id: row.created_by_actor_temp_session_id,
      actor_type: row.created_by_actor_type,
      actor_user_id: row.created_by_actor_user_id
    }),
    estimatedUnitCost: row.estimated_unit_cost,
    id: row.id,
    itemId: row.item_id,
    minimumOrderQuantity: row.minimum_order_quantity,
    notes: row.notes,
    organizationId: row.organization_id,
    packSize: row.pack_size,
    preferredPurchaseLocationId: row.preferred_purchase_location_id,
    preferredPurchaseUnit: row.preferred_purchase_unit,
    purchaserUserId: row.purchaser_user_id,
    templeId: row.temple_id,
    updatedAt: row.updated_at
  };
}

function mapPurchaserCandidate(row: UserRow): ProcurementPurchaserCandidate {
  return {
    deletedAt: row.deleted_at,
    email: row.email,
    fullName: row.full_name,
    id: row.id
  };
}

function mapPurchaseLocationInsert(input: PurchaseLocationInsert): PurchaseLocationInsert {
  return input;
}

function toPurchaseLocationInsert(input: {
  createdBy: ProcurementActor;
  defaultPurchaserUserId?: string | null;
  description?: string | null;
  name: string;
  notes?: string | null;
  organizationId: string;
  templeId: string;
}): PurchaseLocationInsert {
  return mapPurchaseLocationInsert({
    ...actorColumns(input.createdBy),
    archived_at: null,
    default_purchaser_user_id: input.defaultPurchaserUserId ?? null,
    description: input.description ?? null,
    name: input.name,
    notes: input.notes ?? null,
    organization_id: input.organizationId,
    temple_id: input.templeId
  });
}

function toPurchaseLocationUpdate(input: UpdatePurchaseLocationInput): PurchaseLocationUpdate {
  return {
    default_purchaser_user_id: input.defaultPurchaserUserId ?? null,
    description: input.description ?? null,
    name: input.name,
    notes: input.notes ?? null
  };
}

function toItemPurchasePreferenceInsert(
  input: ItemPurchasePreferenceInput
): ItemPurchasePreferenceInsert {
  return {
    ...actorColumns(input.createdBy),
    archived_at: null,
    backup_purchase_location_id: input.backupPurchaseLocationId ?? null,
    estimated_unit_cost: input.estimatedUnitCost ?? null,
    item_id: input.itemId,
    minimum_order_quantity: input.minimumOrderQuantity ?? null,
    notes: input.notes ?? null,
    organization_id: input.organizationId,
    pack_size: input.packSize ?? null,
    preferred_purchase_location_id: input.preferredPurchaseLocationId,
    preferred_purchase_unit: input.preferredPurchaseUnit ?? null,
    purchaser_user_id: input.purchaserUserId ?? null,
    temple_id: input.templeId
  };
}

export function createSupabaseProcurementAdminRepository(
  client: SupabaseClient<Database>
): ProcurementAdminRepository {
  return {
    async createItemPurchasePreference(input) {
      const { data, error } = await client
        .from("item_purchase_preferences")
        .insert(toItemPurchasePreferenceInsert(input))
        .select("*")
        .single();

      if (error || !data) {
        throw error ?? new Error("Item purchase preference creation returned no row.");
      }

      return mapItemPurchasePreference(data);
    },

    async createPurchaseLocation(input) {
      const { data, error } = await client
        .from("purchase_locations")
        .insert(toPurchaseLocationInsert(input))
        .select("*")
        .single();

      if (error || !data) {
        throw error ?? new Error("Purchase location creation returned no row.");
      }

      return mapPurchaseLocation(data);
    },

    async listItemPurchasePreferences(scope) {
      const { data, error } = await client
        .from("item_purchase_preferences")
        .select("*")
        .eq("organization_id", scope.organizationId)
        .eq("temple_id", scope.templeId)
        .order("archived_at", { ascending: true, nullsFirst: true })
        .order("item_id", { ascending: true })
        .order("id", { ascending: true });

      if (error) {
        throw error;
      }

      return data.map(mapItemPurchasePreference);
    },

    async listPurchaseLocations(scope) {
      const { data, error } = await client
        .from("purchase_locations")
        .select("*")
        .eq("organization_id", scope.organizationId)
        .eq("temple_id", scope.templeId)
        .order("archived_at", { ascending: true, nullsFirst: true })
        .order("name", { ascending: true })
        .order("id", { ascending: true });

      if (error) {
        throw error;
      }

      return data.map(mapPurchaseLocation);
    },

    async listPurchaserCandidates(scope) {
      const { data, error } = await client
        .from("users")
        .select("*")
        .eq("organization_id", scope.organizationId)
        .is("deleted_at", null)
        .order("full_name", { ascending: true })
        .order("id", { ascending: true });

      if (error) {
        throw error;
      }

      return data.map(mapPurchaserCandidate);
    },

    async updatePurchaseLocation(input) {
      const { data, error } = await client
        .from("purchase_locations")
        .update(toPurchaseLocationUpdate(input))
        .eq("id", input.id)
        .eq("organization_id", input.organizationId)
        .eq("temple_id", input.templeId)
        .select("*")
        .single();

      if (error || !data) {
        throw error ?? new Error("Purchase location update returned no row.");
      }

      return mapPurchaseLocation(data);
    },

    async updatePurchaseLocationArchivedState(input) {
      const { data, error } = await client
        .from("purchase_locations")
        .update({
          archived_at: input.archivedAt
        })
        .eq("id", input.id)
        .eq("organization_id", input.organizationId)
        .eq("temple_id", input.templeId)
        .select("*")
        .single();

      if (error || !data) {
        throw error ?? new Error("Purchase location archive update returned no row.");
      }

      return mapPurchaseLocation(data);
    }
  };
}
