import assert from "node:assert/strict";
import { describe, it } from "vitest";

import { calculateLocationItemBalance } from "../domain/aggregation";
import { AdjustmentValidationError } from "../domain/adjustmentValidation";
import { ConsumptionValidationError } from "../domain/consumptionValidation";
import { ReceivingValidationError } from "../domain/receivingValidation";
import { ReversalValidationError } from "../domain/reversalValidation";
import { ReturnValidationError } from "../domain/returnValidation";
import { TransferValidationError } from "../domain/transferValidation";
import type {
  CreateReceivingTransactionInput,
  CreateConsumptionTransactionInput,
  CreateInventoryAdjustmentInput,
  CreateReturnTransactionInput,
  CreateTransferTransactionInput,
  InventoryTransaction,
  InventoryTransactionDraft,
  InventoryTransactionScope,
  ReceivingInventoryTransactionDraft
} from "../domain/types";
import {
  createInventoryService,
  type InventoryConsumptionCatalog,
  type InventoryAdjustmentCatalog,
  type InventoryReceivingCatalog,
  type InventoryReturnCatalog,
  type InventoryTransferCatalog
} from "./inventoryService";
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

const transferInput: CreateTransferTransactionInput = {
  actor: {
    type: "user",
    userId: "manager-1"
  },
  auditMetadata: {
    deviceId: "transfer-phone"
  },
  destinationLocationId: "pantry",
  itemId: "rice",
  notes: "move to pantry",
  organizationId: "org-1",
  quantity: 10,
  sourceLocationId: "trailer",
  templeId: "temple-1",
  unit: "kg"
};

const consumptionInput: CreateConsumptionTransactionInput = {
  actor: {
    type: "user",
    userId: "cook-1"
  },
  auditMetadata: {
    deviceId: "kitchen-phone"
  },
  itemId: "rice",
  locationId: "pantry",
  notes: "lunch service",
  organizationId: "org-1",
  quantity: 6,
  templeId: "temple-1",
  unit: "kg"
};

const adjustmentInput: CreateInventoryAdjustmentInput = {
  actor: {
    type: "user",
    userId: "manager-1"
  },
  auditMetadata: {
    deviceId: "manager-phone"
  },
  itemId: "rice",
  locationId: "pantry",
  notes: "shelf count",
  organizationId: "org-1",
  physicalQuantity: 20,
  reason: "monthly count",
  templeId: "temple-1",
  unit: "kg"
};

const returnInput: CreateReturnTransactionInput = {
  actor: {
    type: "user",
    userId: "manager-1"
  },
  auditMetadata: {
    deviceId: "return-phone"
  },
  destinationLocationId: "pantry",
  itemId: "rice",
  notes: "unused rice returned",
  organizationId: "org-1",
  quantity: 8,
  sourceLocationId: "kitchen",
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
    createReceivingTransaction(draft: ReceivingInventoryTransactionDraft) {
      return this.createTransaction(draft);
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

const consumptionCatalog: InventoryConsumptionCatalog = {
  findConsumptionItem(itemId) {
    return Promise.resolve({
      consumptionUnits: ["kg"] as const,
      defaultUnit: "kg" as const,
      deletedAt: null,
      id: itemId,
      organizationId: "org-1"
    });
  },
  findConsumptionLocation(locationId) {
    return Promise.resolve({
      deletedAt: null,
      id: locationId,
      organizationId: "org-1",
      templeId: "temple-1"
    });
  }
};

const adjustmentCatalog: InventoryAdjustmentCatalog = {
  findAdjustmentItem(itemId) {
    return Promise.resolve({
      adjustmentUnits: ["kg"] as const,
      defaultUnit: "kg" as const,
      deletedAt: null,
      id: itemId,
      organizationId: "org-1"
    });
  },
  findAdjustmentLocation(locationId) {
    return Promise.resolve({
      deletedAt: null,
      id: locationId,
      organizationId: "org-1",
      templeId: "temple-1"
    });
  }
};

const transferCatalog: InventoryTransferCatalog = {
  findTransferDestinationLocation(locationId) {
    return Promise.resolve({
      deletedAt: null,
      id: locationId,
      organizationId: "org-1",
      templeId: "temple-1"
    });
  },
  findTransferItem(itemId) {
    return Promise.resolve({
      defaultUnit: "kg" as const,
      deletedAt: null,
      id: itemId,
      organizationId: "org-1",
      transferUnits: ["kg"] as const
    });
  },
  findTransferSourceLocation(locationId) {
    return Promise.resolve({
      deletedAt: null,
      id: locationId,
      organizationId: "org-1",
      templeId: "temple-1"
    });
  }
};

const returnCatalog: InventoryReturnCatalog = {
  findReturnDestinationLocation(locationId) {
    return Promise.resolve({
      deletedAt: null,
      id: locationId,
      organizationId: "org-1",
      templeId: "temple-1"
    });
  },
  findReturnItem(itemId) {
    return Promise.resolve({
      defaultUnit: "kg" as const,
      deletedAt: null,
      id: itemId,
      organizationId: "org-1",
      returnUnits: ["kg"] as const
    });
  },
  findReturnSourceLocation(locationId) {
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

  it("creates consumed transactions and updates projected balances", async () => {
    const repository = createMemoryRepository();
    const service = createInventoryService(repository, {
      consumptionCatalog,
      receivingCatalog
    });
    await service.receiveInventory(receiveInput);

    const consumed = await service.consumeInventory(consumptionInput);

    assert.equal(consumed.transactionType, "consumed");
    assert.equal(consumed.quantityEffect, "decrease");
    assert.equal(consumed.sourceLocationId, "pantry");
    assert.equal(consumed.destinationLocationId, null);
    assert.equal(repository.transactions.length, 2);
    assert.equal(calculateLocationItemBalance(repository.transactions, "pantry", "rice"), 19);
  });

  it("rejects consumption above available inventory without mutating history", async () => {
    const repository = createMemoryRepository();
    const service = createInventoryService(repository, {
      consumptionCatalog,
      receivingCatalog
    });
    await service.receiveInventory({
      ...receiveInput,
      quantity: 4
    });

    await assert.rejects(
      () => service.consumeInventory(consumptionInput),
      ConsumptionValidationError
    );
    assert.equal(repository.transactions.length, 1);
    assert.equal(calculateLocationItemBalance(repository.transactions, "pantry", "rice"), 4);
  });

  it("creates adjusted transactions from physical count deltas", async () => {
    const repository = createMemoryRepository();
    const service = createInventoryService(repository, {
      adjustmentCatalog,
      receivingCatalog
    });
    await service.receiveInventory(receiveInput);

    const result = await service.adjustInventory(adjustmentInput);

    assert.equal(result.currentQuantity, 25);
    assert.equal(result.physicalQuantity, 20);
    assert.equal(result.quantityDelta, -5);
    assert.equal(result.transaction?.transactionType, "adjusted");
    assert.equal(result.transaction?.quantityEffect, "decrease");
    assert.equal(result.transaction?.sourceLocationId, "pantry");
    assert.equal(result.transaction?.destinationLocationId, null);
    assert.equal(result.transaction?.auditMetadata.reason, "monthly count");
    assert.equal(repository.transactions.length, 2);
    assert.equal(calculateLocationItemBalance(repository.transactions, "pantry", "rice"), 20);
  });

  it("does not create an adjustment transaction when counts already match", async () => {
    const repository = createMemoryRepository();
    const service = createInventoryService(repository, {
      adjustmentCatalog,
      receivingCatalog
    });
    await service.receiveInventory(receiveInput);

    const result = await service.adjustInventory({
      ...adjustmentInput,
      physicalQuantity: 25
    });

    assert.equal(result.quantityDelta, 0);
    assert.equal(result.transaction, null);
    assert.equal(repository.transactions.length, 1);
    assert.equal(calculateLocationItemBalance(repository.transactions, "pantry", "rice"), 25);
  });

  it("rejects invalid adjustment references before persistence", async () => {
    const repository = createMemoryRepository();
    const service = createInventoryService(repository, {
      adjustmentCatalog: {
        ...adjustmentCatalog,
        findAdjustmentItem(itemId) {
          return Promise.resolve({
            defaultUnit: "kg",
            deletedAt: "2026-06-01T00:00:00.000Z",
            id: itemId,
            organizationId: "org-1"
          });
        }
      }
    });

    await assert.rejects(() => service.adjustInventory(adjustmentInput), AdjustmentValidationError);
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

    assert.equal(undo.transactionType, "reversal");
    assert.equal(undo.quantityEffect, "decrease");
    assert.equal(undo.reversalOfTransactionId, received.id);
    assert.equal(repository.transactions.length, 2);
    assert.equal(repository.transactions[0]?.transactionType, "received");
    assert.equal(repository.transactions[0]?.quantity, 25);
    assert.equal(calculateLocationItemBalance(repository.transactions, "pantry", "rice"), 0);
  });

  it("rejects duplicate undo requests without mutating transaction history", async () => {
    const repository = createMemoryRepository();
    const service = createInventoryService(repository, {
      receivingCatalog
    });
    const received = await service.receiveInventory(receiveInput);

    await service.undoTransaction(received.id, {
      actor: {
        type: "user",
        userId: "manager-1"
      }
    });

    await assert.rejects(
      () =>
        service.undoTransaction(received.id, {
          actor: {
            type: "user",
            userId: "manager-1"
          }
        }),
      ReversalValidationError
    );
    assert.equal(repository.transactions.length, 2);
    assert.equal(repository.transactions[0]?.id, received.id);
  });

  it("creates transfer transactions and aggregates source to destination movement", async () => {
    const repository = createMemoryRepository();
    const service = createInventoryService(repository, {
      receivingCatalog,
      transferCatalog
    });
    await service.receiveInventory({
      ...receiveInput,
      locationId: "trailer",
      quantity: 20
    });

    const transfer = await service.transferInventory(transferInput);

    assert.equal(transfer.transactionType, "transfer");
    assert.equal(transfer.quantityEffect, "transfer");
    assert.equal(transfer.quantity, 10);
    assert.equal(transfer.sourceLocationId, "trailer");
    assert.equal(transfer.destinationLocationId, "pantry");
    assert.equal(repository.transactions.length, 2);
    assert.equal(calculateLocationItemBalance(repository.transactions, "trailer", "rice"), 10);
    assert.equal(calculateLocationItemBalance(repository.transactions, "pantry", "rice"), 10);
  });

  it("rejects transfers above source projected inventory without mutating history", async () => {
    const repository = createMemoryRepository();
    const service = createInventoryService(repository, {
      receivingCatalog,
      transferCatalog
    });
    await service.receiveInventory({
      ...receiveInput,
      locationId: "trailer",
      quantity: 4
    });

    await assert.rejects(() => service.transferInventory(transferInput), TransferValidationError);
    assert.equal(repository.transactions.length, 1);
    assert.equal(calculateLocationItemBalance(repository.transactions, "trailer", "rice"), 4);
    assert.equal(calculateLocationItemBalance(repository.transactions, "pantry", "rice"), 0);
  });

  it("rejects invalid transfer references before persistence", async () => {
    const repository = createMemoryRepository();
    const service = createInventoryService(repository, {
      transferCatalog: {
        ...transferCatalog,
        findTransferSourceLocation(locationId) {
          return Promise.resolve({
            deletedAt: "2026-06-01T00:00:00.000Z",
            id: locationId,
            organizationId: "org-1",
            templeId: "temple-1"
          });
        }
      }
    });

    await assert.rejects(() => service.transferInventory(transferInput), TransferValidationError);
    assert.equal(repository.transactions.length, 0);
  });

  it("creates return transactions and aggregates source to destination movement", async () => {
    const repository = createMemoryRepository();
    const service = createInventoryService(repository, {
      receivingCatalog,
      returnCatalog
    });
    await service.receiveInventory({
      ...receiveInput,
      locationId: "kitchen",
      quantity: 12
    });

    const returned = await service.returnInventory(returnInput);

    assert.equal(returned.transactionType, "returned");
    assert.equal(returned.quantityEffect, "transfer");
    assert.equal(returned.quantity, 8);
    assert.equal(returned.sourceLocationId, "kitchen");
    assert.equal(returned.destinationLocationId, "pantry");
    assert.equal(repository.transactions.length, 2);
    assert.equal(calculateLocationItemBalance(repository.transactions, "kitchen", "rice"), 4);
    assert.equal(calculateLocationItemBalance(repository.transactions, "pantry", "rice"), 8);
  });

  it("rejects returns above source projected inventory without mutating history", async () => {
    const repository = createMemoryRepository();
    const service = createInventoryService(repository, {
      receivingCatalog,
      returnCatalog
    });
    await service.receiveInventory({
      ...receiveInput,
      locationId: "kitchen",
      quantity: 4
    });

    await assert.rejects(() => service.returnInventory(returnInput), ReturnValidationError);
    assert.equal(repository.transactions.length, 1);
    assert.equal(calculateLocationItemBalance(repository.transactions, "kitchen", "rice"), 4);
    assert.equal(calculateLocationItemBalance(repository.transactions, "pantry", "rice"), 0);
  });

  it("undoes transfer and return transactions through reversal movement", async () => {
    const repository = createMemoryRepository();
    const service = createInventoryService(repository, {
      receivingCatalog,
      returnCatalog,
      transferCatalog
    });
    await service.receiveInventory({
      ...receiveInput,
      locationId: "trailer",
      quantity: 20
    });
    const transfer = await service.transferInventory(transferInput);
    const transferUndo = await service.undoTransaction(transfer.id, {
      actor: {
        type: "user",
        userId: "manager-1"
      },
      auditMetadata: {
        reason: "wrong trailer"
      }
    });

    await service.receiveInventory({
      ...receiveInput,
      locationId: "kitchen",
      quantity: 12
    });
    const returned = await service.returnInventory(returnInput);
    const returnUndo = await service.undoTransaction(returned.id, {
      actor: {
        type: "user",
        userId: "manager-1"
      }
    });

    assert.equal(transferUndo.transactionType, "reversal");
    assert.equal(transferUndo.quantityEffect, "transfer");
    assert.equal(transferUndo.reversalOfTransactionId, transfer.id);
    assert.equal(transferUndo.sourceLocationId, "pantry");
    assert.equal(transferUndo.destinationLocationId, "trailer");
    assert.equal(returnUndo.transactionType, "reversal");
    assert.equal(returnUndo.quantityEffect, "transfer");
    assert.equal(returnUndo.reversalOfTransactionId, returned.id);
    assert.equal(returnUndo.sourceLocationId, "pantry");
    assert.equal(returnUndo.destinationLocationId, "kitchen");
    assert.equal(calculateLocationItemBalance(repository.transactions, "trailer", "rice"), 20);
    assert.equal(calculateLocationItemBalance(repository.transactions, "pantry", "rice"), 0);
    assert.equal(calculateLocationItemBalance(repository.transactions, "kitchen", "rice"), 12);
  });

  it("rejects invalid return references before persistence", async () => {
    const repository = createMemoryRepository();
    const service = createInventoryService(repository, {
      returnCatalog: {
        ...returnCatalog,
        findReturnDestinationLocation(locationId) {
          return Promise.resolve({
            deletedAt: "2026-06-01T00:00:00.000Z",
            id: locationId,
            organizationId: "org-1",
            templeId: "temple-1"
          });
        }
      }
    });

    await assert.rejects(() => service.returnInventory(returnInput), ReturnValidationError);
    assert.equal(repository.transactions.length, 0);
  });
});
