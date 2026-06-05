import type { InventoryCatalogBarcode } from "@/domains/inventory";

type BarcodeResultRowProps = {
  barcode: InventoryCatalogBarcode;
  onSelect: (itemId: string) => void;
};

export function BarcodeResultRow({ barcode, onSelect }: BarcodeResultRowProps) {
  return (
    <button
      className="min-h-16 w-full rounded-md border border-stone-200 bg-white p-3 text-left"
      onClick={() => onSelect(barcode.itemId)}
      type="button"
    >
      <span className="block font-semibold text-stone-950">{barcode.itemName}</span>
      <span className="mt-1 block text-sm text-stone-600">
        {barcode.format} · {barcode.value}
      </span>
    </button>
  );
}
