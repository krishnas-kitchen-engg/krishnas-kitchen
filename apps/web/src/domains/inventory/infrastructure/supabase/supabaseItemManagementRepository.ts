import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, EntityId } from "@krishnas-kitchen/types";

import type { InventoryActor } from "../../domain/types";
import type {
  CreateManagedItemInput,
  ItemManagementRepository,
  ManagedInventoryItem,
  UpdateManagedItemInput
} from "../../application/itemManagementService";
import type { InventoryItemRow } from "./inventoryCatalogMapper";
import type { InventoryLowStockThresholdRow } from "./lowStockThresholdMapper";

type ItemInsert = Database["public"]["Tables"]["items"]["Insert"];
type ItemUpdate = Database["public"]["Tables"]["items"]["Update"];
type ThresholdInsert = Database["public"]["Tables"]["inventory_low_stock_thresholds"]["Insert"];
type ThresholdUpdate = Database["public"]["Tables"]["inventory_low_stock_thresholds"]["Update"];

function mapItemRow(
  row: InventoryItemRow,
  threshold: InventoryLowStockThresholdRow | null = null
): ManagedInventoryItem {
  return {
    category: row.category,
    contentsLabel: row.contents_label ?? null,
    contentsQuantity: row.contents_quantity ?? null,
    contentsUnit: row.contents_unit ?? null,
    defaultUnit: row.default_unit,
    deletedAt: row.deleted_at,
    description: row.description,
    handlingUnit: row.handling_unit ?? null,
    id: row.id,
    name: row.name,
    organizationId: row.organization_id,
    packageDescription: row.package_description ?? null,
    productName: row.product_name ?? null,
    reorderThreshold: threshold?.minimum_quantity ?? null,
    targetStockLevel: threshold?.target_quantity ?? null
  };
}

function mapItemInsert(
  input: Omit<
    CreateManagedItemInput,
    "actor" | "reorderThreshold" | "targetStockLevel" | "templeId"
  >
): ItemInsert {
  return {
    category: input.category ?? null,
    contents_label: input.contentsLabel ?? null,
    contents_quantity: input.contentsQuantity ?? null,
    contents_unit: input.contentsUnit ?? null,
    default_unit: input.defaultUnit,
    deleted_at: null,
    description: input.description ?? null,
    handling_unit: input.handlingUnit ?? null,
    name: input.name,
    organization_id: input.organizationId,
    package_description: input.packageDescription ?? null,
    product_name: input.productName ?? null,
    receiving_units: [input.defaultUnit],
    return_units: [input.defaultUnit],
    transfer_units: [input.defaultUnit]
  };
}

function mapItemUpdate(
  input: Omit<
    UpdateManagedItemInput,
    "actor" | "reorderThreshold" | "targetStockLevel" | "templeId"
  >
): ItemUpdate {
  return {
    category: input.category ?? null,
    contents_label: input.contentsLabel ?? null,
    contents_quantity: input.contentsQuantity ?? null,
    contents_unit: input.contentsUnit ?? null,
    default_unit: input.defaultUnit,
    description: input.description ?? null,
    handling_unit: input.handlingUnit ?? null,
    name: input.name,
    package_description: input.packageDescription ?? null,
    product_name: input.productName ?? null,
    receiving_units: [input.defaultUnit],
    return_units: [input.defaultUnit],
    transfer_units: [input.defaultUnit]
  };
}

function actorInsertColumns(
  actor: InventoryActor
): Pick<
  ThresholdInsert,
  "created_by_actor_temp_session_id" | "created_by_actor_type" | "created_by_actor_user_id"
> {
  return {
    created_by_actor_temp_session_id:
      actor.type === "temporary_volunteer" ? actor.tempSessionId : null,
    created_by_actor_type: actor.type,
    created_by_actor_user_id: actor.type === "user" ? actor.userId : null
  };
}

function actorArchiveColumns(
  actor: InventoryActor
): Pick<
  ThresholdUpdate,
  "archived_by_actor_temp_session_id" | "archived_by_actor_type" | "archived_by_actor_user_id"
> {
  return {
    archived_by_actor_temp_session_id:
      actor.type === "temporary_volunteer" ? actor.tempSessionId : null,
    archived_by_actor_type: actor.type,
    archived_by_actor_user_id: actor.type === "user" ? actor.userId : null
  };
}

export function createSupabaseItemManagementRepository(
  client: SupabaseClient<Database>
): ItemManagementRepository {
  async function listActiveThresholds(scope: {
    organizationId: EntityId;
    templeId: EntityId;
  }): Promise<InventoryLowStockThresholdRow[]> {
    const { data, error } = await client
      .from("inventory_low_stock_thresholds")
      .select("*")
      .eq("organization_id", scope.organizationId)
      .eq("temple_id", scope.templeId)
      .is("location_id", null)
      .is("archived_at", null)
      .order("item_id", { ascending: true })
      .order("id", { ascending: true });

    if (error) {
      throw error;
    }

    return data;
  }

  async function findActiveThreshold(input: {
    itemId: EntityId;
    organizationId: EntityId;
    templeId: EntityId;
  }): Promise<InventoryLowStockThresholdRow | null> {
    const { data, error } = await client
      .from("inventory_low_stock_thresholds")
      .select("*")
      .eq("organization_id", input.organizationId)
      .eq("temple_id", input.templeId)
      .eq("item_id", input.itemId)
      .is("location_id", null)
      .is("archived_at", null)
      .order("id", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data;
  }

  return {
    async archiveItemThresholds(input) {
      const { error } = await client
        .from("inventory_low_stock_thresholds")
        .update({
          archived_at: new Date().toISOString(),
          ...actorArchiveColumns(input.actor)
        })
        .eq("organization_id", input.organizationId)
        .eq("temple_id", input.templeId)
        .eq("item_id", input.itemId)
        .is("archived_at", null);

      if (error) {
        throw error;
      }
    },

    async createItem(input) {
      const { data, error } = await client
        .from("items")
        .insert(mapItemInsert(input))
        .select("*")
        .single();

      if (error || !data) {
        throw error ?? new Error("Item creation returned no row.");
      }

      return mapItemRow(data);
    },

    async listItems(scope) {
      const [{ data, error }, thresholds] = await Promise.all([
        client
          .from("items")
          .select("*")
          .eq("organization_id", scope.organizationId)
          .order("deleted_at", { ascending: true, nullsFirst: true })
          .order("name", { ascending: true })
          .order("id", { ascending: true }),
        listActiveThresholds(scope)
      ]);

      if (error) {
        throw error;
      }

      const thresholdsByItemId = new Map(
        thresholds.map((threshold) => [threshold.item_id, threshold])
      );

      return data.map((row) => mapItemRow(row, thresholdsByItemId.get(row.id) ?? null));
    },

    async restoreItemThreshold(input) {
      const activeThreshold = await findActiveThreshold(input);

      if (activeThreshold) {
        const { error } = await client
          .from("inventory_low_stock_thresholds")
          .update({
            minimum_quantity: input.minimumQuantity,
            target_quantity: input.targetQuantity,
            unit: input.unit
          })
          .eq("id", activeThreshold.id);

        if (error) {
          throw error;
        }

        return;
      }

      const { error } = await client.from("inventory_low_stock_thresholds").insert({
        ...actorInsertColumns(input.actor),
        archived_at: null,
        archived_by_actor_temp_session_id: null,
        archived_by_actor_type: null,
        archived_by_actor_user_id: null,
        item_id: input.itemId,
        location_id: null,
        minimum_quantity: input.minimumQuantity,
        organization_id: input.organizationId,
        temple_id: input.templeId,
        target_quantity: input.targetQuantity,
        unit: input.unit
      });

      if (error) {
        throw error;
      }
    },

    async updateItem(input) {
      const { data, error } = await client
        .from("items")
        .update(mapItemUpdate(input))
        .eq("id", input.id)
        .eq("organization_id", input.organizationId)
        .select("*")
        .single();

      if (error || !data) {
        throw error ?? new Error("Item update returned no row.");
      }

      return mapItemRow(data);
    },

    async updateItemArchivedState(input) {
      const { data, error } = await client
        .from("items")
        .update({
          deleted_at: input.deletedAt
        })
        .eq("id", input.id)
        .eq("organization_id", input.organizationId)
        .select("*")
        .single();

      if (error || !data) {
        throw error ?? new Error("Item archive update returned no row.");
      }

      return mapItemRow(data);
    }
  };
}
