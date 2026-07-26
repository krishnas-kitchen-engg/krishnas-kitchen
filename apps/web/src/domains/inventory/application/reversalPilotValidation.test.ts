import assert from "node:assert/strict";
import { describe, it } from "vitest";

import type {
  InventoryItemReference,
  InventoryLocationReference,
  InventoryTransaction,
  InventoryTransactionDraft,
  InventoryTransactionScope,
  ReceivingInventoryTransactionDraft
} from "../domain/types";
import { createInventoryService, type InventoryReceivingCatalog } from "./inventoryService";
import type { InventoryTransactionRepository } from "./inventoryRepository";
import { createInventoryVisibilityService } from "./inventoryVisibilityService";

const pilotScope = {
  organizationId: "iskcon-bangalore",
  templeId: "main-temple"
} as const;

const pilotItem: InventoryItemReference = {
  defaultUnit: "kg",
  deletedAt: null,
  id: "sona-masoori-rice",
  organizationId: pilotScope.organizationId,
  receivingUnits: ["kg"]
};

const pilotLocation: InventoryLocationReference = {
  deletedAt: null,
  id: "dry-store-pantry",
  organizationId: pilotScope.organizationId,
  templeId: pilotScope.templeId
};

function matchesScope(
  transaction: InventoryTransaction,
  scope: InventoryTransactionScope
): boolean {
  return (
    transaction.organizationId === scope.organizationId &&
    (!scope.templeId || transaction.templeId === scope.templeId) &&
    (!scope.itemId || transaction.itemId === scope.itemId) &&
    (!scope.locationId ||
      transaction.sourceLocationId === scope.locationId ||
      transaction.destinationLocationId === scope.locationId)
  );
}

function createPilotTransactionRepository(): InventoryTransactionRepository & {
  readonly transactions: readonly InventoryTransaction[];
} {
  const transactions: InventoryTransaction[] = [];
  let sequence = 0;

  function persist(draft: InventoryTransactionDraft): InventoryTransaction {
    sequence += 1;

    const transaction: InventoryTransaction = {
      ...draft,
      createdAt: `2026-07-18T09:${String(sequence).padStart(2, "0")}:00.000Z`,
      id: draft.clientId
    };

    transactions.push(transaction);

    return transaction;
  }

  return {
    transactions,
    createReceivingTransaction(draft: ReceivingInventoryTransactionDraft) {
      return Promise.resolve(persist(draft));
    },
    createTransaction(draft: InventoryTransactionDraft) {
      return Promise.resolve(persist(draft));
    },
    findTransactionById(id: string) {
      return Promise.resolve(transactions.find((transaction) => transaction.id === id) ?? null);
    },
    listTransactions(scope: InventoryTransactionScope) {
      return Promise.resolve(
        transactions.filter((transaction) => matchesScope(transaction, scope))
      );
    }
  };
}

const receivingCatalog: InventoryReceivingCatalog = {
  findReceivingItem(itemId, scope) {
    return Promise.resolve(
      itemId === pilotItem.id && scope.organizationId === pilotScope.organizationId
        ? pilotItem
        : null
    );
  },
  findReceivingLocation(locationId, scope) {
    return Promise.resolve(
      locationId === pilotLocation.id &&
        scope.organizationId === pilotScope.organizationId &&
        scope.templeId === pilotScope.templeId
        ? pilotLocation
        : null
    );
  }
};

describe("reversal and undo pilot validation", () => {
  it("corrects an incorrect receive with an immutable reversal and trustworthy history", async () => {
    const transactionRepository = createPilotTransactionRepository();
    const inventoryService = createInventoryService(transactionRepository, {
      receivingCatalog
    });
    const visibilityService = createInventoryVisibilityService(transactionRepository);

    const received = await inventoryService.receiveInventory({
      actor: {
        tempSessionId: "morning-receiving-volunteer",
        type: "temporary_volunteer"
      },
      auditMetadata: {
        clientRequestId: "pilot-receive-mistake-001",
        deviceId: "pilot-receiving-phone",
        source: "online"
      },
      itemId: pilotItem.id,
      locationId: pilotLocation.id,
      notes: "Mistaken receiving quantity",
      organizationId: pilotScope.organizationId,
      quantity: 25,
      templeId: pilotScope.templeId,
      unit: "kg"
    });

    const reversal = await inventoryService.undoTransaction(received.id, {
      actor: {
        type: "user",
        userId: "inventory-manager"
      },
      auditMetadata: {
        reason: "wrong quantity",
        source: "online"
      },
      notes: "Undo mistaken receiving quantity"
    });

    const balances = await visibilityService.getVisibleBalances({
      ...pilotScope,
      itemId: pilotItem.id,
      locationId: pilotLocation.id
    });
    const history = await visibilityService.getTransactionHistory({
      ...pilotScope,
      itemId: pilotItem.id,
      limit: 10
    });

    assert.deepEqual(balances, []);
    assert.equal(transactionRepository.transactions.length, 2);
    assert.equal(transactionRepository.transactions[0], received);
    assert.equal(transactionRepository.transactions[0]?.transactionType, "received");
    assert.equal(transactionRepository.transactions[0]?.quantity, 25);
    assert.equal(reversal.transactionType, "reversal");
    assert.equal(reversal.quantityEffect, "decrease");
    assert.equal(reversal.quantity, 25);
    assert.equal(reversal.sourceLocationId, pilotLocation.id);
    assert.equal(reversal.destinationLocationId, null);
    assert.equal(reversal.reversalOfTransactionId, received.id);
    assert.equal(reversal.auditMetadata.reversedTransactionId, received.id);
    assert.deepEqual(
      history.map((transaction) => ({
        actor: transaction.actor,
        id: transaction.id,
        reversalOfTransactionId: transaction.reversalOfTransactionId,
        transactionType: transaction.transactionType
      })),
      [
        {
          actor: {
            type: "user",
            userId: "inventory-manager"
          },
          id: reversal.id,
          reversalOfTransactionId: received.id,
          transactionType: "reversal"
        },
        {
          actor: {
            tempSessionId: "morning-receiving-volunteer",
            type: "temporary_volunteer"
          },
          id: received.id,
          reversalOfTransactionId: null,
          transactionType: "received"
        }
      ]
    );
  });
});
