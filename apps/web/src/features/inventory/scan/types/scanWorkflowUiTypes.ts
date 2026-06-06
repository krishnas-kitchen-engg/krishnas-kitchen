import type {
  InventoryBarcode,
  InventoryBarcodeFormat,
  InventoryBarcodeItemReference,
  InventoryBarcodeScanEvent,
  InventoryCatalogItem,
  UnknownBarcodeRecord
} from "@/domains/inventory";

export type GenericScanStep = "manual_search" | "result" | "scan_entry";

export type GenericScanOutcome =
  | "ambiguous"
  | "duplicate"
  | "found"
  | "idle"
  | "invalid"
  | "loading"
  | "manual_selected"
  | "record_unknown_failed"
  | "unknown";

export type GenericScanWorkflowState = {
  ambiguousItems: readonly InventoryBarcodeItemReference[];
  barcode: {
    error: string | null;
    format: InventoryBarcodeFormat | "";
    rawValue: string;
    status: GenericScanOutcome;
  };
  duplicateOf: InventoryBarcodeScanEvent | null;
  error: string | null;
  lastBarcode: InventoryBarcode | null;
  manualSearchText: string;
  recentScans: readonly InventoryBarcodeScanEvent[];
  resolvedItem: InventoryBarcodeItemReference | InventoryCatalogItem | null;
  step: GenericScanStep;
  unknownBarcode: UnknownBarcodeRecord | null;
  unknownBarcodePersistenceError: string | null;
};
