import assert from "node:assert/strict";
import { describe, it } from "vitest";

import type { InventoryLowStockThresholdRow } from "./lowStockThresholdMapper";
import { mapInventoryLowStockThresholdRow } from "./lowStockThresholdMapper";

describe("low stock threshold mapper", () => {
  it("maps active threshold rows to visibility threshold models", () => {
    const row: InventoryLowStockThresholdRow = {
      archived_at: null,
      archived_by_actor_temp_session_id: null,
      archived_by_actor_type: null,
      archived_by_actor_user_id: null,
      created_at: "2026-06-06T08:00:00.000Z",
      created_by_actor_temp_session_id: null,
      created_by_actor_type: "user",
      created_by_actor_user_id: "user-1",
      id: "threshold-1",
      item_id: "rice",
      location_id: "pantry",
      minimum_quantity: 5,
      organization_id: "org-1",
      target_quantity: 10,
      temple_id: "temple-1",
      unit: "kg",
      updated_at: "2026-06-06T08:00:00.000Z"
    };

    assert.deepEqual(mapInventoryLowStockThresholdRow(row), {
      itemId: "rice",
      locationId: "pantry",
      minimumQuantity: 5,
      organizationId: "org-1",
      targetQuantity: 10,
      templeId: "temple-1",
      unit: "kg"
    });
  });

  it("omits optional temple and location scope when absent", () => {
    const threshold = mapInventoryLowStockThresholdRow({
      archived_at: null,
      archived_by_actor_temp_session_id: null,
      archived_by_actor_type: null,
      archived_by_actor_user_id: null,
      created_at: "2026-06-06T08:00:00.000Z",
      created_by_actor_temp_session_id: null,
      created_by_actor_type: "system",
      created_by_actor_user_id: null,
      id: "threshold-1",
      item_id: "rice",
      location_id: null,
      minimum_quantity: 5,
      organization_id: "org-1",
      target_quantity: null,
      temple_id: null,
      unit: "kg",
      updated_at: "2026-06-06T08:00:00.000Z"
    });

    assert.equal("templeId" in threshold, false);
    assert.equal("locationId" in threshold, false);
  });
});
