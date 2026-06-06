import { RecentScansList } from "../components/RecentScansList";
import { ScanBarcodeEntry } from "../components/ScanBarcodeEntry";
import { ScanCameraPlaceholder } from "../components/ScanCameraPlaceholder";
import { ScanManualItemFallback } from "../components/ScanManualItemFallback";
import { ScanResultPanel } from "../components/ScanResultPanel";
import { useGenericScanWorkflow } from "../hooks/useGenericScanWorkflow";
import { useScanManualItemSearch } from "../hooks/useScanManualItemSearch";

function shouldShowManualFallback(status: string): boolean {
  return status === "ambiguous" || status === "record_unknown_failed" || status === "unknown";
}

export function ScanInventoryScreen() {
  const workflow = useGenericScanWorkflow();
  const { state } = workflow;
  const manualSearch = useScanManualItemSearch(state.manualSearchText);

  if (!workflow.canScanInventory) {
    return (
      <section className="rounded-md border border-stone-200 bg-white p-4">
        <h2 className="text-lg font-semibold text-stone-950">Scan unavailable</h2>
        <p className="mt-2 text-sm leading-6 text-stone-600">
          Your current session does not include inventory read permission.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div>
        <p className="text-sm font-semibold uppercase text-brand-800">Inventory scan</p>
        <h1 className="mt-1 text-2xl font-semibold text-stone-950">Identify item</h1>
      </div>

      {state.error ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-800">
          {state.error}
        </div>
      ) : null}

      <ScanBarcodeEntry
        error={state.barcode.error}
        format={state.barcode.format}
        isLoading={state.barcode.status === "loading"}
        onFormatChange={(format) => workflow.setBarcodeFormat(format)}
        onRawValueChange={(value) => workflow.setBarcodeRawValue(value)}
        onResolve={() => {
          void workflow.resolveBarcode();
        }}
        rawValue={state.barcode.rawValue}
      />

      <ScanCameraPlaceholder cameraAvailable={workflow.cameraAvailable} />

      {state.step === "result" ? <ScanResultPanel state={state} /> : null}

      {shouldShowManualFallback(state.barcode.status) ? (
        <ScanManualItemFallback
          error={manualSearch.error}
          isLoading={manualSearch.isLoading}
          items={manualSearch.items}
          onSearchChange={(value) => workflow.setManualSearchText(value)}
          onSelect={(item) => workflow.selectManualItem(item)}
          searchText={state.manualSearchText}
        />
      ) : null}

      <RecentScansList scans={state.recentScans} />
    </section>
  );
}
