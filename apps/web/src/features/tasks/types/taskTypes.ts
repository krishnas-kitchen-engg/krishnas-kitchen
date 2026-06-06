import type { InventoryLowStockAlert, UnknownBarcodeRecord } from "@/domains/inventory";

export type VolunteerTaskCategory =
  | "all"
  | "follow_up"
  | "inventory_exception"
  | "low_stock"
  | "unknown_barcode";

export type VolunteerTaskPriority = "attention" | "normal";

export type BaseVolunteerTask = {
  category: Exclude<VolunteerTaskCategory, "all">;
  description: string;
  id: string;
  priority: VolunteerTaskPriority;
  templeId?: string | undefined;
  title: string;
};

export type UnknownBarcodeReviewTask = BaseVolunteerTask & {
  barcodeLabel: string;
  category: "unknown_barcode";
  scanCount: number;
  unknownBarcodeId: string;
};

export type LowStockReviewTask = BaseVolunteerTask & {
  category: "low_stock";
  currentQuantity: number;
  itemId: string;
  locationId?: string | undefined;
  minimumQuantity: number;
  unit: string;
};

export type InventoryExceptionTask = BaseVolunteerTask & {
  category: "inventory_exception";
};

export type OperationalFollowUpTask = BaseVolunteerTask & {
  category: "follow_up";
};

export type VolunteerTask =
  | InventoryExceptionTask
  | LowStockReviewTask
  | OperationalFollowUpTask
  | UnknownBarcodeReviewTask;

export type VolunteerTaskSection<T extends VolunteerTask = VolunteerTask> = {
  error: string | null;
  items: readonly T[];
  status: "loaded" | "unavailable";
};

export type VolunteerTasksState = {
  isLoading: boolean;
  lowStock: VolunteerTaskSection<LowStockReviewTask>;
  selectedCategory: VolunteerTaskCategory;
  unknownBarcodes: VolunteerTaskSection<UnknownBarcodeReviewTask>;
};

export type VolunteerTaskProjectionInput = {
  lowStockAlerts: readonly InventoryLowStockAlert[];
  unknownBarcodes: readonly UnknownBarcodeRecord[];
};
