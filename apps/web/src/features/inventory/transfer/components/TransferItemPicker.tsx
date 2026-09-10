import type { InventoryCatalogItem } from "@/domains/inventory";
import { InventoryItemPackageSummary } from "../../components/InventoryItemPackageSummary";

type TransferItemPickerProps = {
  items: readonly InventoryCatalogItem[];
  onSearchChange: (value: string) => void;
  onSelect: (item: InventoryCatalogItem) => void;
  searchText: string;
};

export function TransferItemPicker({
  items,
  onSearchChange,
  onSelect,
  searchText
}: TransferItemPickerProps) {
  return (
    <section className="space-y-3 rounded-md border border-stone-200 bg-white p-4">
      <div>
        <h2 className="text-base font-semibold text-stone-950">Manual item</h2>
        <p className="mt-1 text-sm text-stone-600">Search active items to transfer.</p>
      </div>
      <input
        className="min-h-11 w-full rounded-md border border-stone-300 px-3 text-base"
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Search item name or barcode"
        value={searchText}
      />
      <div className="space-y-2">
        {items.length > 0 ? (
          items.map((item) => (
            <button
              className="min-h-14 w-full rounded-md border border-stone-200 bg-stone-50 p-3 text-left"
              key={item.id}
              onClick={() => onSelect(item)}
              type="button"
            >
              <span className="block font-semibold text-stone-950">{item.name}</span>
              <InventoryItemPackageSummary item={item} showProductName />
            </button>
          ))
        ) : (
          <p className="text-sm text-stone-600">No active items found.</p>
        )}
      </div>
    </section>
  );
}
