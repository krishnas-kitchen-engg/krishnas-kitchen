import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@krishnas-kitchen/types";

import type { InventoryLowStockThresholdRepository } from "../../application/inventoryVisibilityService";
import type { InventoryTransactionScope } from "../../domain/types";
import {
  type InventoryLowStockThresholdRow,
  mapInventoryLowStockThresholdRow
} from "./lowStockThresholdMapper";

function matchesScope(row: InventoryLowStockThresholdRow, scope: InventoryTransactionScope) {
  return (
    row.organization_id === scope.organizationId &&
    (!scope.templeId || !row.temple_id || row.temple_id === scope.templeId) &&
    (!scope.itemId || row.item_id === scope.itemId) &&
    (!scope.locationId || !row.location_id || row.location_id === scope.locationId)
  );
}

export function createSupabaseLowStockThresholdRepository(
  client: SupabaseClient<Database>
): InventoryLowStockThresholdRepository {
  return {
    async listActiveLowStockThresholds(scope) {
      const { data, error } = await client
        .from("inventory_low_stock_thresholds")
        .select("*")
        .eq("organization_id", scope.organizationId)
        .is("archived_at", null)
        .order("temple_id", { ascending: true })
        .order("location_id", { ascending: true })
        .order("item_id", { ascending: true })
        .order("unit", { ascending: true })
        .order("id", { ascending: true });

      if (error) {
        throw error;
      }

      return data.filter((row) => matchesScope(row, scope)).map(mapInventoryLowStockThresholdRow);
    }
  };
}
