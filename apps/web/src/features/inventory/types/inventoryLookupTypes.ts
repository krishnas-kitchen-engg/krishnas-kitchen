import type {
  InventoryBalance,
  InventoryCatalogBarcode,
  InventoryCatalogItem,
  InventoryCatalogLocation,
  InventoryTransaction
} from "@/domains/inventory";

export type InventoryLookupMode = "barcodes" | "items" | "locations";

export type InventoryLookupState = {
  barcodes: InventoryCatalogBarcode[];
  error: string | null;
  isLoading: boolean;
  items: InventoryCatalogItem[];
  locations: InventoryCatalogLocation[];
  mode: InventoryLookupMode;
  searchText: string;
};

export type InventoryItemDetailState = {
  balances: InventoryBalance[];
  error: string | null;
  isLoading: boolean;
  item: InventoryCatalogItem | null;
  transactions: InventoryTransaction[];
};

export type InventoryLocationDetailState = {
  balances: InventoryBalance[];
  error: string | null;
  isLoading: boolean;
  location: InventoryCatalogLocation | null;
  transactions: InventoryTransaction[];
};
