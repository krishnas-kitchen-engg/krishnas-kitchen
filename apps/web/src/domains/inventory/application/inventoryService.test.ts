import assert from "node:assert/strict";
import { describe, it } from "vitest";

import { calculateLocationItemBalance } from "../domain/aggregation";
import { ReceivingValidationError } from "../domain/receivingValidation";
import type {
  CreateReceivingTransactionInput,
  InventoryTransaction,
  InventoryTransactionDraft,
  InventoryTransactionScope
} from "../domain/types";
import { createInventoryService, type InventoryReceivingCatalog } from "./inventoryService";
import type { InventoryTransactionRepository } from "./inventoryRepository";

const receiveInput: CreateReceivingTransactionInput = {
  actor: {
    type: "temporary_volunteer",
    tempSessionId: "session-1"
  },
  auditMetadata: {
    deviceId: "receiving-phone"
  },
  itemId: "rice",
  locationId: "pantry",
  notes: "rice delivery",
  organizationId: "org-1",
  quantity: 25,
  templeId: "temple-1",
  unit: "kg"
};

function createMemoryRepository(): InventoryTransactionRepository & {
  transactions: InventoryTransaction[];
} {
  const transactions: InventoryTransaction[] = [];

  return {
    transactions,
    createTransaction(draft: InventoryTransactionDraft) {
      const transaction: InventoryTransaction = {
        ...draft,
        createdAt: "2026-06-01T12:00:00.000Z",
        id: draft.clientId
      };

      transactions.push(transaction);

      return Promise.resolve(transaction);
    },
    findTransactionById(id: string) {
      return Promise.resolve(transactions.find((transaction) => transaction.id === id) ?? null);
    },
    listTransactions(scope: InventoryTransactionScope) {
      return Promise.resolve(
        transactions.filter(
          (transaction) =>
            transaction.organizationId === scope.organizationId &&
            (!scope.templeId || transaction.templeId === scope.templeId) &&
            (!scope.itemId || transaction.itemId === scope.itemId) &&
            (!scope.locationId ||
              transaction.sourceLocationId === scope.locationId ||
              transaction.destinationLocationId === scope.locationId)
        )
      );
    }
  };
}

const receivingCatalog: InventoryReceivingCatalog = {
  findReceivingItem(itemId) {
    return Promise.resolve({
      defaultUnit: "kg" as const,
      deletedAt: null,
      id: itemId,
      organizationId: "org-1",
      receivingUnits: ["kg"] as const
    });
  },
  findReceivingLocation(locationId) {
    return Promise.resolve({
      deletedAt: null,
      id: locationId,
      organizationId: "org-1",
      templeId: "temple-1"
    });
  }
};

describe("inventory receiving service", () => {
  it("creates a received inventory increase transaction", async () => {
    const repository = createMemoryRepository();
    const service = createInventoryService(repository, {
      receivingCatalog
    });

    const transaction = await service.receiveInventory(receiveInput);

    assert.equal(transaction.transactionType, "received");
    assert.equal(transaction.quantityEffect, "increase");
    assert.equal(transaction.destinationLocationId, "pantry");
    assert.equal(transaction.sourceLocationId, null);
    assert.equal(repository.transactions.length, 1);
    assert.equal(calculateLocationItemBalance(repository.transactions, "pantry", "rice"), 25);
  });

  it("aggregates repeated receiving transactions without mutating history", async () => {
    const repository = createMemoryRepository();
    const service = createInventoryService(repository, {
      receivingCatalog
    });

    const first = await service.receiveInventory(receiveInput);
    const second = await service.receiveInventory({
      ...receiveInput,
      quantity: 10
    });

    assert.notEqual(first.id, second.id);
    assert.equal(first.quantity, 25);
    assert.equal(second.quantity, 10);
    assert.equal(repository.transactions.length, 2);
    assert.equal(calculateLocationItemBalance(repository.transactions, "pantry", "rice"), 35);
  });

  it("keeps received transaction quantities positive", async () => {
    const repository = createMemoryRepository();
    const service = createInventoryService(repository, {
      receivingCatalog
    });

    const transaction = await service.receiveInventory(receiveInput);

    assert.equal(transaction.quantity > 0, true);
    assert.equal(transaction.quantity, receiveInput.quantity);
  });

  it("rejects invalid receiving references before persistence", async () => {
    const repository = createMemoryRepository();
    const service = createInventoryService(repository, {
      receivingCatalog: {
        ...receivingCatalog,
        findReceivingLocation(locationId) {
          return Promise.resolve({
            deletedAt: "2026-06-01T00:00:00.000Z",
            id: locationId,
            organizationId: "org-1",
            templeId: "temple-1"
          });
        }
      }
    });

    await assert.rejects(() => service.receiveInventory(receiveInput), ReceivingValidationError);
    assert.equal(repository.transactions.length, 0);
  });

  it("supports undo through immutable reversal transactions", async () => {
    const repository = createMemoryRepository();
    const service = createInventoryService(repository, {
      receivingCatalog
    });
    const received = await service.receiveInventory(receiveInput);

    const undo = await service.undoTransaction(received.id, {
      actor: {
        type: "user",
        userId: "manager-1"
      },
      auditMetadata: {
        reason: "mistake"
      }
    });

    assert.equal(undo.transactionType, "undo");
    assert.equal(undo.quantityEffect, "decrease");
    assert.equal(undo.reversalOfTransactionId, received.id);
    assert.equal(repository.transactions.length, 2);
    assert.equal(repository.transactions[0]?.transactionType, "received");
    assert.equal(repository.transactions[0]?.quantity, 25);
    assert.equal(calculateLocationItemBalance(repository.transactions, "pantry", "rice"), 0);
  });
});
