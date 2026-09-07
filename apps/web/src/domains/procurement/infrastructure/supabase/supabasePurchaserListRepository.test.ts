import assert from "node:assert/strict";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@krishnas-kitchen/types";
import { describe, it } from "vitest";

import { createSupabasePurchaserListRepository } from "./supabasePurchaserListRepository";

type PurchaseListItemRow = Database["public"]["Tables"]["purchase_list_items"]["Row"];

const purchasedRow: PurchaseListItemRow = {
  approved_quantity: 4,
  assigned_purchaser_user_id: "user-1",
  created_at: "2026-09-06T12:00:00.000Z",
  id: "line-1",
  inventory_transaction_id: null,
  item_id: "item-1",
  item_reference_type: "existing_item",
  notes: "Two cases",
  organization_id: "org-1",
  purchase_date: "2026-09-06",
  purchase_list_id: "list-1",
  purchase_location_id: "store-1",
  purchased_at: "2026-09-06T13:00:00.000Z",
  purchased_by_actor_temp_session_id: null,
  purchased_by_actor_type: "user",
  purchased_by_actor_user_id: "user-1",
  purchased_quantity: 4,
  source_purchase_request_ids: ["request-1"],
  status: "bought",
  suggested_item_category: null,
  suggested_item_name: null,
  temple_id: "temple-1",
  total_cost: 20,
  unit: "case",
  unit_cost: 5,
  updated_at: "2026-09-06T13:00:00.000Z"
};

describe("Supabase purchaser-list repository", () => {
  it("updates purchaser progress only through the guarded database function", async () => {
    const calls: Array<{ args: Record<string, unknown>; name: string }> = [];
    const client = {
      rpc(name: string, args: Record<string, unknown>) {
        calls.push({ args, name });
        return Promise.resolve({ data: purchasedRow, error: null });
      }
    } as unknown as SupabaseClient<Database>;
    const repository = createSupabasePurchaserListRepository(client);

    const result = await repository.updatePurchaseListItemProgress({
      itemId: "line-1",
      notes: "Two cases",
      organizationId: "org-1",
      purchaseDate: "2026-09-06",
      purchasedAt: "2026-09-06T13:00:00.000Z",
      purchasedBy: { type: "user", userId: "user-1" },
      purchasedQuantity: 4,
      status: "bought",
      templeId: "temple-1",
      totalCost: 20,
      unitCost: 5
    });

    assert.equal(calls.length, 1);
    assert.equal(calls[0]?.name, "update_assigned_purchase_list_item_progress");
    assert.equal(calls[0]?.args.p_purchase_list_item_id, "line-1");
    assert.equal(calls[0]?.args.p_purchased_by_user_id, "user-1");
    assert.equal(result.status, "bought");
    assert.equal(result.purchasedQuantity, 4);
  });
});
