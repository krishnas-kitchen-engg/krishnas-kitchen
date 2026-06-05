import type {
  InventoryBalance,
  InventoryBarcodeFormat,
  InventoryCatalogItem,
  InventoryCatalogLocation,
  InventoryTransaction,
  ReturnResolvedItem
} from "@/domains/inventory";
import type { ItemUnit } from "@krishnas-kitchen/types";

export type ReturnWorkflowStep =
  | "select_item"
  | "select_locations"
  | "enter_quantity"
  | "confirm"
  | "success";

export type ReturnBarcodeStatus =
  | "ambiguous"
  | "found"
  | "idle"
  | "invalid"
  | "loading"
  | "unknown";

export type ReturnWorkflowValidationErrors = Partial<
  Record<
    | "actor"
    | "destinationLocationId"
    | "item"
    | "permission"
    | "quantity"
    | "sameLocation"
    | "sourceLocationId"
    | "unit",
    string
  >
>;

export type ReturnWorkflowUiState = {
  availableUnits: readonly ItemUnit[];
  barcode: {
    error: string | null;
    format: InventoryBarcodeFormat | "";
    rawValue: string;
    status: ReturnBarcodeStatus;
  };
  destinationBalances: readonly InventoryBalance[];
  destinationLocationId: string;
  error: string | null;
  isSubmitting: boolean;
  manualSearchText: string;
  notes: string;
  quantityText: string;
  recentDestinationLocationTransactions: readonly InventoryTransaction[];
  recentItemTransactions: readonly InventoryTransaction[];
  recentSourceLocationTransactions: readonly InventoryTransaction[];
  resolvedItem: ReturnResolvedItem | null;
  returnedTransaction: InventoryTransaction | null;
  sourceBalances: readonly InventoryBalance[];
  sourceLocationId: string;
  step: ReturnWorkflowStep;
  unit: ItemUnit | "";
  validationErrors: ReturnWorkflowValidationErrors;
};

export type ReturnCatalogOptionsState = {
  error: string | null;
  isLoading: boolean;
  items: readonly InventoryCatalogItem[];
  locations: readonly InventoryCatalogLocation[];
};

export type ReturnWorkflowSubmitInput = {
  clientRequestId?: string;
};
