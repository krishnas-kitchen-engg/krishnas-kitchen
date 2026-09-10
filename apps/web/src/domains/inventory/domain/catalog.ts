import type { EntityId, ItemUnit } from "@krishnas-kitchen/types";

import type { InventoryBarcode } from "./barcode";

export type InventoryCatalogItem = {
  barcodes: readonly InventoryBarcode[];
  category?: string | null;
  contentsLabel?: string | null;
  contentsQuantity?: number | null;
  contentsUnit?: ItemUnit | null;
  defaultUnit: ItemUnit;
  description?: string | null;
  deletedAt: string | null;
  handlingUnit?: ItemUnit | null;
  id: EntityId;
  name: string;
  organizationId: EntityId;
  packageDescription?: string | null;
  productName?: string | null;
  consumptionUnits?: readonly ItemUnit[];
  receivingUnits?: readonly ItemUnit[];
  returnUnits?: readonly ItemUnit[];
  transferUnits?: readonly ItemUnit[];
};

export type InventoryCatalogLocation = {
  description?: string | null;
  deletedAt: string | null;
  id: EntityId;
  name: string;
  organizationId: EntityId;
  templeId: EntityId;
};

export type InventoryCatalogBarcode = InventoryBarcode & {
  itemId: EntityId;
  itemName: string;
  organizationId: EntityId;
};

export type InventoryCatalogSearchQuery = {
  limit?: number;
  organizationId: EntityId;
  searchText?: string;
};

export type InventoryCatalogLocationQuery = InventoryCatalogSearchQuery & {
  templeId?: EntityId;
};

export type InventoryCatalogUsageQuery = {
  limit?: number;
  organizationId: EntityId;
  templeId?: EntityId;
};

export type InventoryFrequentLocation = InventoryCatalogLocation & {
  transactionCount: number;
};

export type InventoryRecentItem = InventoryCatalogItem & {
  lastTransactionAt: string;
  lastTransactionId: EntityId;
};

function normalizeSearchText(value: string | undefined): string {
  return value?.trim().toLocaleLowerCase() ?? "";
}

function compareText(left: string, right: string): number {
  return left.localeCompare(right, "en", { sensitivity: "base" });
}

function applyLimit<T>(values: T[], limit: number | undefined): T[] {
  return typeof limit === "number" ? values.slice(0, Math.max(limit, 0)) : values;
}

export function matchesCatalogSearch(value: string, searchText: string): boolean {
  return value.toLocaleLowerCase().includes(searchText);
}

export function filterActiveCatalogItems(
  items: readonly InventoryCatalogItem[],
  query: InventoryCatalogSearchQuery
): InventoryCatalogItem[] {
  const searchText = normalizeSearchText(query.searchText);
  const matchesSearch = (item: InventoryCatalogItem) =>
    !searchText ||
    matchesCatalogSearch(item.id, searchText) ||
    matchesCatalogSearch(item.name, searchText) ||
    (item.productName ? matchesCatalogSearch(item.productName, searchText) : false) ||
    (item.packageDescription ? matchesCatalogSearch(item.packageDescription, searchText) : false) ||
    item.barcodes.some(
      (barcode) =>
        matchesCatalogSearch(barcode.value, searchText) ||
        matchesCatalogSearch(barcode.format, searchText)
    );

  return applyLimit(
    items
      .filter(
        (item) =>
          item.organizationId === query.organizationId && !item.deletedAt && matchesSearch(item)
      )
      .sort((left, right) => compareText(left.name, right.name) || compareText(left.id, right.id)),
    query.limit
  );
}

export function filterActiveCatalogLocations(
  locations: readonly InventoryCatalogLocation[],
  query: InventoryCatalogLocationQuery
): InventoryCatalogLocation[] {
  const searchText = normalizeSearchText(query.searchText);
  const matchesSearch = (location: InventoryCatalogLocation) =>
    !searchText ||
    matchesCatalogSearch(location.id, searchText) ||
    matchesCatalogSearch(location.name, searchText);

  return applyLimit(
    locations
      .filter(
        (location) =>
          location.organizationId === query.organizationId &&
          (!query.templeId || location.templeId === query.templeId) &&
          !location.deletedAt &&
          matchesSearch(location)
      )
      .sort((left, right) => compareText(left.name, right.name) || compareText(left.id, right.id)),
    query.limit
  );
}

export function filterCatalogBarcodes(
  barcodes: readonly InventoryCatalogBarcode[],
  query: InventoryCatalogSearchQuery
): InventoryCatalogBarcode[] {
  const searchText = normalizeSearchText(query.searchText);
  const matchesSearch = (barcode: InventoryCatalogBarcode) =>
    !searchText ||
    matchesCatalogSearch(barcode.value, searchText) ||
    matchesCatalogSearch(barcode.format, searchText) ||
    matchesCatalogSearch(barcode.itemId, searchText) ||
    matchesCatalogSearch(barcode.itemName, searchText);

  return applyLimit(
    barcodes
      .filter(
        (barcode) => barcode.organizationId === query.organizationId && matchesSearch(barcode)
      )
      .sort(
        (left, right) =>
          compareText(left.itemName, right.itemName) ||
          compareText(left.format, right.format) ||
          compareText(left.value, right.value) ||
          compareText(left.itemId, right.itemId)
      ),
    query.limit
  );
}

export function rankFrequentlyUsedLocations(
  locations: readonly InventoryCatalogLocation[],
  usageCounts: ReadonlyMap<EntityId, number>,
  query: InventoryCatalogUsageQuery
): InventoryFrequentLocation[] {
  const activeLocations = filterActiveCatalogLocations(locations, {
    organizationId: query.organizationId,
    ...(query.templeId ? { templeId: query.templeId } : {})
  });

  return applyLimit(
    activeLocations
      .map((location) => ({
        ...location,
        transactionCount: usageCounts.get(location.id) ?? 0
      }))
      .filter((location) => location.transactionCount > 0)
      .sort(
        (left, right) =>
          right.transactionCount - left.transactionCount ||
          compareText(left.name, right.name) ||
          compareText(left.id, right.id)
      ),
    query.limit
  );
}

export function rankRecentItems(
  items: readonly InventoryCatalogItem[],
  recentItemEvents: readonly {
    itemId: EntityId;
    lastTransactionAt: string;
    lastTransactionId: EntityId;
  }[],
  query: InventoryCatalogUsageQuery
): InventoryRecentItem[] {
  const activeItemsById = new Map(
    filterActiveCatalogItems(items, { organizationId: query.organizationId }).map((item) => [
      item.id,
      item
    ])
  );

  return applyLimit(
    recentItemEvents.flatMap((event) => {
      const item = activeItemsById.get(event.itemId);

      return item
        ? [
            {
              ...item,
              lastTransactionAt: event.lastTransactionAt,
              lastTransactionId: event.lastTransactionId
            }
          ]
        : [];
    }),
    query.limit
  );
}
