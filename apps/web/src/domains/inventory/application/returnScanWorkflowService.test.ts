import assert from "node:assert/strict";
import { describe, it } from "vitest";

import type {
  InventoryBarcodeItemReference,
  InventoryBarcodeLookupResult,
  InventoryBarcodeScanEvent,
  InventoryBarcodeScanInput
} from "../domain/barcode";
import type {
  CreateReturnTransactionInput,
  InventoryBalance,
  InventoryTransaction,
  InventoryTransactionScope
} from "../domain/types";
import type { InventoryBarcodeLookupService } from "./barcodeLookupService";
import type { InventoryService } from "./inventoryService";
import type { InventoryVisibilityService } from "./inventoryVisibilityService";
import { createReturnScanWorkflowService } from "./returnScanWorkflowService";

const riceItem: InventoryBarcodeItemReference = {
  barcodes: [
    {
      format: "upc_a",
      value: "036000291452"
    }
  ],
  defaultUnit: "kg",
  deletedAt: null,
  id: "rice",
  name: "Rice",
  organizationId: "org-1"
};

const actor = {
  type: "user" as const,
  userId: "manager-1"
};

function createBarcodeLookupService(
  result:
    | InventoryBarcodeLookupResult
    | { duplicateOf: InventoryBarcodeScanEvent; status: "duplicate" }
): InventoryBarcodeLookupService & {
  scans: (InventoryBarcodeScanInput & {
    recentScans?: readonly InventoryBarcodeScanEvent[];
    scannedAt: string;
  })[];
} {
  const scans: (InventoryBarcodeScanInput & {
    recentScans?: readonly InventoryBarcodeScanEvent[];
    scannedAt: string;
  })[] = [];

  return {
    scans,
    lookupBarcode() {
      throw new Error("Return scan workflow should use scan lookup.");
    },
    lookupScan(_organizationId, input) {
      scans.push(input);

      return Promise.resolve(result);
    }
  };
}

function createInventoryService(): InventoryService & {
  returnInputs: CreateReturnTransactionInput[];
} {
  const returnInputs: CreateReturnTransactionInput[] = [];

  return {
    returnInputs,
    createTransaction() {
      throw new Error("Return scan workflow must not create generic transactions.");
    },
    getBalances() {
      return Promise.resolve([]);
    },
    getTransactions() {
      return Promise.resolve([]);
    },
    receiveInventory() {
      throw new Error("Return scan workflow must not receive inventory.");
    },
    returnInventory(input) {
      returnInputs.push(input);

      return Promise.resolve({
        actor: input.actor,
        auditMetadata: input.auditMetadata ?? {},
        createdAt: "2026-06-04T08:00:00.000Z",
        destinationLocationId: input.destinationLocationId,
        id: "return-1",
        itemId: input.itemId,
        notes: input.notes ?? null,
        organizationId: input.organizationId,
        quantity: input.quantity,
        quantityEffect: "transfer",
        reversalOfTransactionId: null,
        sourceLocationId: input.sourceLocationId,
        templeId: input.templeId,
        transactionType: "returned",
        unit: input.unit
      } satisfies InventoryTransaction);
    },
    transferInventory() {
      throw new Error("Return scan workflow must not transfer inventory.");
    },
    undoTransaction() {
      throw new Error("Return scan workflow must not reverse inventory.");
    }
  };
}

function createVisibilityService(): InventoryVisibilityService & {
  balanceScopes: InventoryTransactionScope[];
} {
  const balanceScopes: InventoryTransactionScope[] = [];

  return {
    balanceScopes,
    getInventorySummary() {
      throw new Error("Return scan workflow should not request summary projections.");
    },
    getItemBalances() {
      throw new Error("Return scan workflow should not request item projections.");
    },
    getLocationBalances() {
      throw new Error("Return scan workflow should not request location projections.");
    },
    getLowStockAlerts() {
      throw new Error("Return scan workflow should not request low stock projections.");
    },
    getTransactionHistory() {
      throw new Error("Return scan workflow should not request transaction history.");
    },
    getVisibleBalances(scope) {
      balanceScopes.push(scope);

      const quantity = scope.locationId === "kitchen" ? 5 : 45;
      const balances: InventoryBalance[] = [
        {
          itemId: "rice",
          locationId: scope.locationId ?? "unknown",
          organizationId: "org-1",
          quantity,
          templeId: "temple-1",
          unit: "kg"
        }
      ];

      return Promise.resolve(balances);
    }
  };
}

function createWorkflow(
  lookupResult:
    | InventoryBarcodeLookupResult
    | { duplicateOf: InventoryBarcodeScanEvent; status: "duplicate" }
) {
  const barcodeLookupService = createBarcodeLookupService(lookupResult);
  const inventoryService = createInventoryService();
  const visibilityService = createVisibilityService();

  return {
    barcodeLookupService,
    inventoryService,
    service: createReturnScanWorkflowService({
      barcodeLookupService,
      inventoryService,
      visibilityService
    }),
    visibilityService
  };
}

describe("return scan workflow service", () => {
  it("resolves scanned barcodes to return items through barcode lookup", async () => {
    const { barcodeLookupService, service } = createWorkflow({
      barcode: {
        format: "upc_a",
        value: "036000291452"
      },
      item: riceItem,
      status: "found"
    });

    const result = await service.resolveScan({
      format: "upc_a",
      organizationId: "org-1",
      permission: "granted",
      rawValue: "036000291452",
      scannedAt: "2026-06-04T08:00:00.000Z"
    });

    assert.equal(result.status, "resolved");
    assert.equal(result.status === "resolved" ? result.resolvedItem.item.id : null, "rice");
    assert.equal(result.status === "resolved" ? result.resolvedItem.source : null, "scan");
    assert.equal(barcodeLookupService.scans.length, 1);
  });

  it("enforces camera permission before barcode lookup", async () => {
    const { barcodeLookupService, service } = createWorkflow({
      barcode: {
        format: "upc_a",
        value: "036000291452"
      },
      item: riceItem,
      status: "found"
    });

    const result = await service.resolveScan({
      format: "upc_a",
      organizationId: "org-1",
      permission: "denied",
      rawValue: "036000291452",
      scannedAt: "2026-06-04T08:00:00.000Z"
    });

    assert.equal(result.status, "permission_denied");
    assert.equal(barcodeLookupService.scans.length, 0);
  });

  it("returns duplicate, unknown, invalid, and ambiguous scan outcomes without returning inventory", async () => {
    const duplicateScan = {
      barcode: {
        format: "upc_a" as const,
        value: "036000291452"
      },
      scannedAt: "2026-06-04T08:00:00.000Z"
    };
    const duplicateWorkflow = createWorkflow({
      duplicateOf: duplicateScan,
      status: "duplicate"
    });
    const unknownWorkflow = createWorkflow({
      barcode: duplicateScan.barcode,
      status: "unknown"
    });
    const invalidWorkflow = createWorkflow({
      errors: [
        {
          code: "CHECK_DIGIT_INVALID",
          field: "value",
          message: "Barcode check digit is invalid."
        }
      ],
      rawValue: "036000291453",
      status: "invalid"
    });
    const ambiguousWorkflow = createWorkflow({
      barcode: duplicateScan.barcode,
      items: [riceItem, { ...riceItem, id: "rice-duplicate" }],
      status: "ambiguous"
    });

    const duplicate = await duplicateWorkflow.service.resolveScan({
      format: "upc_a",
      organizationId: "org-1",
      permission: "granted",
      rawValue: "036000291452",
      scannedAt: "2026-06-04T08:00:01.000Z"
    });
    const unknown = await unknownWorkflow.service.resolveScan({
      format: "upc_a",
      organizationId: "org-1",
      permission: "granted",
      rawValue: "036000291452",
      scannedAt: "2026-06-04T08:00:01.000Z"
    });
    const invalid = await invalidWorkflow.service.resolveScan({
      format: "upc_a",
      organizationId: "org-1",
      permission: "granted",
      rawValue: "036000291453",
      scannedAt: "2026-06-04T08:00:01.000Z"
    });
    const ambiguous = await ambiguousWorkflow.service.resolveScan({
      format: "upc_a",
      organizationId: "org-1",
      permission: "granted",
      rawValue: "036000291452",
      scannedAt: "2026-06-04T08:00:01.000Z"
    });

    assert.equal(duplicate.status, "duplicate");
    assert.equal(unknown.status, "unknown");
    assert.equal(invalid.status, "invalid");
    assert.equal(ambiguous.status, "ambiguous");
    assert.equal(duplicateWorkflow.inventoryService.returnInputs.length, 0);
    assert.equal(unknownWorkflow.inventoryService.returnInputs.length, 0);
    assert.equal(invalidWorkflow.inventoryService.returnInputs.length, 0);
    assert.equal(ambiguousWorkflow.inventoryService.returnInputs.length, 0);
  });

  it("supports manual item override for known active organization items", async () => {
    const { service } = createWorkflow({
      barcode: {
        format: "upc_a",
        value: "036000291452"
      },
      status: "unknown"
    });

    const result = await service.resolveManualItem({
      item: riceItem,
      organizationId: "org-1",
      reason: "label missing"
    });

    assert.equal(result.status, "resolved");
    assert.equal(
      result.status === "resolved" ? result.resolvedItem.source : null,
      "manual_override"
    );
  });

  it("returns resolved items only through the return service and returns source and destination balances", async () => {
    const { inventoryService, service, visibilityService } = createWorkflow({
      barcode: {
        format: "upc_a",
        value: "036000291452"
      },
      item: riceItem,
      status: "found"
    });
    const resolution = await service.resolveManualItem({
      item: riceItem,
      organizationId: "org-1"
    });
    assert.equal(resolution.status, "resolved");
    if (resolution.status !== "resolved") {
      throw new Error("Expected manual override to resolve.");
    }

    const result = await service.returnResolvedItem({
      actor,
      destinationLocationId: "pantry",
      notes: "scanned return",
      quantity: 10,
      resolvedItem: resolution.resolvedItem,
      sourceLocationId: "kitchen",
      templeId: "temple-1",
      unit: "kg"
    });

    assert.equal(result.returnedTransaction.transactionType, "returned");
    assert.equal(result.returnedTransaction.quantityEffect, "transfer");
    assert.equal(result.returnedTransaction.itemId, "rice");
    assert.equal(result.returnedTransaction.sourceLocationId, "kitchen");
    assert.equal(result.returnedTransaction.destinationLocationId, "pantry");
    assert.equal(inventoryService.returnInputs.length, 1);
    assert.deepEqual(visibilityService.balanceScopes, [
      {
        itemId: "rice",
        locationId: "kitchen",
        organizationId: "org-1",
        templeId: "temple-1"
      },
      {
        itemId: "rice",
        locationId: "pantry",
        organizationId: "org-1",
        templeId: "temple-1"
      }
    ]);
    assert.deepEqual(
      result.sourceBalances.map((balance) => balance.quantity),
      [5]
    );
    assert.deepEqual(
      result.destinationBalances.map((balance) => balance.quantity),
      [45]
    );
  });
});
