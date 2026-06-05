import type {
  InventoryBalance,
  InventoryBarcodeFormat,
  InventoryCatalogItem,
  InventoryCatalogLocation,
  InventoryTransaction,
  TransferResolvedItem
} from "@/domains/inventory";
import type { ItemUnit } from "@krishnas-kitchen/types";

export type TransferWorkflowStep =
  | "select_item"
  | "select_locations"
  | "enter_quantity"
  | "confirm"
  | "success";

export type TransferBarcodeStatus =
  | "ambiguous"
  | "found"
  | "idle"
  | "invalid"
  | "loading"
  | "unknown";

export type TransferWorkflowValidationErrors = Partial<
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

export type TransferWorkflowUiState = {
  availableUnits: readonly ItemUnit[];
  barcode: {
    error: string | null;
    format: InventoryBarcodeFormat | "";
    rawValue: string;
    status: TransferBarcodeStatus;
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
  resolvedItem: TransferResolvedItem | null;
  sourceBalances: readonly InventoryBalance[];
  sourceLocationId: string;
  step: TransferWorkflowStep;
  transferTransaction: InventoryTransaction | null;
  unit: ItemUnit | "";
  validationErrors: TransferWorkflowValidationErrors;
};

export type TransferCatalogOptionsState = {
  error: string | null;
  isLoading: boolean;
  items: readonly InventoryCatalogItem[];
  locations: readonly InventoryCatalogLocation[];
};

export type TransferWorkflowSubmitInput = {
  clientRequestId?: string;
};
