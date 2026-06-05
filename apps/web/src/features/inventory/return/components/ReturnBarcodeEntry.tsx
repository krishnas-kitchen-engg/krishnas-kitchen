import type { InventoryBarcodeFormat } from "@/domains/inventory";

const barcodeFormats = [
  ["upc_a", "UPC-A"],
  ["upc_e", "UPC-E"],
  ["ean_13", "EAN-13"],
  ["ean_8", "EAN-8"],
  ["qr", "QR"]
] satisfies Array<[InventoryBarcodeFormat, string]>;

type ReturnBarcodeEntryProps = {
  error: string | null;
  format: InventoryBarcodeFormat | "";
  isLoading: boolean;
  onFormatChange: (format: InventoryBarcodeFormat) => void;
  onRawValueChange: (value: string) => void;
  onResolve: () => void;
  rawValue: string;
};

export function ReturnBarcodeEntry({
  error,
  format,
  isLoading,
  onFormatChange,
  onRawValueChange,
  onResolve,
  rawValue
}: ReturnBarcodeEntryProps) {
  return (
    <section className="space-y-3 rounded-md border border-stone-200 bg-white p-4">
      <div>
        <h2 className="text-base font-semibold text-stone-950">Barcode</h2>
        <p className="mt-1 text-sm text-stone-600">Enter a barcode value to identify the item.</p>
      </div>
      <label className="block text-sm font-medium text-stone-700">
        Format
        <select
          className="mt-1 min-h-11 w-full rounded-md border border-stone-300 bg-white px-3 text-base"
          onChange={(event) => onFormatChange(event.target.value as InventoryBarcodeFormat)}
          value={format}
        >
          {barcodeFormats.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm font-medium text-stone-700">
        Value
        <input
          className="mt-1 min-h-11 w-full rounded-md border border-stone-300 px-3 text-base"
          inputMode={format === "qr" ? "text" : "numeric"}
          onChange={(event) => onRawValueChange(event.target.value)}
          placeholder="Scan or type barcode"
          value={rawValue}
        />
      </label>
      {error ? <p className="text-sm font-medium text-red-700">{error}</p> : null}
      <button
        className="min-h-11 w-full rounded-md bg-brand-900 px-4 text-sm font-semibold text-white disabled:bg-stone-300"
        disabled={isLoading || !rawValue.trim()}
        onClick={onResolve}
        type="button"
      >
        {isLoading ? "Looking up..." : "Find item"}
      </button>
    </section>
  );
}
