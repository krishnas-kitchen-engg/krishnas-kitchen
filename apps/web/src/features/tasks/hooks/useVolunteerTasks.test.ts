import assert from "node:assert/strict";
import { describe, it } from "vitest";

import type {
  InventoryLowStockAlert,
  InventoryVisibilityService,
  UnknownBarcodeManagementService,
  UnknownBarcodeRecord
} from "@/domains/inventory";

import {
  initialVolunteerTasksState,
  loadVolunteerTasks,
  projectLowStockTasks,
  projectUnknownBarcodeTasks
} from "./useVolunteerTasks";

const unknownBarcode = {
  actor: {
    type: "user",
    userId: "user-1"
  },
  barcode: {
    format: "qr",
    value: "mystery-code"
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
  linkedBarcodeMappingId: null,
  linkedBy: null,
  linkedItemId: null,
  notes: null,
  organizationId: "org-1",
  scanCount: 2,
  sourceWorkflow: "scan",
  status: "pending",
  templeId: "temple-1",
  updatedAt: "2026-06-05T08:00:00.000Z"
} satisfies UnknownBarcodeRecord;

const lowStockAlert = {
  currentQuantity: 1,
  itemId: "rice",
  locationId: "pantry",
  minimumQuantity: 5,
  organizationId: "org-1",
  shortageQuantity: 4,
  templeId: "temple-1",
  unit: "kg"
} satisfies InventoryLowStockAlert;

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
      assert.equal(query.limit, 25);
      return Promise.resolve([unknownBarcode]);
    },
    recordUnknownBarcode() {
      return Promise.reject(new Error("not used"));
    },
    ...overrides
  };
}

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
    getLowStockAlerts(scope) {
      assert.equal(scope.organizationId, "org-1");
      assert.equal(scope.templeId, "temple-1");
      return Promise.resolve([lowStockAlert]);
    },
    getTransactionHistory() {
      return Promise.reject(new Error("not used"));
    },
    getVisibleBalances() {
      return Promise.reject(new Error("not used"));
    },
    ...overrides
  };
}

describe("volunteer task projections", () => {
  it("projects unknown barcode review tasks explicitly", () => {
    const tasks = projectUnknownBarcodeTasks([unknownBarcode]);

    assert.equal(tasks[0]?.category, "unknown_barcode");
    assert.equal(tasks[0]?.barcodeLabel, "qr: mystery-code");
    assert.equal(tasks[0]?.unknownBarcodeId, "unknown-1");
  });

  it("projects low stock review tasks explicitly", () => {
    const tasks = projectLowStockTasks([lowStockAlert]);

    assert.equal(tasks[0]?.category, "low_stock");
    assert.equal(tasks[0]?.itemId, "rice");
    assert.equal(tasks[0]?.currentQuantity, 1);
  });

  it("loads task categories independently", async () => {
    const state = await loadVolunteerTasks({
      organizationId: "org-1",
      templeId: "temple-1",
      unknownBarcodes: createUnknownBarcodeService(),
      visibility: createVisibilityService()
    });

    assert.equal(state.unknownBarcodes.items.length, 1);
    assert.equal(state.lowStock.items.length, 1);
  });

  it("renders low stock tasks when unknown barcode tasks are unavailable", async () => {
    const state = await loadVolunteerTasks({
      organizationId: "org-1",
      templeId: "temple-1",
      unknownBarcodes: createUnknownBarcodeService({
        listPendingUnknownBarcodes() {
          return Promise.reject(new Error("unknown barcode adapter missing"));
        }
      }),
      visibility: createVisibilityService()
    });

    assert.equal(state.unknownBarcodes.status, "unavailable");
    assert.equal(state.lowStock.status, "loaded");
    assert.equal(state.lowStock.items.length, 1);
  });

  it("renders unknown barcode tasks when low stock tasks are unavailable", async () => {
    const state = await loadVolunteerTasks({
      organizationId: "org-1",
      templeId: "temple-1",
      unknownBarcodes: createUnknownBarcodeService(),
      visibility: createVisibilityService({
        getLowStockAlerts() {
          return Promise.reject(new Error("low stock thresholds missing"));
        }
      })
    });

    assert.equal(state.lowStock.status, "unavailable");
    assert.equal(state.unknownBarcodes.status, "loaded");
    assert.equal(state.unknownBarcodes.items.length, 1);
  });

  it("uses empty task state without inventory read permission", () => {
    assert.deepEqual(initialVolunteerTasksState.unknownBarcodes.items, []);
    assert.deepEqual(initialVolunteerTasksState.lowStock.items, []);
  });
});
