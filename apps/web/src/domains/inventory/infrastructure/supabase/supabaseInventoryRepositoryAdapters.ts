import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, EntityId } from "@krishnas-kitchen/types";

import type { UnknownBarcodeRepository } from "../../application/unknownBarcodeService";
import type { InventoryBarcode } from "../../domain/barcode";
import type {
  UnknownBarcodeDraft,
  UnknownBarcodeQuery,
  UnknownBarcodeRecord
} from "../../domain/unknownBarcode";
import type { InventoryRepositoryAdapters } from "../../integration/inventoryServiceFactory";

import { createSupabaseInventoryCatalogRepositories } from "./supabaseInventoryCatalogRepository";
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
  const catalogRepositories = createSupabaseInventoryCatalogRepositories(client);
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
  return {
    barcodeCatalogItemRepository: catalogRepositories.barcodeCatalogItemRepository,
    barcodeCatalogRepository: catalogRepositories.barcodeCatalogRepository,
    barcodeLookupRepository: catalogRepositories.barcodeLookupRepository,
    catalogQueryRepository: catalogRepositories.catalogQueryRepository,
    transactionRepository: createSupabaseInventoryTransactionRepository(client),
    unknownBarcodeItemRepository: catalogRepositories.unknownBarcodeItemRepository,
    unknownBarcodeRepository
  };
}
