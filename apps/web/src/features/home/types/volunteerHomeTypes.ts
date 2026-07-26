import type { AppPath } from "@/app/routes/router";
import type { InventoryLowStockAlert, UnknownBarcodeRecord } from "@/domains/inventory";

export type VolunteerHomeQuickAction = {
  label: string;
  path: AppPath;
  requiredPermission:
    | "inventory.adjust"
    | "inventory.consume"
    | "inventory.read"
    | "inventory.receive"
    | "inventory.return"
    | "inventory.transfer"
    | "items.edit"
    | "recipes.read";
};

export type VolunteerHomeActivityItem = {
  description: string;
  id: string;
  timestamp: string;
};

export type VolunteerHomeSectionState<T> = {
  error: string | null;
  items: readonly T[];
  status: "loaded" | "unavailable";
};

export type VolunteerHomeSummaryState = {
  isLoading: boolean;
  lowStock: VolunteerHomeSectionState<InventoryLowStockAlert>;
  pendingUnknownBarcodes: VolunteerHomeSectionState<UnknownBarcodeRecord>;
  recentActivity: VolunteerHomeSectionState<VolunteerHomeActivityItem>;
};
