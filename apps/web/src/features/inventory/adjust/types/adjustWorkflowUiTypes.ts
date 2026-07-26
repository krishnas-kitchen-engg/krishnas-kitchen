import type {
  InventoryBalance,
  InventoryCatalogItem,
  InventoryCatalogLocation,
  InventoryTransaction
} from "@/domains/inventory";
import type { ItemUnit } from "@krishnas-kitchen/types";

export type AdjustWorkflowStep = "select_details" | "review" | "success";

export type AdjustWorkflowValidationErrors = Partial<
  Record<
    "actor" | "itemId" | "locationId" | "permission" | "physicalQuantity" | "reason" | "unit",
    string
  >
>;

export type AdjustWorkflowUiState = {
  adjustmentTransaction: InventoryTransaction | null;
  currentQuantity: number | null;
  error: string | null;
  isSubmitting: boolean;
  itemSearchText: string;
  items: readonly InventoryCatalogItem[];
  locationId: string;
  locations: readonly InventoryCatalogLocation[];
  noChangeRecorded: boolean;
  physicalQuantityText: string;
  reason: string;
  recentItemTransactions: readonly InventoryTransaction[];
  recentLocationTransactions: readonly InventoryTransaction[];
  selectedItemId: string;
  step: AdjustWorkflowStep;
  unit: ItemUnit | "";
  updatedBalances: readonly InventoryBalance[];
  validationErrors: AdjustWorkflowValidationErrors;
};
