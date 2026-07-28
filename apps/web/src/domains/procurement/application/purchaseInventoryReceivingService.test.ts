import assert from "node:assert/strict";
import { describe, it } from "vitest";

import type { InventoryService, InventoryTransaction } from "@/domains/inventory";

import type { PurchaseListItemRecord, PurchaserListRepository } from "./procurementRepository";
import {
  createPurchaseInventoryReceivingService,
  PurchaseInventoryReceivingValidationError
} from "./purchaseInventoryReceivingService";

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
  purchasedAt: "2026-07-28T01:00:00Z",
  purchasedBy: {
    type: "user",
    userId: "purchaser-1"
  },
  purchasedQuantity: 8,
  sourcePurchaseRequestIds: ["request-1"],
  status: "bought",
  templeId: "temple-1",
  totalCost: 24.5,
  unit: "kg",
  unitCost: 3.06,
  updatedAt: "2026-07-28T01:00:00Z"
};

const receivedTransaction: InventoryTransaction = {
  actor: {
    type: "user",
    userId: "purchaser-1"
  },
  auditMetadata: {
    source: "online"
  },
  createdAt: "2026-07-28T02:00:00Z",
  destinationLocationId: "location-1",
  id: "inventory-transaction-1",
  itemId: "item-1",
  notes: null,
  organizationId: "org-1",
  quantity: 8,
  quantityEffect: "increase",
  reversalOfTransactionId: null,
  sourceLocationId: null,
  templeId: "temple-1",
  transactionType: "received",
  unit: "kg"
};

function createRepository(
  item: PurchaseListItemRecord | null = assignedItem
): PurchaserListRepository & {
  linkedTransactionId: string | null;
  shouldFailLink: boolean;
} {
  return {
    linkedTransactionId: null,
    shouldFailLink: false,
    findPurchaseListItemById() {
      return Promise.resolve(item);
    },
    listAssignedPurchaseListItems() {
      return Promise.resolve(item ? [item] : []);
    },
    markPurchaseListItemReceived(input) {
      if (this.shouldFailLink) {
        return Promise.reject(new Error("link failed"));
      }

      this.linkedTransactionId = input.inventoryTransactionId;

      return Promise.resolve({
        ...assignedItem,
        inventoryTransactionId: input.inventoryTransactionId,
        status: "received_into_inventory"
      });
    },
    updatePurchaseListItemProgress() {
      throw new Error("Purchase receiving must not update purchase progress.");
    }
  };
}

function createInventoryService(): InventoryService & {
  receivedQuantity: number | null;
  reversalTargetId: string | null;
} {
  return {
    receivedQuantity: null,
    reversalTargetId: null,
    adjustInventory() {
      throw new Error("Purchase receiving must not adjust inventory.");
    },
    createTransaction() {
      throw new Error("Purchase receiving must use receiving service.");
    },
    consumeInventory() {
      throw new Error("Purchase receiving must not consume inventory.");
    },
    getBalances() {
      return Promise.resolve([]);
    },
    getTransactions() {
      return Promise.resolve([]);
    },
    receiveInventory(input) {
      this.receivedQuantity = input.quantity;

      return Promise.resolve({
        ...receivedTransaction,
        destinationLocationId: input.locationId,
        notes: input.notes ?? null,
        quantity: input.quantity
      });
    },
    returnInventory() {
      throw new Error("Purchase receiving must not return inventory.");
    },
    transferInventory() {
      throw new Error("Purchase receiving must not transfer inventory.");
    },
    undoTransaction(transactionId) {
      this.reversalTargetId = transactionId;

      return Promise.resolve({
        ...receivedTransaction,
        id: "reversal-1",
        quantityEffect: "decrease",
        reversalOfTransactionId: transactionId,
        transactionType: "reversal"
      });
    }
  };
}

describe("createPurchaseInventoryReceivingService", () => {
  it("receives a bought purchase item through inventory receiving and links the transaction", async () => {
    const repository = createRepository();
    const inventoryService = createInventoryService();
    const service = createPurchaseInventoryReceivingService({ inventoryService, repository });

    const result = await service.receivePurchasedItem({
      itemId: "list-item-1",
      locationId: "location-1",
      organizationId: "org-1",
      receivedBy: {
        type: "user",
        userId: "purchaser-1"
      },
      templeId: "temple-1"
    });

    assert.equal(inventoryService.receivedQuantity, 8);
    assert.equal(repository.linkedTransactionId, "inventory-transaction-1");
    assert.equal(result.inventoryTransactionId, "inventory-transaction-1");
    assert.equal(result.item.status, "received_into_inventory");
  });

  it("rejects new item suggestions until they are added to the catalog", async () => {
    const repository = createRepository({
      ...assignedItem,
      item: {
        suggestedName: "Fresh curry leaves",
        type: "new_item_suggestion"
      }
    });
    const service = createPurchaseInventoryReceivingService({
      inventoryService: createInventoryService(),
      repository
    });

    await assert.rejects(
      () =>
        service.receivePurchasedItem({
          itemId: "list-item-1",
          locationId: "location-1",
          organizationId: "org-1",
          receivedBy: {
            type: "user",
            userId: "purchaser-1"
          },
          templeId: "temple-1"
        }),
      PurchaseInventoryReceivingValidationError
    );
  });

  it("rejects purchase items that were already received", async () => {
    const repository = createRepository({
      ...assignedItem,
      inventoryTransactionId: "inventory-transaction-1",
      status: "received_into_inventory"
    });
    const service = createPurchaseInventoryReceivingService({
      inventoryService: createInventoryService(),
      repository
    });

    await assert.rejects(
      () =>
        service.receivePurchasedItem({
          itemId: "list-item-1",
          locationId: "location-1",
          organizationId: "org-1",
          receivedBy: {
            type: "user",
            userId: "purchaser-1"
          },
          templeId: "temple-1"
        }),
      /already been received/
    );
  });

  it("reverses the immutable receive transaction if purchase linkage fails", async () => {
    const repository = createRepository();
    repository.shouldFailLink = true;
    const inventoryService = createInventoryService();
    const service = createPurchaseInventoryReceivingService({ inventoryService, repository });

    await assert.rejects(
      () =>
        service.receivePurchasedItem({
          itemId: "list-item-1",
          locationId: "location-1",
          organizationId: "org-1",
          receivedBy: {
            type: "user",
            userId: "purchaser-1"
          },
          templeId: "temple-1"
        }),
      /link failed/
    );

    assert.equal(inventoryService.reversalTargetId, "inventory-transaction-1");
  });
});
