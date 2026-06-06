import type { GenericScanWorkflowState } from "../types/scanWorkflowUiTypes";
import { ScanAmbiguousBarcodeCard } from "./ScanAmbiguousBarcodeCard";
import { ScanDuplicateCard } from "./ScanDuplicateCard";
import { ScanInvalidBarcodeCard } from "./ScanInvalidBarcodeCard";
import { ScanResolvedItemCard } from "./ScanResolvedItemCard";
import { ScanUnknownBarcodeCard } from "./ScanUnknownBarcodeCard";

type ScanResultPanelProps = {
  state: GenericScanWorkflowState;
};

export function ScanResultPanel({ state }: ScanResultPanelProps) {
  if (state.barcode.status === "found" && state.resolvedItem) {
    return <ScanResolvedItemCard item={state.resolvedItem} sourceLabel="Barcode item" />;
  }

  if (state.barcode.status === "manual_selected" && state.resolvedItem) {
    return <ScanResolvedItemCard item={state.resolvedItem} sourceLabel="Manual item" />;
  }

  if (state.barcode.status === "unknown" || state.barcode.status === "record_unknown_failed") {
    return (
      <ScanUnknownBarcodeCard
        barcode={state.lastBarcode}
        persistenceError={state.unknownBarcodePersistenceError}
        record={state.unknownBarcode}
      />
    );
  }

  if (state.barcode.status === "ambiguous") {
    return <ScanAmbiguousBarcodeCard items={state.ambiguousItems} />;
  }

  if (state.barcode.status === "duplicate") {
    return <ScanDuplicateCard duplicateOf={state.duplicateOf} />;
  }

  if (state.barcode.status === "invalid") {
    return <ScanInvalidBarcodeCard error={state.barcode.error} />;
  }

  return null;
}
