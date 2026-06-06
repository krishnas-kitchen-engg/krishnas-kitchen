import assert from "node:assert/strict";
import { describe, it } from "vitest";

import type { InventoryCatalogItem } from "@/domains/inventory";

import {
  genericScanWorkflowReducer,
  initialGenericScanWorkflowState
} from "./useGenericScanWorkflow";

const riceItem: InventoryCatalogItem = {
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

describe("generic scan workflow reducer", () => {
  it("stores found scan results and updates recent scans", () => {
    const state = genericScanWorkflowReducer(initialGenericScanWorkflowState, {
      barcode: {
        format: "upc_a",
        value: "036000291452"
      },
      item: riceItem,
      scannedAt: "2026-06-05T08:00:00.000Z",
      type: "scan_found"
    });

    assert.equal(state.step, "result");
    assert.equal(state.barcode.status, "found");
    assert.equal(state.resolvedItem?.id, "rice");
    assert.equal(state.recentScans.length, 1);
    assert.equal(state.recentScans[0]?.barcode.value, "036000291452");
  });

  it("keeps only the last five successful scans", () => {
    const state = Array.from({ length: 6 }, (_, index) => index + 1).reduce(
      (currentState, index) =>
        genericScanWorkflowReducer(currentState, {
          barcode: {
            format: "qr",
            value: `scan-${index}`
          },
          item: {
            ...riceItem,
            id: `item-${index}`
          },
          scannedAt: `2026-06-05T08:00:0${index}.000Z`,
          type: "scan_found"
        }),
      initialGenericScanWorkflowState
    );

    assert.equal(state.recentScans.length, 5);
    assert.deepEqual(
      state.recentScans.map((scan) => scan.barcode.value),
      ["scan-6", "scan-5", "scan-4", "scan-3", "scan-2"]
    );
  });

  it("preserves unknown barcode workflow when persistence fails", () => {
    const unknownState = genericScanWorkflowReducer(initialGenericScanWorkflowState, {
      barcode: {
        format: "qr",
        value: "mystery-code"
      },
      scannedAt: "2026-06-05T08:00:00.000Z",
      type: "scan_unknown"
    });
    const failedState = genericScanWorkflowReducer(unknownState, {
      error: "unknown_barcode_create Supabase adapter is not implemented yet.",
      type: "unknown_record_failed"
    });

    assert.equal(failedState.step, "result");
    assert.equal(failedState.lastBarcode?.value, "mystery-code");
    assert.equal(failedState.barcode.status, "record_unknown_failed");
    assert.match(failedState.unknownBarcodePersistenceError ?? "", /unknown_barcode_create/);
  });

  it("manual item selection does not create inventory transaction state", () => {
    const state = genericScanWorkflowReducer(initialGenericScanWorkflowState, {
      item: riceItem,
      type: "manual_select_item"
    });

    assert.equal(state.barcode.status, "manual_selected");
    assert.equal(state.resolvedItem?.id, "rice");
    assert.equal("receivedTransaction" in state, false);
    assert.equal("transferredTransaction" in state, false);
    assert.equal("returnedTransaction" in state, false);
  });

  it("tracks ambiguous scan candidates for manual fallback", () => {
    const state = genericScanWorkflowReducer(initialGenericScanWorkflowState, {
      barcode: {
        format: "qr",
        value: "shared-code"
      },
      items: [riceItem],
      scannedAt: "2026-06-05T08:00:00.000Z",
      type: "scan_ambiguous"
    });

    assert.equal(state.barcode.status, "ambiguous");
    assert.equal(state.ambiguousItems.length, 1);
    assert.equal(state.step, "result");
  });
});
