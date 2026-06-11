import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@krishnas-kitchen/types";

import type { InventoryRepositoryAdapters } from "../../integration/inventoryServiceFactory";

import { createSupabaseInventoryCatalogRepositories } from "./supabaseInventoryCatalogRepository";
import { createSupabaseInventoryTransactionRepository } from "./supabaseInventoryTransactionRepository";
import { createSupabaseLowStockThresholdRepository } from "./supabaseLowStockThresholdRepository";
import { createSupabaseUnknownBarcodeRepository } from "./supabaseUnknownBarcodeRepository";
import {
  createSupabaseVolunteerInventoryReadRepositories,
  type VolunteerInventoryReadSession
} from "./supabaseVolunteerInventoryReadRepositories";

export class UnsupportedInventoryRepositoryAdapterError extends Error {
  readonly adapter: string;

  constructor(adapter: string) {
    super(`${adapter} Supabase adapter is not implemented yet.`);
    this.name = "UnsupportedInventoryRepositoryAdapterError";
    this.adapter = adapter;
  }
}

export function createSupabaseInventoryRepositoryAdapters(
  client: SupabaseClient<Database>,
  options: {
    volunteerReadSession?: VolunteerInventoryReadSession | null;
  } = {}
): InventoryRepositoryAdapters {
  const catalogRepositories = createSupabaseInventoryCatalogRepositories(client);
  const transactionRepository = createSupabaseInventoryTransactionRepository(client);
  const lowStockThresholdRepository = createSupabaseLowStockThresholdRepository(client);
  const unknownBarcodeRepository = createSupabaseUnknownBarcodeRepository(client);
  const volunteerReadRepositories = options.volunteerReadSession
    ? createSupabaseVolunteerInventoryReadRepositories(client, options.volunteerReadSession, {
        barcodeLookupRepository: catalogRepositories.barcodeLookupRepository,
        catalogQueryRepository: catalogRepositories.catalogQueryRepository,
        lowStockThresholdRepository,
        transactionRepository,
        unknownBarcodeRepository
      })
    : null;

  return {
    barcodeCatalogItemRepository: catalogRepositories.barcodeCatalogItemRepository,
    barcodeCatalogRepository: catalogRepositories.barcodeCatalogRepository,
    barcodeLookupRepository:
      volunteerReadRepositories?.barcodeLookupRepository ??
      catalogRepositories.barcodeLookupRepository,
    catalogQueryRepository:
      volunteerReadRepositories?.catalogQueryRepository ??
      catalogRepositories.catalogQueryRepository,
    lowStockThresholdRepository:
      volunteerReadRepositories?.lowStockThresholdRepository ?? lowStockThresholdRepository,
    transactionRepository:
      volunteerReadRepositories?.transactionRepository ?? transactionRepository,
    unknownBarcodeItemRepository: catalogRepositories.unknownBarcodeItemRepository,
    unknownBarcodeRepository:
      volunteerReadRepositories?.unknownBarcodeRepository ?? unknownBarcodeRepository
  };
}
