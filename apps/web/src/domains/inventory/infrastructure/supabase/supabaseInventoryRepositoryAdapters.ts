import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@krishnas-kitchen/types";

import type { InventoryRepositoryAdapters } from "../../integration/inventoryServiceFactory";

import { createSupabaseInventoryCatalogRepositories } from "./supabaseInventoryCatalogRepository";
import { createSupabaseInventoryTransactionRepository } from "./supabaseInventoryTransactionRepository";
import { createSupabaseUnknownBarcodeRepository } from "./supabaseUnknownBarcodeRepository";

export class UnsupportedInventoryRepositoryAdapterError extends Error {
  readonly adapter: string;

  constructor(adapter: string) {
    super(`${adapter} Supabase adapter is not implemented yet.`);
    this.name = "UnsupportedInventoryRepositoryAdapterError";
    this.adapter = adapter;
  }
}

export function createSupabaseInventoryRepositoryAdapters(
  client: SupabaseClient<Database>
): InventoryRepositoryAdapters {
  const catalogRepositories = createSupabaseInventoryCatalogRepositories(client);

  return {
    barcodeCatalogItemRepository: catalogRepositories.barcodeCatalogItemRepository,
    barcodeCatalogRepository: catalogRepositories.barcodeCatalogRepository,
    barcodeLookupRepository: catalogRepositories.barcodeLookupRepository,
    catalogQueryRepository: catalogRepositories.catalogQueryRepository,
    transactionRepository: createSupabaseInventoryTransactionRepository(client),
    unknownBarcodeItemRepository: catalogRepositories.unknownBarcodeItemRepository,
    unknownBarcodeRepository: createSupabaseUnknownBarcodeRepository(client)
  };
}
