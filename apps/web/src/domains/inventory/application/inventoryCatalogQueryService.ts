import type { EntityId } from "@krishnas-kitchen/types";

import {
  filterActiveCatalogItems,
  filterActiveCatalogLocations,
  filterCatalogBarcodes,
  rankFrequentlyUsedLocations,
  rankRecentItems,
  type InventoryCatalogBarcode,
  type InventoryCatalogItem,
  type InventoryCatalogLocation,
  type InventoryCatalogLocationQuery,
  type InventoryCatalogSearchQuery,
  type InventoryCatalogUsageQuery,
  type InventoryFrequentLocation,
  type InventoryRecentItem
} from "../domain/catalog";
import type { InventoryTransactionRepository } from "./inventoryRepository";

export type InventoryCatalogQueryRepository = {
  listBarcodes: (organizationId: EntityId) => Promise<readonly InventoryCatalogBarcode[]>;
  listItems: (organizationId: EntityId) => Promise<readonly InventoryCatalogItem[]>;
  listLocations: (organizationId: EntityId) => Promise<readonly InventoryCatalogLocation[]>;
};

export type InventoryCatalogQueryService = {
  findItemById: (
    organizationId: EntityId,
    itemId: EntityId
  ) => Promise<InventoryCatalogItem | null>;
  findLocationById: (
    organizationId: EntityId,
    templeId: EntityId,
    locationId: EntityId
  ) => Promise<InventoryCatalogLocation | null>;
  listActiveLocations: (
    query: InventoryCatalogLocationQuery
  ) => Promise<InventoryCatalogLocation[]>;
  listFrequentlyUsedLocations: (
    query: InventoryCatalogUsageQuery
  ) => Promise<InventoryFrequentLocation[]>;
  listRecentItems: (query: InventoryCatalogUsageQuery) => Promise<InventoryRecentItem[]>;
  searchBarcodes: (query: InventoryCatalogSearchQuery) => Promise<InventoryCatalogBarcode[]>;
  searchItems: (query: InventoryCatalogSearchQuery) => Promise<InventoryCatalogItem[]>;
  searchLocations: (query: InventoryCatalogLocationQuery) => Promise<InventoryCatalogLocation[]>;
};

export function createInventoryCatalogQueryService(options: {
  catalogRepository: InventoryCatalogQueryRepository;
  transactionRepository: InventoryTransactionRepository;
}): InventoryCatalogQueryService {
  return {
    async findItemById(organizationId, itemId) {
      const items = await options.catalogRepository.listItems(organizationId);

      return (
        filterActiveCatalogItems(items, {
          organizationId
        }).find((item) => item.id === itemId) ?? null
      );
    },

    async findLocationById(organizationId, templeId, locationId) {
      const locations = await options.catalogRepository.listLocations(organizationId);

      return (
        filterActiveCatalogLocations(locations, {
          organizationId,
          templeId
        }).find((location) => location.id === locationId) ?? null
      );
    },

    async listActiveLocations(query) {
      const locations = await options.catalogRepository.listLocations(query.organizationId);

      return filterActiveCatalogLocations(locations, query);
    },

    async listFrequentlyUsedLocations(query) {
      const [locations, transactions] = await Promise.all([
        options.catalogRepository.listLocations(query.organizationId),
        options.transactionRepository.listTransactions({
          organizationId: query.organizationId,
          ...(query.templeId ? { templeId: query.templeId } : {})
        })
      ]);
      const usageCounts = new Map<EntityId, number>();

      for (const transaction of transactions) {
        for (const locationId of [
          transaction.sourceLocationId,
          transaction.destinationLocationId
        ]) {
          if (locationId) {
            usageCounts.set(locationId, (usageCounts.get(locationId) ?? 0) + 1);
          }
        }
      }

      return rankFrequentlyUsedLocations(locations, usageCounts, query);
    },

    async listRecentItems(query) {
      const [items, transactions] = await Promise.all([
        options.catalogRepository.listItems(query.organizationId),
        options.transactionRepository.listTransactions({
          organizationId: query.organizationId,
          ...(query.templeId ? { templeId: query.templeId } : {})
        })
      ]);
      const seenItemIds = new Set<EntityId>();
      const recentItemEvents = transactions
        .filter(
          (transaction) =>
            transaction.organizationId === query.organizationId &&
            (!query.templeId || transaction.templeId === query.templeId)
        )
        .sort(
          (left, right) =>
            right.createdAt.localeCompare(left.createdAt) || right.id.localeCompare(left.id)
        )
        .flatMap((transaction) => {
          if (seenItemIds.has(transaction.itemId)) {
            return [];
          }

          seenItemIds.add(transaction.itemId);

          return [
            {
              itemId: transaction.itemId,
              lastTransactionAt: transaction.createdAt,
              lastTransactionId: transaction.id
            }
          ];
        });

      return rankRecentItems(items, recentItemEvents, query);
    },

    async searchBarcodes(query) {
      const barcodes = await options.catalogRepository.listBarcodes(query.organizationId);

      return filterCatalogBarcodes(barcodes, query);
    },

    async searchItems(query) {
      const items = await options.catalogRepository.listItems(query.organizationId);

      return filterActiveCatalogItems(items, query);
    },

    async searchLocations(query) {
      const locations = await options.catalogRepository.listLocations(query.organizationId);

      return filterActiveCatalogLocations(locations, query);
    }
  };
}
