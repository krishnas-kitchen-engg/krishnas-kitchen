import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, EntityId } from "@krishnas-kitchen/types";

import type { InventoryTransactionRepository } from "../../application/inventoryRepository";
import type {
  InventoryTransaction,
  InventoryTransactionDraft,
  InventoryTransactionScope
} from "../../domain/types";
import {
  type InventoryTransactionInsert,
  mapInventoryTransactionDraftToInsert,
  mapInventoryTransactionRow
} from "./inventoryTransactionMapper";
import {
  InventoryPersistenceError,
  mapReceivingTransactionDraftToInsert
} from "./receivingPersistence";

type InventoryTransactionOperation = "create_receiving_transaction" | "create_transaction";

export function createSupabaseInventoryTransactionRepository(
  client: SupabaseClient<Database>
): InventoryTransactionRepository {
  async function insertInventoryTransactionInsert(
    insert: InventoryTransactionInsert,
    operation: InventoryTransactionOperation
  ): Promise<InventoryTransaction> {
    const { data, error } = await client.rpc("append_inventory_transaction", {
      p_actor_temp_session_id: insert.actor_temp_session_id ?? null,
      p_actor_type: insert.actor_type,
      p_actor_user_id: insert.actor_user_id ?? null,
      p_audit_metadata: insert.audit_metadata ?? {},
      p_destination_location_id: insert.destination_location_id ?? null,
      p_item_id: insert.item_id,
      p_notes: insert.notes ?? null,
      p_organization_id: insert.organization_id,
      p_quantity: insert.quantity,
      p_quantity_effect: insert.quantity_effect,
      p_reversal_of_transaction_id: insert.reversal_of_transaction_id ?? null,
      p_source_location_id: insert.source_location_id ?? null,
      p_temple_id: insert.temple_id,
      p_transaction_type: insert.transaction_type,
      p_unit: insert.unit
    });

    if (error) {
      throw new InventoryPersistenceError(
        operation,
        "Inventory transaction persistence failed.",
        error
      );
    }

    if (!data) {
      throw new InventoryPersistenceError(
        operation,
        "Inventory transaction persistence returned no row."
      );
    }

    return mapInventoryTransactionRow(data);
  }

  return {
    async createReceivingTransaction(draft) {
      return insertInventoryTransactionInsert(
        mapReceivingTransactionDraftToInsert(draft),
        "create_receiving_transaction"
      );
    },

    async createTransaction(draft: InventoryTransactionDraft): Promise<InventoryTransaction> {
      return insertInventoryTransactionInsert(
        mapInventoryTransactionDraftToInsert(draft),
        "create_transaction"
      );
    },

    async findTransactionById(id: EntityId): Promise<InventoryTransaction | null> {
      const { data, error } = await client
        .from("inventory_transactions")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) {
        throw error;
      }

      return data ? mapInventoryTransactionRow(data) : null;
    },

    async listTransactions(scope: InventoryTransactionScope): Promise<InventoryTransaction[]> {
      let query = client
        .from("inventory_transactions")
        .select("*")
        .eq("organization_id", scope.organizationId)
        .order("created_at", { ascending: true });

      if (scope.templeId) {
        query = query.eq("temple_id", scope.templeId);
      }

      if (scope.itemId) {
        query = query.eq("item_id", scope.itemId);
      }

      if (scope.locationId) {
        query = query.or(
          `source_location_id.eq.${scope.locationId},destination_location_id.eq.${scope.locationId}`
        );
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return data.map(mapInventoryTransactionRow);
    }
  };
}
