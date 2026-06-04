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
    const { data, error } = await client
      .from("inventory_transactions")
      .insert(insert)
      .select("*")
      .single();

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
