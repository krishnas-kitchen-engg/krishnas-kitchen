import assert from "node:assert/strict";
import { describe, it } from "vitest";

import type { InventoryBarcode, InventoryBarcodeItemReference } from "../domain/barcode";
import {
  createInventoryBarcodeLookupService,
  type InventoryBarcodeLookupRepository
} from "./barcodeLookupService";

const riceItem: InventoryBarcodeItemReference = {
  barcodes: [
    {
      format: "upc_a",
      value: "036000291452"
    },
    {
      format: "qr",
      value: "KK:ITEM:rice"
    }
  ],
  defaultUnit: "kg",
  deletedAt: null,
  id: "rice",
  name: "Rice",
  organizationId: "org-1"
};

const dalItem: InventoryBarcodeItemReference = {
  barcodes: [
    {
      format: "ean_13",
      value: "4006381333931"
    }
  ],
  defaultUnit: "kg",
  deletedAt: null,
  id: "dal",
  name: "Dal",
  organizationId: "org-1"
};

function createRepository(
  items: readonly InventoryBarcodeItemReference[]
): InventoryBarcodeLookupRepository & {
  lookups: { barcode: InventoryBarcode; organizationId: string }[];
} {
  const lookups: { barcode: InventoryBarcode; organizationId: string }[] = [];

  return {
    lookups,
    findItemsByBarcode(organizationId, barcode) {
      lookups.push({ barcode, organizationId });

      return Promise.resolve(
        items.filter((item) =>
          item.barcodes.some(
            (itemBarcode) =>
              itemBarcode.format === barcode.format && itemBarcode.value === barcode.value
          )
        )
      );
    }
  };
}

describe("inventory barcode lookup service", () => {
  it("finds active items by any configured barcode without mutating inventory", async () => {
    const repository = createRepository([riceItem, dalItem]);
    const service = createInventoryBarcodeLookupService(repository);

    const upcResult = await service.lookupBarcode("org-1", {
      format: "upc_a",
      rawValue: "036000-29145 2"
    });
    const qrResult = await service.lookupBarcode("org-1", {
      format: "qr",
      rawValue: " KK:ITEM:rice "
    });

    assert.equal(upcResult.status, "found");
    assert.equal(qrResult.status, "found");
    assert.equal(upcResult.status === "found" ? upcResult.item.id : null, "rice");
    assert.equal(qrResult.status === "found" ? qrResult.item.id : null, "rice");
    assert.deepEqual(
      repository.lookups.map((lookup) => lookup.organizationId),
      ["org-1", "org-1"]
    );
  });

  it("returns unknown for valid barcodes that do not identify an item", async () => {
    const service = createInventoryBarcodeLookupService(createRepository([riceItem]));
    const result = await service.lookupBarcode("org-1", {
      format: "ean_13",
      rawValue: "4006381333931"
    });

    assert.equal(result.status, "unknown");
  });

  it("filters archived and cross-organization matches after repository lookup", async () => {
    const archivedItem = {
      ...riceItem,
      deletedAt: "2026-06-04T08:00:00.000Z",
      id: "archived-rice"
    };
    const otherOrganizationItem = {
      ...riceItem,
      id: "other-rice",
      organizationId: "org-2"
    };
    const service = createInventoryBarcodeLookupService(
      createRepository([archivedItem, otherOrganizationItem])
    );

    const result = await service.lookupBarcode("org-1", {
      format: "upc_a",
      rawValue: "036000291452"
    });

    assert.equal(result.status, "unknown");
  });

  it("returns ambiguous when multiple active items share the same barcode", async () => {
    const duplicateRiceItem = {
      ...riceItem,
      id: "rice-duplicate",
      name: "Rice Duplicate"
    };
    const service = createInventoryBarcodeLookupService(
      createRepository([riceItem, duplicateRiceItem])
    );
    const result = await service.lookupBarcode("org-1", {
      format: "upc_a",
      rawValue: "036000291452"
    });

    assert.equal(result.status, "ambiguous");
    assert.deepEqual(result.status === "ambiguous" ? result.items.map((item) => item.id) : [], [
      "rice",
      "rice-duplicate"
    ]);
  });

  it("suppresses duplicate scans before item lookup", async () => {
    const repository = createRepository([riceItem]);
    const service = createInventoryBarcodeLookupService(repository);
    const result = await service.lookupScan("org-1", {
      format: "upc_a",
      rawValue: "036000291452",
      recentScans: [
        {
          barcode: {
            format: "upc_a",
            value: "036000291452"
          },
          scannedAt: "2026-06-04T08:00:00.000Z"
        }
      ],
      scannedAt: "2026-06-04T08:00:01.000Z"
    });

    assert.equal(result.status, "duplicate");
    assert.equal(repository.lookups.length, 0);
  });

  it("returns validation errors for invalid scan values", async () => {
    const service = createInventoryBarcodeLookupService(createRepository([riceItem]));
    const result = await service.lookupBarcode("org-1", {
      format: "upc_a",
      rawValue: "036000291453"
    });

    assert.equal(result.status, "invalid");
  });
});
