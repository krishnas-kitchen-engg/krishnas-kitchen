import assert from "node:assert/strict";
import { describe, it } from "vitest";

import type {
  InventoryTransaction,
  InventoryVisibilityService,
  UnknownBarcodeManagementService,
  UnknownBarcodeRecord
} from "@/domains/inventory";

import {
  formatHomeActivity,
  initialVolunteerHomeSummaryState,
  loadVolunteerHomeSummary
} from "./useVolunteerHomeSummary";

const receivedTransaction = {
  actor: {
    type: "user",
    userId: "user-1"
  },
  auditMetadata: {
    source: "online"
  },
  createdAt: "2026-06-05T08:00:00.000Z",
  destinationLocationId: "pantry",
  id: "tx-1",
  itemId: "Rice",
  notes: null,
  organizationId: "org-1",
  quantity: 25,
  quantityEffect: "increase",
  reversalOfTransactionId: null,
  sourceLocationId: null,
  templeId: "temple-1",
  transactionType: "received",
  unit: "kg"
} satisfies InventoryTransaction;

const transferTransaction = {
  ...receivedTransaction,
  destinationLocationId: "Kitchen",
  id: "tx-2",
  itemId: "Oil",
  quantityEffect: "transfer",
  sourceLocationId: "Pantry",
  transactionType: "transfer"
} satisfies InventoryTransaction;

const pendingUnknownBarcode = {
  actor: {
    type: "user",
    userId: "user-1"
  },
  barcode: {
    format: "qr",
    value: "mystery"
  },
  createdAt: "2026-06-05T08:00:00.000Z",
  dismissedAt: null,
  dismissedBy: null,
  dismissalReason: null,
  firstSeenAt: "2026-06-05T08:00:00.000Z",
  id: "unknown-1",
  lastSeenAt: "2026-06-05T08:00:00.000Z",
  lastSeenBy: {
    type: "user",
    userId: "user-1"
  },
  linkedAt: null,
  linkedBy: null,
  linkedItemId: null,
  notes: null,
  organizationId: "org-1",
  scanCount: 1,
  sourceWorkflow: "scan",
  status: "pending",
  templeId: "temple-1",
  updatedAt: "2026-06-05T08:00:00.000Z"
} satisfies UnknownBarcodeRecord;

function createVisibilityService(
  overrides: Partial<InventoryVisibilityService> = {}
): InventoryVisibilityService {
  return {
    getInventorySummary() {
      return Promise.reject(new Error("not used"));
    },
    getItemBalances() {
      return Promise.reject(new Error("not used"));
    },
    getLocationBalances() {
      return Promise.reject(new Error("not used"));
    },
    getLowStockAlerts() {
      return Promise.resolve([]);
    },
    getTransactionHistory(query) {
      assert.equal(query.organizationId, "org-1");
      assert.equal(query.templeId, "temple-1");
      assert.equal(query.limit, 5);
      return Promise.resolve([receivedTransaction]);
    },
    getVisibleBalances() {
      return Promise.reject(new Error("not used"));
    },
    ...overrides
  };
}

function createUnknownBarcodeService(
  overrides: Partial<UnknownBarcodeManagementService> = {}
): UnknownBarcodeManagementService {
  return {
    dismissUnknownBarcode() {
      return Promise.reject(new Error("not used"));
    },
    linkUnknownBarcode() {
      return Promise.reject(new Error("not used"));
    },
    listPendingUnknownBarcodes(query) {
      assert.equal(query.organizationId, "org-1");
      assert.equal(query.templeId, "temple-1");
      assert.equal(query.limit, 5);
      return Promise.resolve([pendingUnknownBarcode]);
    },
    recordUnknownBarcode() {
      return Promise.reject(new Error("not used"));
    },
    ...overrides
  };
}

describe("useVolunteerHomeSummary helpers", () => {
  it("formats recent activity as volunteer-friendly descriptions", () => {
    assert.equal(formatHomeActivity(receivedTransaction).description, "Rice received (+25 kg)");
    assert.equal(
      formatHomeActivity(transferTransaction).description,
      "Oil transferred (Pantry -> Kitchen)"
    );
  });

  it("loads recent activity using organization and temple scope", async () => {
    const summary = await loadVolunteerHomeSummary({
      organizationId: "org-1",
      templeId: "temple-1",
      unknownBarcodes: createUnknownBarcodeService(),
      visibility: createVisibilityService()
    });

    assert.equal(summary.recentActivity.items[0]?.description, "Rice received (+25 kg)");
    assert.equal(summary.pendingUnknownBarcodes.items[0]?.id, "unknown-1");
  });

  it("handles visibility service failure without blocking unknown barcodes", async () => {
    const summary = await loadVolunteerHomeSummary({
      organizationId: "org-1",
      templeId: "temple-1",
      unknownBarcodes: createUnknownBarcodeService(),
      visibility: createVisibilityService({
        getTransactionHistory() {
          return Promise.reject(new Error("history failed"));
        }
      })
    });

    assert.equal(summary.recentActivity.status, "unavailable");
    assert.equal(summary.pendingUnknownBarcodes.items.length, 1);
  });

  it("handles unknown barcode service failure without blocking recent activity", async () => {
    const summary = await loadVolunteerHomeSummary({
      organizationId: "org-1",
      templeId: "temple-1",
      unknownBarcodes: createUnknownBarcodeService({
        listPendingUnknownBarcodes() {
          return Promise.reject(new Error("unknown barcode adapter missing"));
        }
      }),
      visibility: createVisibilityService()
    });

    assert.equal(summary.pendingUnknownBarcodes.status, "unavailable");
    assert.equal(summary.recentActivity.items.length, 1);
  });

  it("handles partial Promise.allSettled failures", async () => {
    const summary = await loadVolunteerHomeSummary({
      organizationId: "org-1",
      templeId: "temple-1",
      unknownBarcodes: createUnknownBarcodeService({
        listPendingUnknownBarcodes() {
          return Promise.reject(new Error("unknown failed"));
        }
      }),
      visibility: createVisibilityService({
        getLowStockAlerts() {
          return Promise.reject(new Error("low stock failed"));
        }
      })
    });

    assert.equal(summary.recentActivity.status, "loaded");
    assert.equal(summary.lowStock.status, "unavailable");
    assert.equal(summary.pendingUnknownBarcodes.status, "unavailable");
  });

  it("returns empty low-stock summary when thresholds are unavailable", async () => {
    const summary = await loadVolunteerHomeSummary({
      organizationId: "org-1",
      templeId: "temple-1",
      unknownBarcodes: createUnknownBarcodeService(),
      visibility: createVisibilityService()
    });

    assert.deepEqual(summary.lowStock.items, []);
    assert.equal(summary.lowStock.status, "loaded");
  });

  it("uses empty summary state when inventory read permission is absent", () => {
    assert.deepEqual(initialVolunteerHomeSummaryState.recentActivity.items, []);
    assert.deepEqual(initialVolunteerHomeSummaryState.lowStock.items, []);
    assert.deepEqual(initialVolunteerHomeSummaryState.pendingUnknownBarcodes.items, []);
  });
});
