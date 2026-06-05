import type {
  InventoryBalance,
  InventoryBarcodeFormat,
  InventoryCatalogItem,
  InventoryCatalogLocation,
  InventoryTransaction,
  ReceivingResolvedItem
} from "@/domains/inventory";
import type { ItemUnit } from "@krishnas-kitchen/types";

export type ReceiveWorkflowStep =
  | "select_item"
  | "enter_quantity"
  | "select_location"
  | "confirm"
  | "success";

export type ReceiveBarcodeStatus =
  | "ambiguous"
  | "found"
  | "idle"
  | "invalid"
  | "loading"
  | "unknown";

export type ReceiveWorkflowValidationErrors = Partial<
  Record<"actor" | "item" | "locationId" | "permission" | "quantity" | "unit", string>
>;

export type ReceiveWorkflowUiState = {
  availableUnits: readonly ItemUnit[];
  barcode: {
    error: string | null;
    format: InventoryBarcodeFormat | "";
    rawValue: string;
    status: ReceiveBarcodeStatus;
  };
  balances: readonly InventoryBalance[];
  error: string | null;
  isSubmitting: boolean;
  locationId: string;
  manualSearchText: string;
  notes: string;
  quantityText: string;
  recentTransactions: readonly InventoryTransaction[];
  receivedTransaction: InventoryTransaction | null;
  resolvedItem: ReceivingResolvedItem | null;
  step: ReceiveWorkflowStep;
  unit: ItemUnit | "";
  validationErrors: ReceiveWorkflowValidationErrors;
};

export type ReceiveCatalogOptionsState = {
  error: string | null;
  isLoading: boolean;
  items: readonly InventoryCatalogItem[];
  locations: readonly InventoryCatalogLocation[];
};

export type ReceiveWorkflowSubmitInput = {
  clientRequestId?: string;
};
