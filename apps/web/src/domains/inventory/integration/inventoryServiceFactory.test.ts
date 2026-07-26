import assert from "node:assert/strict";
import { describe, it } from "vitest";

import type { InventoryBarcode, InventoryBarcodeItemReference } from "../domain/barcode";
import type {
  InventoryBarcodeMapping,
  InventoryBarcodeMappingDraft
} from "../domain/barcodeCatalog";
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
import type {
  UnknownBarcodeDraft,
  UnknownBarcodeQuery,
  UnknownBarcodeRecord
} from "../domain/unknownBarcode";
import type { InventoryRepositoryAdapters } from "./inventoryServiceFactory";
import { createInventoryServiceBundle } from "./inventoryServiceFactory";
import { getInventoryPermissionFlags, resolveInventoryActor } from "./inventoryHooks";

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

function createRepositoryAdapters(
  options: {
    items?: readonly InventoryCatalogItem[];
    locations?: readonly InventoryCatalogLocation[];
  } = {}
): InventoryRepositoryAdapters & {
  receivedDrafts: ReceivingInventoryTransactionDraft[];
  transactionScopes: InventoryTransactionScope[];
} {
  const receivedDrafts: ReceivingInventoryTransactionDraft[] = [];
  const transactionScopes: InventoryTransactionScope[] = [];

  return {
    barcodeCatalogItemRepository: {
      findBarcodeCatalogItem() {
        return Promise.resolve({
          deletedAt: null,
          id: "rice",
          organizationId: "org-1"
        });
      }
    },
    barcodeCatalogRepository: {
      archiveBarcodeMapping(mapping: InventoryBarcodeMapping) {
        return Promise.resolve(mapping);
      },
      createBarcodeMapping(draft: InventoryBarcodeMappingDraft) {
        return Promise.resolve({
          ...draft,
          createdAt: "2026-06-04T08:00:00.000Z",
          id: draft.clientId,
          updatedAt: "2026-06-04T08:00:00.000Z"
        });
      },
      findActiveBarcodeMappingByBarcode() {
        return Promise.resolve(null);
      },
      findBarcodeMappingById() {
        return Promise.resolve(null);
      },
      listBarcodeMappings() {
        return Promise.resolve([]);
      }
    },
    barcodeLookupRepository: {
      findItemsByBarcode(_organizationId: string, barcode: InventoryBarcode) {
        return Promise.resolve(
          riceItem.barcodes.some(
            (itemBarcode) =>
              itemBarcode.format === barcode.format && itemBarcode.value === barcode.value
          )
            ? [riceItem]
            : []
        );
      }
    },
    catalogQueryRepository: {
      listBarcodes() {
        return Promise.resolve([] satisfies InventoryCatalogBarcode[]);
      },
      listItems() {
        return Promise.resolve([...(options.items ?? [])]);
      },
      listLocations() {
        return Promise.resolve([...(options.locations ?? [])]);
      }
    },
    lowStockThresholdRepository: {
      listActiveLowStockThresholds() {
        return Promise.resolve([]);
      }
    },
    transactionRepository: {
      createReceivingTransaction(draft: ReceivingInventoryTransactionDraft) {
        receivedDrafts.push(draft);

        return Promise.resolve({
          ...draft,
          createdAt: "2026-06-04T08:00:00.000Z",
          id: draft.clientId
        });
      },
      createTransaction(_draft: InventoryTransactionDraft) {
        throw new Error("Factory test should not create transactions.");
      },
      findTransactionById() {
        return Promise.resolve(null);
      },
      listTransactions(scope) {
        transactionScopes.push(scope);

        return Promise.resolve([] satisfies InventoryTransaction[]);
      }
    },
    receivedDrafts,
    transactionScopes,
    unknownBarcodeItemRepository: {
      findItemForBarcodeLinking() {
        return Promise.resolve({
          deletedAt: null,
          id: "rice",
          organizationId: "org-1"
        });
      }
    },
    unknownBarcodeRepository: {
      createUnknownBarcode(draft: UnknownBarcodeDraft) {
        return Promise.resolve({
          ...draft,
          createdAt: draft.firstSeenAt,
          id: draft.clientId,
          updatedAt: draft.firstSeenAt
        });
      },
      findPendingUnknownBarcodeByBarcode() {
        return Promise.resolve(null);
      },
      findUnknownBarcodeById() {
        return Promise.resolve(null);
      },
      listUnknownBarcodes(_query: UnknownBarcodeQuery) {
        return Promise.resolve([] satisfies UnknownBarcodeRecord[]);
      },
      updateUnknownBarcode(record: UnknownBarcodeRecord) {
        return Promise.resolve(record);
      }
    }
  };
}

describe("inventory service factory integration", () => {
  it("creates a service bundle from repository adapters without Supabase access in consumers", async () => {
    const repositories = createRepositoryAdapters();
    const services = createInventoryServiceBundle({ repositories });

    const lookup = await services.barcodeLookup.lookupBarcode("org-1", {
      format: "upc_a",
      rawValue: "036000291452"
    });
    const balances = await services.visibility.getVisibleBalances({
      organizationId: "org-1",
      templeId: "temple-1"
    });

    assert.equal(lookup.status, "found");
    assert.deepEqual(balances, []);
    assert.equal(services.cameraScanning, null);
    assert.equal(repositories.transactionScopes.length, 1);
  });

  it("validates receiving references through active catalog adapters before persistence", async () => {
    const repositories = createRepositoryAdapters({
      items: [
        {
          barcodes: [],
          defaultUnit: "kg",
          deletedAt: null,
          id: "rice",
          name: "Rice",
          organizationId: "org-1",
          receivingUnits: ["kg"]
        },
        {
          barcodes: [],
          defaultUnit: "kg",
          deletedAt: "2026-06-01T00:00:00.000Z",
          id: "archived-rice",
          name: "Archived Rice",
          organizationId: "org-1",
          receivingUnits: ["kg"]
        }
      ],
      locations: [
        {
          deletedAt: null,
          id: "pantry",
          name: "Pantry",
          organizationId: "org-1",
          templeId: "temple-1"
        },
        {
          deletedAt: null,
          id: "other-pantry",
          name: "Other Pantry",
          organizationId: "org-1",
          templeId: "temple-2"
        }
      ]
    });
    const services = createInventoryServiceBundle({ repositories });

    await services.inventory.receiveInventory({
      actor: {
        type: "user",
        userId: "volunteer-1"
      },
      itemId: "rice",
      locationId: "pantry",
      organizationId: "org-1",
      quantity: 5,
      templeId: "temple-1",
      unit: "kg"
    });

    await assert.rejects(
      () =>
        services.inventory.receiveInventory({
          actor: {
            type: "user",
            userId: "volunteer-1"
          },
          itemId: "archived-rice",
          locationId: "pantry",
          organizationId: "org-1",
          quantity: 5,
          templeId: "temple-1",
          unit: "kg"
        }),
      /Receiving item was not found/
    );
    await assert.rejects(
      () =>
        services.inventory.receiveInventory({
          actor: {
            type: "user",
            userId: "volunteer-1"
          },
          itemId: "rice",
          locationId: "other-pantry",
          organizationId: "org-1",
          quantity: 5,
          templeId: "temple-1",
          unit: "kg"
        }),
      /Receiving location was not found/
    );

    assert.equal(repositories.receivedDrafts.length, 1);
  });

  it("validates consumption references and availability through factory-wired adapters", async () => {
    const repositories = createRepositoryAdapters({
      items: [
        {
          barcodes: [],
          consumptionUnits: ["kg"],
          defaultUnit: "kg",
          deletedAt: null,
          id: "rice",
          name: "Rice",
          organizationId: "org-1"
        }
      ],
      locations: [
        {
          deletedAt: null,
          id: "pantry",
          name: "Pantry",
          organizationId: "org-1",
          templeId: "temple-1"
        }
      ]
    });
    const consumedDrafts: InventoryTransactionDraft[] = [];
    repositories.transactionRepository.createTransaction = (draft) => {
      consumedDrafts.push(draft);

      return Promise.resolve({
        ...draft,
        createdAt: "2026-06-04T08:00:00.000Z",
        id: draft.clientId
      });
    };
    repositories.transactionRepository.listTransactions = (scope) => {
      repositories.transactionScopes.push(scope);

      return Promise.resolve([
        {
          actor: {
            type: "user",
            userId: "volunteer-1"
          },
          auditMetadata: {},
          createdAt: "2026-06-04T07:00:00.000Z",
          destinationLocationId: "pantry",
          id: "received-1",
          itemId: "rice",
          notes: null,
          organizationId: "org-1",
          quantity: 10,
          quantityEffect: "increase",
          reversalOfTransactionId: null,
          sourceLocationId: null,
          templeId: "temple-1",
          transactionType: "received",
          unit: "kg"
        }
      ] satisfies InventoryTransaction[]);
    };
    const services = createInventoryServiceBundle({ repositories });

    const transaction = await services.inventory.consumeInventory({
      actor: {
        type: "user",
        userId: "volunteer-1"
      },
      itemId: "rice",
      locationId: "pantry",
      organizationId: "org-1",
      quantity: 4,
      templeId: "temple-1",
      unit: "kg"
    });

    assert.equal(transaction.transactionType, "consumed");
    assert.equal(consumedDrafts.length, 1);
    assert.equal(consumedDrafts[0]?.sourceLocationId, "pantry");
    assert.equal(repositories.transactionScopes[0]?.locationId, "pantry");
  });

  it("resolves inventory actors from authenticated and temporary auth state", () => {
    const userActor = resolveInventoryActor({
      isTemporaryVolunteer: false,
      profile: {
        email: "manager@example.com",
        id: "profile-1",
        authUserId: "auth-1",
        displayName: "Manager",
        organization: null,
        roles: [],
        temples: []
      },
      temporaryVolunteerSession: null
    });
    const temporaryActor = resolveInventoryActor({
      isTemporaryVolunteer: true,
      profile: null,
      temporaryVolunteerSession: {
        displayName: "Helper",
        expiresAt: "2026-06-04T12:00:00.000Z",
        id: "volunteer-session-1",
        organizationId: "org-1",
        startedAt: "2026-06-04T08:00:00.000Z",
        templeId: "temple-1"
      }
    });

    assert.deepEqual(userActor, {
      type: "user",
      userId: "profile-1"
    });
    assert.deepEqual(temporaryActor, {
      tempSessionId: "volunteer-session-1",
      type: "temporary_volunteer"
    });
  });

  it("maps inventory permissions to UI-ready flags", () => {
    const flags = getInventoryPermissionFlags([
      "inventory.read",
      "inventory.receive",
      "inventory.consume",
      "inventory.transfer",
      "items.create",
      "locations.edit"
    ]);

    assert.equal(flags.canReadInventory, true);
    assert.equal(flags.canReceiveInventory, true);
    assert.equal(flags.canConsumeInventory, true);
    assert.equal(flags.canTransferInventory, true);
    assert.equal(flags.canReturnInventory, false);
    assert.equal(flags.canCreateItems, true);
    assert.equal(flags.canManageLocations, true);
  });
});
