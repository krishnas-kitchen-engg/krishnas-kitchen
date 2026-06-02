import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, EntityId } from "@krishnas-kitchen/types";

import type { InventoryTransactionRepository } from "../../application/inventoryRepository";
import type {
  InventoryTransaction,
  InventoryTransactionDraft,
  InventoryTransactionScope
} from "../../domain/types";
import {
  mapInventoryTransactionDraftToInsert,
  mapInventoryTransactionRow
} from "./inventoryTransactionMapper";

export function createSupabaseInventoryTransactionRepository(
  client: SupabaseClient<Database>
): InventoryTransactionRepository {
  return {
    async createTransaction(draft: InventoryTransactionDraft): Promise<InventoryTransaction> {
      const { data, error } = await client
        .from("inventory_transactions")
        .insert(mapInventoryTransactionDraftToInsert(draft))
        .select("*")
        .single();

      if (error) {
        throw error;
      }

      return mapInventoryTransactionRow(data);
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
