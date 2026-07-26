import type {
  ConsumptionResolvedItem,
  InventoryBalance,
  InventoryBarcodeFormat,
  InventoryCatalogItem,
  InventoryCatalogLocation,
  InventoryTransaction
} from "@/domains/inventory";
import type { ItemUnit } from "@krishnas-kitchen/types";

export type ConsumeWorkflowStep =
  | "select_item"
  | "select_location"
  | "enter_quantity"
  | "confirm"
  | "success";

export type ConsumeBarcodeStatus =
  | "ambiguous"
  | "found"
  | "idle"
  | "invalid"
  | "loading"
  | "unknown";

export type ConsumeWorkflowValidationErrors = Partial<
  Record<"actor" | "item" | "locationId" | "permission" | "quantity" | "unit", string>
>;

export type ConsumeWorkflowUiState = {
  availableUnits: readonly ItemUnit[];
  barcode: {
    error: string | null;
    format: InventoryBarcodeFormat | "";
    rawValue: string;
    status: ConsumeBarcodeStatus;
  };
  consumedTransaction: InventoryTransaction | null;
  error: string | null;
  isSubmitting: boolean;
  locationBalances: readonly InventoryBalance[];
  locationId: string;
  manualSearchText: string;
  notes: string;
  quantityText: string;
  recentItemTransactions: readonly InventoryTransaction[];
  recentLocationTransactions: readonly InventoryTransaction[];
  resolvedItem: ConsumptionResolvedItem | null;
  step: ConsumeWorkflowStep;
  unit: ItemUnit | "";
  validationErrors: ConsumeWorkflowValidationErrors;
};

export type ConsumeCatalogOptionsState = {
  error: string | null;
  isLoading: boolean;
  items: readonly InventoryCatalogItem[];
  locations: readonly InventoryCatalogLocation[];
};

export type ConsumeWorkflowSubmitInput = {
  clientRequestId?: string;
};
