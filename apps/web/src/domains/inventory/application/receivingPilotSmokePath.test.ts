import assert from "node:assert/strict";
import { describe, it } from "vitest";

import type { InventoryBarcode, InventoryBarcodeItemReference } from "../domain/barcode";
import type {
  InventoryItemReference,
  InventoryLocationReference,
  InventoryTransaction,
  InventoryTransactionDraft,
  InventoryTransactionScope,
  ReceivingInventoryTransactionDraft
} from "../domain/types";
import {
  createInventoryBarcodeLookupService,
  type InventoryBarcodeLookupRepository
} from "./barcodeLookupService";
import { createInventoryService, type InventoryReceivingCatalog } from "./inventoryService";
import type { InventoryTransactionRepository } from "./inventoryRepository";
import { createInventoryVisibilityService } from "./inventoryVisibilityService";
import { createReceivingScanWorkflowService } from "./receivingScanWorkflowService";

const pilotScope = {
  organizationId: "iskcon-bangalore",
  templeId: "main-temple"
} as const;

const pilotBarcode: InventoryBarcode = {
  format: "upc_a",
  value: "036000291452"
};

const pilotRiceItem: InventoryBarcodeItemReference = {
  barcodes: [pilotBarcode],
  defaultUnit: "kg",
  deletedAt: null,
  id: "sona-masoori-rice",
  name: "Sona Masoori Rice",
  organizationId: pilotScope.organizationId
};

const pilotPantryLocation: InventoryLocationReference = {
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
      createdAt: `2026-07-18T08:${String(sequence).padStart(2, "0")}:00.000Z`,
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

const barcodeRepository: InventoryBarcodeLookupRepository = {
  findItemsByBarcode(organizationId, barcode) {
    if (
      organizationId === pilotScope.organizationId &&
      barcode.format === pilotBarcode.format &&
      barcode.value === pilotBarcode.value
    ) {
      return Promise.resolve([pilotRiceItem]);
    }

    return Promise.resolve([]);
  }
};

const receivingCatalog: InventoryReceivingCatalog = {
  findReceivingItem(itemId, scope) {
    const item: InventoryItemReference = {
      defaultUnit: "kg",
      deletedAt: null,
      id: pilotRiceItem.id,
      organizationId: pilotScope.organizationId,
      receivingUnits: ["kg", "unit"]
    };

    return Promise.resolve(
      itemId === item.id && scope.organizationId === pilotScope.organizationId ? item : null
    );
  },
  findReceivingLocation(locationId, scope) {
    return Promise.resolve(
      locationId === pilotPantryLocation.id &&
        scope.organizationId === pilotScope.organizationId &&
        scope.templeId === pilotScope.templeId
        ? pilotPantryLocation
        : null
    );
  }
};

describe("receiving pilot smoke path", () => {
  it("persists a volunteer receiving transaction and exposes manager visibility and history", async () => {
    const transactionRepository = createPilotTransactionRepository();
    const inventoryService = createInventoryService(transactionRepository, {
      receivingCatalog
    });
    const visibilityService = createInventoryVisibilityService(transactionRepository);
    const receivingWorkflow = createReceivingScanWorkflowService({
      barcodeLookupService: createInventoryBarcodeLookupService(barcodeRepository),
      inventoryService,
      visibilityService
    });

    const scanResolution = await receivingWorkflow.resolveScan({
      format: pilotBarcode.format,
      organizationId: pilotScope.organizationId,
      permission: "granted",
      rawValue: pilotBarcode.value,
      scannedAt: "2026-07-18T08:00:00.000Z"
    });

    assert.equal(scanResolution.status, "resolved");
    if (scanResolution.status !== "resolved") {
      throw new Error("Pilot barcode should resolve before receiving.");
    }

    const receivingResult = await receivingWorkflow.receiveResolvedItem({
      actor: {
        tempSessionId: "morning-receiving-volunteer",
        type: "temporary_volunteer"
      },
      auditMetadata: {
        clientRequestId: "pilot-receiving-smoke-001",
        deviceId: "pilot-receiving-phone",
        source: "online"
      },
      locationId: pilotPantryLocation.id,
      notes: "Pilot donation intake: 25 kg rice",
      quantity: 25,
      resolvedItem: scanResolution.resolvedItem,
      templeId: pilotScope.templeId,
      unit: "kg"
    });

    assert.equal(transactionRepository.transactions.length, 1);
    assert.equal(receivingResult.receivedTransaction.transactionType, "received");
    assert.equal(receivingResult.receivedTransaction.quantityEffect, "increase");
    assert.equal(receivingResult.receivedTransaction.destinationLocationId, pilotPantryLocation.id);

    const managerVisibleBalances = await visibilityService.getVisibleBalances({
      ...pilotScope,
      itemId: pilotRiceItem.id,
      locationId: pilotPantryLocation.id
    });

    assert.deepEqual(managerVisibleBalances, [
      {
        itemId: pilotRiceItem.id,
        locationId: pilotPantryLocation.id,
        organizationId: pilotScope.organizationId,
        quantity: 25,
        templeId: pilotScope.templeId,
        unit: "kg"
      }
    ]);
    assert.deepEqual(receivingResult.balances, managerVisibleBalances);

    const managerItemBalances = await visibilityService.getItemBalances({
      ...pilotScope,
      itemId: pilotRiceItem.id
    });
    const managerLocationBalances = await visibilityService.getLocationBalances({
      ...pilotScope,
      locationId: pilotPantryLocation.id
    });

    assert.deepEqual(managerItemBalances, [
      {
        itemId: pilotRiceItem.id,
        organizationId: pilotScope.organizationId,
        quantity: 25,
        templeId: pilotScope.templeId,
        unit: "kg"
      }
    ]);
    assert.deepEqual(managerLocationBalances, [
      {
        itemBalances: managerVisibleBalances,
        locationId: pilotPantryLocation.id,
        organizationId: pilotScope.organizationId,
        templeId: pilotScope.templeId
      }
    ]);

    const managerHistory = await visibilityService.getTransactionHistory({
      ...pilotScope,
      itemId: pilotRiceItem.id,
      limit: 10,
      transactionType: "received"
    });

    assert.equal(managerHistory.length, 1);
    assert.equal(managerHistory[0]?.id, receivingResult.receivedTransaction.id);
    assert.equal(managerHistory[0]?.actor.type, "temporary_volunteer");
    assert.equal(
      managerHistory[0]?.actor.type === "temporary_volunteer"
        ? managerHistory[0].actor.tempSessionId
        : null,
      "morning-receiving-volunteer"
    );
    assert.equal(managerHistory[0]?.createdAt, "2026-07-18T08:01:00.000Z");
    assert.equal(managerHistory[0]?.notes, "Pilot donation intake: 25 kg rice");
    assert.deepEqual(managerHistory[0]?.auditMetadata, {
      clientRequestId: "pilot-receiving-smoke-001",
      deviceId: "pilot-receiving-phone",
      reason: "barcode_scan_receiving",
      source: "online"
    });

    const managerSummary = await visibilityService.getInventorySummary(pilotScope);

    assert.deepEqual(managerSummary, {
      balanceCount: 1,
      itemCount: 1,
      locationCount: 1,
      organizationId: pilotScope.organizationId,
      templeId: pilotScope.templeId,
      transactionCount: 1
    });
  });
});
