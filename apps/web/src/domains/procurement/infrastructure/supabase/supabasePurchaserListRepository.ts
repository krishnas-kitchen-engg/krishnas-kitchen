import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@krishnas-kitchen/types";

import type {
  PurchaseListItemRecord,
  PurchaserListRepository
} from "../../application/procurementRepository";
import type { ProcurementActor } from "../../domain/types";

type PurchaseListItemRow = Database["public"]["Tables"]["purchase_list_items"]["Row"];

function mapActor(row: {
  actor_temp_session_id: string | null;
  actor_type: ProcurementActor["type"] | null;
  actor_user_id: string | null;
}): ProcurementActor | null {
  if (!row.actor_type) {
    return null;
  }

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

export function mapPurchaseListItem(row: PurchaseListItemRow): PurchaseListItemRecord {
  return {
    approvedQuantity: row.approved_quantity,
    assignedPurchaserUserId: row.assigned_purchaser_user_id,
    createdAt: row.created_at,
    id: row.id,
    inventoryTransactionId: row.inventory_transaction_id,
    item:
      row.item_reference_type === "existing_item"
        ? {
            itemId: row.item_id ?? "",
            type: "existing_item"
          }
        : {
            category: row.suggested_item_category,
            suggestedName: row.suggested_item_name ?? "",
            type: "new_item_suggestion"
          },
    notes: row.notes,
    organizationId: row.organization_id,
    purchaseListId: row.purchase_list_id,
    purchaseLocationId: row.purchase_location_id,
    purchasedAt: row.purchased_at,
    purchasedBy: mapActor({
      actor_temp_session_id: row.purchased_by_actor_temp_session_id,
      actor_type: row.purchased_by_actor_type,
      actor_user_id: row.purchased_by_actor_user_id
    }),
    purchasedQuantity: row.purchased_quantity,
    sourcePurchaseRequestIds: row.source_purchase_request_ids,
    status: row.status,
    templeId: row.temple_id,
    totalCost: row.total_cost,
    unit: row.unit,
    unitCost: row.unit_cost,
    updatedAt: row.updated_at
  };
}

export function createSupabasePurchaserListRepository(
  client: SupabaseClient<Database>
): PurchaserListRepository {
  return {
    async findPurchaseListItemById(scope) {
      const { data, error } = await client
        .from("purchase_list_items")
        .select("*")
        .eq("organization_id", scope.organizationId)
        .eq("temple_id", scope.templeId)
        .eq("id", scope.itemId)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return data ? mapPurchaseListItem(data) : null;
    },

    async listAssignedPurchaseListItems(query) {
      const { data, error } = await client
        .from("purchase_list_items")
        .select("*")
        .eq("organization_id", query.organizationId)
        .eq("temple_id", query.templeId)
        .eq("assigned_purchaser_user_id", query.purchaserUserId)
        .order("created_at", { ascending: false })
        .order("id", { ascending: true });

      if (error) {
        throw error;
      }

      return data.map(mapPurchaseListItem);
    },

    async markPurchaseListItemReceived(input) {
      const { data, error } = await client.rpc("mark_purchase_list_item_received", {
        p_inventory_transaction_id: input.inventoryTransactionId,
        p_organization_id: input.organizationId,
        p_purchase_list_item_id: input.itemId,
        p_received_by_user_id: input.receivedBy.userId ?? "",
        p_temple_id: input.templeId
      });

      if (error || !data) {
        throw error ?? new Error("Purchase list item receive linkage returned no row.");
      }

      return mapPurchaseListItem(data);
    },

    async updatePurchaseListItemProgress(input) {
      const { data, error } = await client.rpc("update_assigned_purchase_list_item_progress", {
        p_notes: input.notes ?? null,
        p_organization_id: input.organizationId,
        p_purchase_date: input.purchaseDate ?? null,
        p_purchase_list_item_id: input.itemId,
        p_purchased_at: input.purchasedAt,
        p_purchased_by_user_id:
          input.purchasedBy.type === "user" ? (input.purchasedBy.userId ?? "") : "",
        p_purchased_quantity: input.purchasedQuantity ?? null,
        p_status: input.status,
        p_temple_id: input.templeId,
        p_total_cost: input.totalCost ?? null,
        p_unit_cost: input.unitCost ?? null
      });

      if (error || !data) {
        throw error ?? new Error("Purchase list item update returned no row.");
      }

      return mapPurchaseListItem(data);
    }
  };
}
