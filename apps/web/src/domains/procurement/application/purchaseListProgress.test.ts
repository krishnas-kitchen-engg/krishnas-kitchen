import assert from "node:assert/strict";
import { describe, it } from "vitest";

import type { PurchaseListItemRecord } from "./procurementRepository";
import {
  createEmptyPurchaseListProgressSummary,
  summarizePurchaseListProgress
} from "./purchaseListProgress";

function createItem(
  id: string,
  status: PurchaseListItemRecord["status"],
  totalCost: number | null = null
): PurchaseListItemRecord {
  return {
    approvedQuantity: 1,
    assignedPurchaserUserId: "purchaser-1",
    createdAt: "2026-07-28T00:00:00Z",
    id,
    inventoryTransactionId: null,
    item: {
      itemId: "item-1",
      type: "existing_item"
    },
    notes: null,
    organizationId: "org-1",
    purchaseListId: "list-1",
    purchaseLocationId: "purchase-location-1",
    purchasedAt: null,
    purchasedBy: null,
    purchasedQuantity: null,
    sourcePurchaseRequestIds: ["request-1"],
    status,
    templeId: "temple-1",
    totalCost,
    unit: "kg",
    unitCost: null,
    updatedAt: "2026-07-28T00:00:00Z"
  };
}

describe("summarizePurchaseListProgress", () => {
  it("summarizes purchase list progress counts and spend", () => {
    const summaries = summarizePurchaseListProgress([
      createItem("pending", "pending_purchase"),
      createItem("bought", "bought", 12),
      createItem("receipt", "receipt_uploaded", 5),
      createItem("received", "received_into_inventory", 8),
      createItem("issue", "unavailable")
    ]);

    assert.deepEqual(summaries["list-1"], {
      bought: 2,
      issue: 1,
      pending: 1,
      received: 1,
      total: 5,
      totalCost: 25
    });
  });

  it("returns an empty summary shape for lists without items", () => {
    assert.deepEqual(createEmptyPurchaseListProgressSummary(), {
      bought: 0,
      issue: 0,
      pending: 0,
      received: 0,
      total: 0,
      totalCost: 0
    });
  });
});
