import type {
  InventoryCatalogItem,
  InventoryCatalogLocation,
  InventoryLowStockAlert
} from "@/domains/inventory";

export type LowStockCenterStatusFilter = "all" | "low" | "out";

export type LowStockCenterItemStatus = "low" | "out";

export type LowStockCenterItem = InventoryLowStockAlert & {
  itemName: string;
  locationName: string;
  status: LowStockCenterItemStatus;
};

export type LowStockCenterFilters = {
  locationId: string;
  searchText: string;
  status: LowStockCenterStatusFilter;
};

export type LowStockCenterState = {
  error: string | null;
  filters: LowStockCenterFilters;
  isLoading: boolean;
  items: readonly LowStockCenterItem[];
  locations: readonly InventoryCatalogLocation[];
};

export type LowStockCenterLoaderInput = {
  alerts: readonly InventoryLowStockAlert[];
  filters: LowStockCenterFilters;
  items: readonly InventoryCatalogItem[];
  locations: readonly InventoryCatalogLocation[];
};
