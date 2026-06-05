import assert from "node:assert/strict";
import { describe, it } from "vitest";

import {
  createReceivingTransaction,
  createReturnedTransaction,
  createTransferTransaction
} from "../domain/transactionHelpers";
import type {
  InventoryCatalogBarcode,
  InventoryCatalogItem,
  InventoryCatalogLocation
} from "../domain/catalog";
import type {
  InventoryTransaction,
  InventoryTransactionDraft,
  InventoryTransactionScope,
  ReceivingInventoryTransactionDraft
} from "../domain/types";
import type { InventoryTransactionRepository } from "./inventoryRepository";
import {
  createInventoryCatalogQueryService,
  type InventoryCatalogQueryRepository
} from "./inventoryCatalogQueryService";

const actor = {
  type: "user" as const,
  userId: "manager-1"
};

const items = [
  {
    barcodes: [
      {
        format: "upc_a",
        value: "036000291452"
      },
      {
        format: "qr",
        value: "KK:ITEM:RICE"
      }
    ],
    defaultUnit: "kg",
    deletedAt: null,
    id: "rice",
    name: "Rice",
    organizationId: "org-1",
    receivingUnits: ["kg", "g"],
    returnUnits: ["kg"],
    transferUnits: ["kg"]
  },
  {
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
  },
  {
    barcodes: [],
    defaultUnit: "kg",
    deletedAt: "2026-06-04T08:00:00.000Z",
    id: "archived-rice",
    name: "Archived Rice",
    organizationId: "org-1"
  },
  {
    barcodes: [],
    defaultUnit: "kg",
    deletedAt: null,
    id: "other-rice",
    name: "Other Rice",
    organizationId: "org-2"
  }
] satisfies InventoryCatalogItem[];

const locations = [
  {
    deletedAt: null,
    id: "pantry",
    name: "Pantry",
    organizationId: "org-1",
    templeId: "temple-1"
  },
  {
    deletedAt: null,
    id: "trailer",
    name: "Trailer",
    organizationId: "org-1",
    templeId: "temple-1"
  },
  {
    deletedAt: null,
    id: "kitchen",
    name: "Kitchen",
    organizationId: "org-1",
    templeId: "temple-1"
  },
  {
    deletedAt: null,
    id: "festival-storage",
    name: "Festival Storage",
    organizationId: "org-1",
    templeId: "temple-2"
  },
  {
    deletedAt: "2026-06-04T08:00:00.000Z",
    id: "archived-pantry",
    name: "Archived Pantry",
    organizationId: "org-1",
    templeId: "temple-1"
  },
  {
    deletedAt: null,
    id: "other-pantry",
    name: "Other Pantry",
    organizationId: "org-2",
    templeId: "temple-2"
  }
] satisfies InventoryCatalogLocation[];

const barcodes = items.flatMap((item) =>
  item.barcodes.map(
    (barcode) =>
      ({
        ...barcode,
        itemId: item.id,
        itemName: item.name,
        organizationId: item.organizationId
      }) satisfies InventoryCatalogBarcode
  )
);

function persist(
  draft: InventoryTransactionDraft,
  id: string,
  createdAt: string
): InventoryTransaction {
  return {
    ...draft,
    createdAt,
    id
  };
}

const transactions = [
  persist(
    createReceivingTransaction({
      actor,
      itemId: "rice",
      locationId: "trailer",
      organizationId: "org-1",
      quantity: 30,
      templeId: "temple-1",
      unit: "kg"
    }),
    "received-rice",
    "2026-06-04T08:00:00.000Z"
  ),
  persist(
    createTransferTransaction({
      actor,
      destinationLocationId: "pantry",
      itemId: "rice",
      organizationId: "org-1",
      quantity: 10,
      sourceLocationId: "trailer",
      templeId: "temple-1",
      unit: "kg"
    }),
    "transfer-rice",
    "2026-06-04T09:00:00.000Z"
  ),
  persist(
    createReturnedTransaction({
      actor,
      destinationLocationId: "pantry",
      itemId: "dal",
      organizationId: "org-1",
      quantity: 5,
      sourceLocationId: "kitchen",
      templeId: "temple-1",
      unit: "kg"
    }),
    "return-dal",
    "2026-06-04T10:00:00.000Z"
  ),
  persist(
    createReceivingTransaction({
      actor,
      itemId: "other-rice",
      locationId: "other-pantry",
      organizationId: "org-2",
      quantity: 100,
      templeId: "temple-2",
      unit: "kg"
    }),
    "other-org-receiving",
    "2026-06-04T11:00:00.000Z"
  )
] satisfies InventoryTransaction[];

function createCatalogRepository(): InventoryCatalogQueryRepository & {
  calls: { method: string; organizationId: string }[];
} {
  const calls: { method: string; organizationId: string }[] = [];

  return {
    calls,
    listBarcodes(organizationId) {
      calls.push({ method: "listBarcodes", organizationId });

      return Promise.resolve(barcodes);
    },
    listItems(organizationId) {
      calls.push({ method: "listItems", organizationId });

      return Promise.resolve(items);
    },
    listLocations(organizationId) {
      calls.push({ method: "listLocations", organizationId });

      return Promise.resolve(locations);
    }
  };
}

function createTransactionRepository(): InventoryTransactionRepository & {
  scopes: InventoryTransactionScope[];
} {
  const scopes: InventoryTransactionScope[] = [];

  return {
    scopes,
    createReceivingTransaction(_draft: ReceivingInventoryTransactionDraft) {
      throw new Error("Catalog query tests should not create receiving transactions.");
    },
    createTransaction(_draft: InventoryTransactionDraft) {
      throw new Error("Catalog query tests should not create transactions.");
    },
    findTransactionById() {
      throw new Error("Catalog query tests should not find transactions by id.");
    },
    listTransactions(scope) {
      scopes.push(scope);

      return Promise.resolve(
        transactions.filter(
          (transaction) =>
            transaction.organizationId === scope.organizationId &&
            (!scope.templeId || transaction.templeId === scope.templeId)
        )
      );
    }
  };
}

function createService() {
  const catalogRepository = createCatalogRepository();
  const transactionRepository = createTransactionRepository();

  return {
    catalogRepository,
    service: createInventoryCatalogQueryService({
      catalogRepository,
      transactionRepository
    }),
    transactionRepository
  };
}

describe("inventory catalog query service", () => {
  it("searches active organization items by name, id, or barcode with deterministic sorting", async () => {
    const { catalogRepository, service } = createService();

    const riceResults = await service.searchItems({
      organizationId: "org-1",
      searchText: "rice"
    });
    const barcodeResults = await service.searchItems({
      organizationId: "org-1",
      searchText: "036000"
    });

    assert.deepEqual(
      riceResults.map((item) => item.id),
      ["rice"]
    );
    assert.deepEqual(
      barcodeResults.map((item) => item.id),
      ["rice"]
    );
    assert.equal(catalogRepository.calls[0]?.organizationId, "org-1");
  });

  it("finds active items by id within organization boundaries", async () => {
    const { service } = createService();

    const item = await service.findItemById("org-1", "rice");
    const archivedItem = await service.findItemById("org-1", "archived-rice");
    const otherOrgItem = await service.findItemById("org-1", "other-rice");

    assert.equal(item?.id, "rice");
    assert.equal(archivedItem, null);
    assert.equal(otherOrgItem, null);
  });

  it("searches locations and lists active locations within organization and temple boundaries", async () => {
    const { service } = createService();

    const searchResults = await service.searchLocations({
      organizationId: "org-1",
      searchText: "pan",
      templeId: "temple-1"
    });
    const activeLocations = await service.listActiveLocations({
      limit: 2,
      organizationId: "org-1",
      templeId: "temple-1"
    });

    assert.deepEqual(
      searchResults.map((location) => location.id),
      ["pantry"]
    );
    assert.deepEqual(
      activeLocations.map((location) => location.id),
      ["kitchen", "pantry"]
    );
  });

  it("finds active locations by id within organization and temple boundaries", async () => {
    const { service } = createService();

    const location = await service.findLocationById("org-1", "temple-1", "pantry");
    const differentTempleLocation = await service.findLocationById(
      "org-1",
      "temple-1",
      "festival-storage"
    );
    const archivedLocation = await service.findLocationById("org-1", "temple-1", "archived-pantry");

    assert.equal(location?.id, "pantry");
    assert.equal(differentTempleLocation, null);
    assert.equal(archivedLocation, null);
  });

  it("searches barcodes without exposing other organizations", async () => {
    const { service } = createService();

    const results = await service.searchBarcodes({
      organizationId: "org-1",
      searchText: "rice"
    });

    assert.deepEqual(
      results.map((barcode) => [barcode.itemId, barcode.format, barcode.value]),
      [
        ["rice", "qr", "KK:ITEM:RICE"],
        ["rice", "upc_a", "036000291452"]
      ]
    );
  });

  it("ranks frequently used active locations from transaction history", async () => {
    const { service, transactionRepository } = createService();

    const results = await service.listFrequentlyUsedLocations({
      organizationId: "org-1",
      templeId: "temple-1"
    });

    assert.deepEqual(
      results.map((location) => [location.id, location.transactionCount]),
      [
        ["pantry", 2],
        ["trailer", 2],
        ["kitchen", 1]
      ]
    );
    assert.deepEqual(transactionRepository.scopes, [
      {
        organizationId: "org-1",
        templeId: "temple-1"
      }
    ]);
  });

  it("returns recent active items from latest transaction history", async () => {
    const { service } = createService();

    const results = await service.listRecentItems({
      organizationId: "org-1",
      templeId: "temple-1"
    });

    assert.deepEqual(
      results.map((item) => [item.id, item.lastTransactionId]),
      [
        ["dal", "return-dal"],
        ["rice", "transfer-rice"]
      ]
    );
  });

  it("supports zero limits deterministically", async () => {
    const { service } = createService();

    const items = await service.searchItems({
      limit: 0,
      organizationId: "org-1"
    });
    const locations = await service.listFrequentlyUsedLocations({
      limit: 0,
      organizationId: "org-1",
      templeId: "temple-1"
    });

    assert.deepEqual(items, []);
    assert.deepEqual(locations, []);
  });
});
