import type { InventoryCatalogItem } from "@/domains/inventory";

type ItemResultRowProps = {
  item: InventoryCatalogItem;
  onSelect: (itemId: string) => void;
};

export function ItemResultRow({ item, onSelect }: ItemResultRowProps) {
  return (
    <button
      className="min-h-16 w-full rounded-md border border-stone-200 bg-white p-3 text-left"
      onClick={() => onSelect(item.id)}
      type="button"
    >
      <span className="block font-semibold text-stone-950">{item.name}</span>
      <span className="mt-1 block text-sm text-stone-600">
        Default unit: {item.defaultUnit} · {item.barcodes.length} barcode
        {item.barcodes.length === 1 ? "" : "s"}
      </span>
    </button>
  );
}
