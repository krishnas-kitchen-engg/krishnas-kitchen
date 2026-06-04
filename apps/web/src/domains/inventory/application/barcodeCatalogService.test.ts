import assert from "node:assert/strict";
import { describe, it } from "vitest";

import type { InventoryBarcode } from "../domain/barcode";
import type {
  InventoryBarcodeCatalogItemReference,
  InventoryBarcodeMapping,
  InventoryBarcodeMappingDraft
} from "../domain/barcodeCatalog";
import { InventoryBarcodeCatalogValidationError } from "../domain/barcodeCatalog";
import {
  createInventoryBarcodeCatalogService,
  type InventoryBarcodeCatalogItemRepository,
  type InventoryBarcodeCatalogRepository
} from "./barcodeCatalogService";

const actor = {
  type: "user" as const,
  userId: "manager-1"
};

const riceItem: InventoryBarcodeCatalogItemReference = {
  deletedAt: null,
  id: "rice",
  organizationId: "org-1"
};

const dalItem: InventoryBarcodeCatalogItemReference = {
  deletedAt: null,
  id: "dal",
  organizationId: "org-1"
};

function sameBarcode(left: InventoryBarcode, right: InventoryBarcode): boolean {
  return left.format === right.format && left.value === right.value;
}

function persistMapping(
  draft: InventoryBarcodeMappingDraft,
  id = draft.clientId,
  createdAt = "2026-06-04T08:00:00.000Z"
): InventoryBarcodeMapping {
  return {
    ...draft,
    createdAt,
    id,
    updatedAt: createdAt
  };
}

function createRepositories(
  options: {
    items?: readonly InventoryBarcodeCatalogItemReference[];
    mappings?: readonly InventoryBarcodeMapping[];
  } = {}
) {
  const items = [...(options.items ?? [riceItem, dalItem])];
  const mappings = [...(options.mappings ?? [])];
  const writes: InventoryBarcodeMapping[] = [];

  const barcodeRepository: InventoryBarcodeCatalogRepository & {
    mappings: InventoryBarcodeMapping[];
    writes: InventoryBarcodeMapping[];
  } = {
    mappings,
    writes,
    archiveBarcodeMapping(mapping) {
      const index = mappings.findIndex((existingMapping) => existingMapping.id === mapping.id);
      if (index >= 0) {
        mappings[index] = mapping;
      }
      writes.push(mapping);

      return Promise.resolve(mapping);
    },
    createBarcodeMapping(draft) {
      const mapping = persistMapping(draft);
      mappings.push(mapping);
      writes.push(mapping);

      return Promise.resolve(mapping);
    },
    findActiveBarcodeMappingByBarcode(organizationId, barcode) {
      return Promise.resolve(
        mappings.find(
          (mapping) =>
            mapping.organizationId === organizationId &&
            !mapping.archivedAt &&
            sameBarcode(mapping.barcode, barcode)
        ) ?? null
      );
    },
    findBarcodeMappingById(id) {
      return Promise.resolve(mappings.find((mapping) => mapping.id === id) ?? null);
    },
    listBarcodeMappings(organizationId) {
      return Promise.resolve(
        mappings.filter((mapping) => mapping.organizationId === organizationId)
      );
    }
  };

  const itemRepository: InventoryBarcodeCatalogItemRepository = {
    findBarcodeCatalogItem(itemId, organizationId) {
      return Promise.resolve(
        items.find((item) => item.id === itemId && item.organizationId === organizationId) ?? null
      );
    }
  };

  return {
    barcodeRepository,
    service: createInventoryBarcodeCatalogService({
      barcodeRepository,
      itemRepository
    })
  };
}

function createMapping(overrides: Partial<InventoryBarcodeMapping> = {}): InventoryBarcodeMapping {
  return {
    archivedAt: null,
    archivedBy: null,
    archiveReason: null,
    barcode: {
      format: "upc_a",
      value: "036000291452"
    },
    createdAt: "2026-06-04T08:00:00.000Z",
    createdBy: actor,
    id: "mapping-1",
    itemId: "rice",
    notes: null,
    organizationId: "org-1",
    sourceUnknownBarcodeId: null,
    updatedAt: "2026-06-04T08:00:00.000Z",
    ...overrides
  };
}

describe("inventory barcode catalog service", () => {
  it("creates barcode mappings with normalized barcode values", async () => {
    const { barcodeRepository, service } = createRepositories();

    const mapping = await service.createBarcodeMapping({
      actor,
      clientId: "mapping-1",
      createdAt: "2026-06-04T08:00:00.000Z",
      format: "upc_a",
      itemId: "rice",
      notes: "vendor bag label",
      organizationId: "org-1",
      rawValue: "036000-29145 2"
    });

    assert.deepEqual(mapping.barcode, {
      format: "upc_a",
      value: "036000291452"
    });
    assert.equal(mapping.itemId, "rice");
    assert.equal(mapping.notes, "vendor bag label");
    assert.equal(barcodeRepository.mappings.length, 1);
  });

  it("supports unknown barcode integration through source traceability", async () => {
    const { service } = createRepositories();

    const mapping = await service.createBarcodeMapping({
      actor,
      clientId: "mapping-from-unknown",
      createdAt: "2026-06-04T08:00:00.000Z",
      format: "qr",
      itemId: "rice",
      organizationId: "org-1",
      rawValue: " KK:ITEM:RICE ",
      sourceUnknownBarcodeId: "unknown-1"
    });

    assert.equal(mapping.sourceUnknownBarcodeId, "unknown-1");
    assert.deepEqual(mapping.barcode, {
      format: "qr",
      value: "KK:ITEM:RICE"
    });
  });

  it("prevents duplicate active barcode mappings within an organization", async () => {
    const { service } = createRepositories({
      mappings: [createMapping()]
    });

    await assert.rejects(
      () =>
        service.createBarcodeMapping({
          actor,
          clientId: "duplicate-mapping",
          createdAt: "2026-06-04T08:00:00.000Z",
          format: "upc_a",
          itemId: "dal",
          organizationId: "org-1",
          rawValue: "036000291452"
        }),
      InventoryBarcodeCatalogValidationError
    );
  });

  it("allows remapping a barcode after the previous mapping is archived", async () => {
    const { service } = createRepositories({
      mappings: [
        createMapping({
          archivedAt: "2026-06-04T09:00:00.000Z",
          archiveReason: "wrong item"
        })
      ]
    });

    const mapping = await service.createBarcodeMapping({
      actor,
      clientId: "replacement-mapping",
      createdAt: "2026-06-04T10:00:00.000Z",
      format: "upc_a",
      itemId: "dal",
      organizationId: "org-1",
      rawValue: "036000291452"
    });

    assert.equal(mapping.itemId, "dal");
  });

  it("rejects invalid barcodes and missing, archived, or cross-organization items", async () => {
    const archivedItem = {
      ...riceItem,
      deletedAt: "2026-06-04T08:00:00.000Z",
      id: "archived-rice"
    };
    const { service } = createRepositories({
      items: [archivedItem]
    });

    await assert.rejects(
      () =>
        service.createBarcodeMapping({
          actor,
          clientId: "invalid-barcode",
          createdAt: "2026-06-04T08:00:00.000Z",
          format: "upc_a",
          itemId: "archived-rice",
          organizationId: "org-1",
          rawValue: "036000291453"
        }),
      InventoryBarcodeCatalogValidationError
    );
    await assert.rejects(
      () =>
        service.createBarcodeMapping({
          actor,
          clientId: "missing-item",
          createdAt: "2026-06-04T08:00:00.000Z",
          format: "upc_a",
          itemId: "missing-rice",
          organizationId: "org-1",
          rawValue: "036000291452"
        }),
      InventoryBarcodeCatalogValidationError
    );
    await assert.rejects(
      () =>
        service.createBarcodeMapping({
          actor,
          clientId: "archived-item",
          createdAt: "2026-06-04T08:00:00.000Z",
          format: "upc_a",
          itemId: "archived-rice",
          organizationId: "org-1",
          rawValue: "036000291452"
        }),
      InventoryBarcodeCatalogValidationError
    );
  });

  it("archives active barcode mappings within organization boundaries", async () => {
    const { barcodeRepository, service } = createRepositories({
      mappings: [createMapping()]
    });

    const mapping = await service.archiveBarcodeMapping("mapping-1", {
      actor,
      archivedAt: "2026-06-04T09:00:00.000Z",
      organizationId: "org-1",
      reason: "wrong item"
    });

    assert.equal(mapping.archivedAt, "2026-06-04T09:00:00.000Z");
    assert.equal(mapping.archiveReason, "wrong item");
    assert.equal(barcodeRepository.writes.length, 1);
  });

  it("rejects archival of missing, archived, or cross-organization mappings", async () => {
    const { service } = createRepositories({
      mappings: [
        createMapping({
          id: "archived-mapping",
          archivedAt: "2026-06-04T09:00:00.000Z"
        }),
        createMapping({
          id: "other-org-mapping",
          organizationId: "org-2"
        })
      ]
    });

    await assert.rejects(
      () =>
        service.archiveBarcodeMapping("missing-mapping", {
          actor,
          archivedAt: "2026-06-04T09:00:00.000Z",
          organizationId: "org-1"
        }),
      InventoryBarcodeCatalogValidationError
    );
    await assert.rejects(
      () =>
        service.archiveBarcodeMapping("archived-mapping", {
          actor,
          archivedAt: "2026-06-04T09:00:00.000Z",
          organizationId: "org-1"
        }),
      InventoryBarcodeCatalogValidationError
    );
    await assert.rejects(
      () =>
        service.archiveBarcodeMapping("other-org-mapping", {
          actor,
          archivedAt: "2026-06-04T09:00:00.000Z",
          organizationId: "org-1"
        }),
      InventoryBarcodeCatalogValidationError
    );
  });

  it("searches mappings deterministically by organization, item, status, and barcode text", async () => {
    const { service } = createRepositories({
      mappings: [
        createMapping({
          barcode: {
            format: "qr",
            value: "KK:ITEM:RICE"
          },
          id: "rice-qr",
          itemId: "rice"
        }),
        createMapping({
          barcode: {
            format: "ean_13",
            value: "4006381333931"
          },
          id: "dal-ean",
          itemId: "dal"
        }),
        createMapping({
          archivedAt: "2026-06-04T09:00:00.000Z",
          id: "rice-archived"
        }),
        createMapping({
          id: "other-org",
          organizationId: "org-2"
        })
      ]
    });

    const activeResults = await service.searchBarcodeMappings({
      organizationId: "org-1",
      status: "active"
    });
    const riceResults = await service.searchBarcodeMappings({
      itemId: "rice",
      organizationId: "org-1",
      searchText: "item:rice"
    });

    assert.deepEqual(
      activeResults.map((mapping) => mapping.id),
      ["dal-ean", "rice-qr"]
    );
    assert.deepEqual(
      riceResults.map((mapping) => mapping.id),
      ["rice-qr"]
    );
  });

  it("supports zero search limits", async () => {
    const { service } = createRepositories({
      mappings: [createMapping()]
    });

    const results = await service.searchBarcodeMappings({
      limit: 0,
      organizationId: "org-1"
    });

    assert.deepEqual(results, []);
  });
});
