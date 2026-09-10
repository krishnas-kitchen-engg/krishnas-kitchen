import assert from "node:assert/strict";
import { describe, it } from "vitest";

import type { InventoryCatalogItem } from "./catalog";
import {
  convertInventoryBaseToEntry,
  convertInventoryEntryToBase,
  formatInventoryStock,
  formatInventoryTransactionQuantity,
  formatInventoryQuantity,
  formatPackageDefinition,
  getInventoryProductName,
  getPackageEquivalent
} from "./packaging";

const cups: InventoryCatalogItem = {
  barcodes: [],
  contentsLabel: "cups",
  contentsQuantity: 8000,
  contentsUnit: "unit",
  defaultUnit: "unit",
  deletedAt: null,
  id: "cups-3oz-8000",
  handlingUnit: "box",
  name: "Paper Cold Cups, 3 oz — 8,000 ct Box",
  organizationId: "org-1",
  packageDescription: "20 sleeves × 400 cups per box",
  productName: "Paper Cold Cups, 3 oz"
};

describe("inventory packaging", () => {
  it("keeps physical package quantities primary and calculates supporting equivalents", () => {
    assert.equal(formatInventoryQuantity(3, cups.handlingUnit!), "3 boxes");
    assert.equal(formatPackageDefinition(cups), "20 sleeves × 400 cups per box");
    assert.deepEqual(getPackageEquivalent(3, cups), {
      label: "cups",
      quantity: 24000,
      unit: "unit"
    });
  });

  it("converts handling-unit entries to storage units and back", () => {
    assert.deepEqual(convertInventoryEntryToBase(3, "box", cups), {
      conversionFactor: 8000,
      quantity: 24000,
      unit: "unit"
    });
    assert.equal(convertInventoryBaseToEntry(24000, "unit", cups, "box"), 3);
    assert.deepEqual(formatInventoryStock(24000, "unit", cups), {
      handlingQuantity: 3,
      primary: "3 boxes",
      secondary: "24,000 cups"
    });
  });

  it("shows the handling quantity and base equivalent in transaction history", () => {
    assert.equal(
      formatInventoryTransactionQuantity({
        auditMetadata: { handlingQuantity: 2, handlingUnit: "box" },
        quantity: 16000,
        unit: "unit"
      }),
      "2 boxes (16,000 units)"
    );
  });

  it("groups package-size SKUs under their product and falls back for legacy items", () => {
    assert.equal(getInventoryProductName(cups), "Paper Cold Cups, 3 oz");
    assert.equal(
      getInventoryProductName({ ...cups, name: "Legacy item", productName: null }),
      "Legacy item"
    );
  });

  it("does not invent an equivalent when package conversion is incomplete", () => {
    assert.equal(
      getPackageEquivalent(3, { ...cups, contentsQuantity: null, contentsUnit: null }),
      null
    );
  });
});
