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

function createRepositoryAdapters(): InventoryRepositoryAdapters & {
  transactionScopes: InventoryTransactionScope[];
} {
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
        return Promise.resolve([] satisfies InventoryCatalogItem[]);
      },
      listLocations() {
        return Promise.resolve([] satisfies InventoryCatalogLocation[]);
      }
    },
    lowStockThresholdRepository: {
      listActiveLowStockThresholds() {
        return Promise.resolve([]);
      }
    },
    transactionRepository: {
      createReceivingTransaction(_draft: ReceivingInventoryTransactionDraft) {
        throw new Error("Factory test should not create receiving transactions.");
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
        id: "temp-1",
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
      tempSessionId: "temp-1",
      type: "temporary_volunteer"
    });
  });

  it("maps inventory permissions to UI-ready flags", () => {
    const flags = getInventoryPermissionFlags([
      "inventory.read",
      "inventory.receive",
      "inventory.transfer",
      "items.create",
      "locations.edit"
    ]);

    assert.equal(flags.canReadInventory, true);
    assert.equal(flags.canReceiveInventory, true);
    assert.equal(flags.canTransferInventory, true);
    assert.equal(flags.canReturnInventory, false);
    assert.equal(flags.canCreateItems, true);
    assert.equal(flags.canManageLocations, true);
  });
});
