import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, EntityId } from "@krishnas-kitchen/types";

import type {
  InventoryBarcodeCatalogItemRepository,
  InventoryBarcodeCatalogRepository
} from "../../application/barcodeCatalogService";
import type { InventoryBarcodeLookupRepository } from "../../application/barcodeLookupService";
import type { InventoryCatalogQueryRepository } from "../../application/inventoryCatalogQueryService";
import type {
  UnknownBarcodeItemRepository,
  UnknownBarcodeRepository
} from "../../application/unknownBarcodeService";
import type { InventoryBarcode } from "../../domain/barcode";
import type {
  InventoryBarcodeCatalogItemReference,
  InventoryBarcodeMapping,
  InventoryBarcodeMappingDraft
} from "../../domain/barcodeCatalog";
import type {
  InventoryCatalogBarcode,
  InventoryCatalogItem,
  InventoryCatalogLocation
} from "../../domain/catalog";
import type {
  UnknownBarcodeDraft,
  UnknownBarcodeItemReference,
  UnknownBarcodeQuery,
  UnknownBarcodeRecord
} from "../../domain/unknownBarcode";
import type { InventoryRepositoryAdapters } from "../../integration/inventoryServiceFactory";

import { createSupabaseInventoryTransactionRepository } from "./supabaseInventoryTransactionRepository";

export class UnsupportedInventoryRepositoryAdapterError extends Error {
  readonly adapter: string;

  constructor(adapter: string) {
    super(`${adapter} Supabase adapter is not implemented yet.`);
    this.name = "UnsupportedInventoryRepositoryAdapterError";
    this.adapter = adapter;
  }
}

function unsupported<T>(adapter: string): Promise<T> {
  return Promise.reject(new UnsupportedInventoryRepositoryAdapterError(adapter));
}

export function createSupabaseInventoryRepositoryAdapters(
  client: SupabaseClient<Database>
): InventoryRepositoryAdapters {
  const barcodeLookupRepository: InventoryBarcodeLookupRepository = {
    findItemsByBarcode(_organizationId: EntityId, _barcode: InventoryBarcode) {
      return unsupported<readonly InventoryCatalogItem[]>("inventory_barcode_lookup");
    }
  };
  const catalogQueryRepository: InventoryCatalogQueryRepository = {
    listBarcodes(_organizationId: EntityId) {
      return unsupported<readonly InventoryCatalogBarcode[]>("inventory_catalog_barcodes");
    },
    listItems(_organizationId: EntityId) {
      return unsupported<readonly InventoryCatalogItem[]>("inventory_catalog_items");
    },
    listLocations(_organizationId: EntityId) {
      return unsupported<readonly InventoryCatalogLocation[]>("inventory_catalog_locations");
    }
  };
  const barcodeCatalogRepository: InventoryBarcodeCatalogRepository = {
    archiveBarcodeMapping(_mapping: InventoryBarcodeMapping) {
      return unsupported<InventoryBarcodeMapping>("inventory_barcode_mapping_archive");
    },
    createBarcodeMapping(_draft: InventoryBarcodeMappingDraft) {
      return unsupported<InventoryBarcodeMapping>("inventory_barcode_mapping_create");
    },
    findActiveBarcodeMappingByBarcode(_organizationId: EntityId, _barcode: InventoryBarcode) {
      return unsupported<InventoryBarcodeMapping | null>("inventory_barcode_mapping_active_lookup");
    },
    findBarcodeMappingById(_id: EntityId) {
      return unsupported<InventoryBarcodeMapping | null>("inventory_barcode_mapping_by_id");
    },
    listBarcodeMappings(_organizationId: EntityId) {
      return unsupported<readonly InventoryBarcodeMapping[]>("inventory_barcode_mapping_list");
    }
  };
  const barcodeCatalogItemRepository: InventoryBarcodeCatalogItemRepository = {
    findBarcodeCatalogItem(_itemId: EntityId, _organizationId: EntityId) {
      return unsupported<InventoryBarcodeCatalogItemReference | null>(
        "inventory_barcode_catalog_item"
      );
    }
  };
  const unknownBarcodeRepository: UnknownBarcodeRepository = {
    createUnknownBarcode(_draft: UnknownBarcodeDraft) {
      return unsupported<UnknownBarcodeRecord>("unknown_barcode_create");
    },
    findPendingUnknownBarcodeByBarcode(_organizationId: EntityId, _barcode: InventoryBarcode) {
      return unsupported<UnknownBarcodeRecord | null>("unknown_barcode_pending_lookup");
    },
    findUnknownBarcodeById(_id: EntityId) {
      return unsupported<UnknownBarcodeRecord | null>("unknown_barcode_by_id");
    },
    listUnknownBarcodes(_query: UnknownBarcodeQuery) {
      return unsupported<readonly UnknownBarcodeRecord[]>("unknown_barcode_list");
    },
    updateUnknownBarcode(_record: UnknownBarcodeRecord) {
      return unsupported<UnknownBarcodeRecord>("unknown_barcode_update");
    }
  };
  const unknownBarcodeItemRepository: UnknownBarcodeItemRepository = {
    findItemForBarcodeLinking(_itemId: EntityId, _organizationId: EntityId) {
      return unsupported<UnknownBarcodeItemReference | null>("unknown_barcode_item_linking");
    }
  };

  return {
    barcodeCatalogItemRepository,
    barcodeCatalogRepository,
    barcodeLookupRepository,
    catalogQueryRepository,
    transactionRepository: createSupabaseInventoryTransactionRepository(client),
    unknownBarcodeItemRepository,
    unknownBarcodeRepository
  };
}
