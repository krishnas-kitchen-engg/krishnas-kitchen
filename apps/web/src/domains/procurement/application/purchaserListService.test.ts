import assert from "node:assert/strict";
import { describe, it } from "vitest";

import type { PurchaseListItemRecord, PurchaserListRepository } from "./procurementRepository";
import { createPurchaserListService, PurchaserListValidationError } from "./purchaserListService";

const assignedItem: PurchaseListItemRecord = {
  approvedQuantity: 10,
  assignedPurchaserUserId: "purchaser-1",
  createdAt: "2026-07-28T00:00:00Z",
  id: "list-item-1",
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
  status: "pending_purchase",
  templeId: "temple-1",
  totalCost: null,
  unit: "kg",
  unitCost: null,
  updatedAt: "2026-07-28T00:00:00Z"
};

function createRepository(): PurchaserListRepository & {
  lastStatus: string | null;
} {
  return {
    lastStatus: null,
    findPurchaseListItemById() {
      return Promise.resolve(assignedItem);
    },
    listAssignedPurchaseListItems() {
      return Promise.resolve([assignedItem]);
    },
    markPurchaseListItemReceived() {
      throw new Error("Purchaser progress must not receive inventory.");
    },
    updatePurchaseListItemProgress(input) {
      this.lastStatus = input.status;
      return Promise.resolve({
        ...assignedItem,
        notes: input.notes ?? null,
        purchasedAt: input.purchasedAt,
        purchasedBy: input.purchasedBy,
        purchasedQuantity: input.purchasedQuantity ?? null,
        status: input.status,
        totalCost: input.totalCost ?? null,
        unitCost: input.unitCost ?? null
      });
    }
  };
}

describe("createPurchaserListService", () => {
  it("updates bought progress with purchaser audit", async () => {
    const repository = createRepository();
    const service = createPurchaserListService(repository);

    const result = await service.updatePurchaseListItemProgress({
      itemId: "list-item-1",
      notes: "Bought from Costco",
      organizationId: "org-1",
      purchasedBy: {
        type: "user",
        userId: "purchaser-1"
      },
      purchasedQuantity: 10,
      status: "bought",
      templeId: "temple-1",
      totalCost: 24.5,
      unitCost: 2.45
    });

    assert.equal(result.status, "bought");
    assert.equal(result.purchasedQuantity, 10);
    assert.deepEqual(result.purchasedBy, {
      type: "user",
      userId: "purchaser-1"
    });
    assert.equal(repository.lastStatus, "bought");
  });

  it("rejects bought progress without quantity", () => {
    const service = createPurchaserListService(createRepository());

    assert.throws(
      () =>
        service.updatePurchaseListItemProgress({
          itemId: "list-item-1",
          organizationId: "org-1",
          purchasedBy: {
            type: "user",
            userId: "purchaser-1"
          },
          status: "bought",
          templeId: "temple-1"
        }),
      PurchaserListValidationError
    );
  });

  it("rejects system purchasers", () => {
    const service = createPurchaserListService(createRepository());

    assert.throws(
      () =>
        service.updatePurchaseListItemProgress({
          itemId: "list-item-1",
          organizationId: "org-1",
          purchasedBy: {
            type: "system"
          },
          purchasedQuantity: 1,
          status: "bought",
          templeId: "temple-1"
        }),
      /A signed-in purchaser is required/
    );
  });
});
