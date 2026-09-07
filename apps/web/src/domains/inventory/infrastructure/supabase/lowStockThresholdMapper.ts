import type { Database } from "@krishnas-kitchen/types";

import type { InventoryLowStockThreshold } from "../../domain/types";

export type InventoryLowStockThresholdRow =
  Database["public"]["Tables"]["inventory_low_stock_thresholds"]["Row"];

export function mapInventoryLowStockThresholdRow(
  row: InventoryLowStockThresholdRow
): InventoryLowStockThreshold {
  return {
    itemId: row.item_id,
    ...(row.location_id ? { locationId: row.location_id } : {}),
    minimumQuantity: row.minimum_quantity,
    organizationId: row.organization_id,
    targetQuantity: row.target_quantity,
    ...(row.temple_id ? { templeId: row.temple_id } : {}),
    unit: row.unit
  };
}
