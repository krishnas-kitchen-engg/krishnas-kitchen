import type { InventoryBarcode, UnknownBarcodeRecord } from "@/domains/inventory";

type ScanUnknownBarcodeCardProps = {
  barcode: InventoryBarcode | null;
  persistenceError: string | null;
  record: UnknownBarcodeRecord | null;
};

export function ScanUnknownBarcodeCard({
  barcode,
  persistenceError,
  record
}: ScanUnknownBarcodeCardProps) {
  return (
    <section className="space-y-2 rounded-md border border-amber-200 bg-amber-50 p-4">
      <p className="text-xs font-semibold uppercase text-amber-800">Unknown barcode</p>
      <h2 className="text-lg font-semibold text-stone-950">
        {barcode ? `${barcode.format}: ${barcode.value}` : "Barcode not recognized"}
      </h2>
      {record ? (
        <p className="text-sm text-stone-700">Saved for review. Seen {record.scanCount} time(s).</p>
      ) : (
        <p className="text-sm text-stone-700">This barcode is not linked to an active item yet.</p>
      )}
      {persistenceError ? (
        <p className="text-sm font-medium text-amber-900">
          Could not save for review. You can still continue with manual item search.
        </p>
      ) : null}
    </section>
  );
}
