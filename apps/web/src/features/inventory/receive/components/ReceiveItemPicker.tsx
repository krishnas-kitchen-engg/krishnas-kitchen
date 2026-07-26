import type { InventoryCatalogItem } from "@/domains/inventory";

type ReceiveItemPickerProps = {
  isLoading: boolean;
  items: readonly InventoryCatalogItem[];
  onSearchChange: (value: string) => void;
  onSelect: (item: InventoryCatalogItem) => void;
  searchText: string;
};

export function ReceiveItemPicker({
  isLoading,
  items,
  onSearchChange,
  onSelect,
  searchText
}: ReceiveItemPickerProps) {
  const trimmedSearch = searchText.trim();

  return (
    <section className="space-y-3 rounded-md border border-stone-200 bg-white p-4">
      <div>
        <h2 className="text-base font-semibold text-stone-950">Manual item</h2>
        <p className="mt-1 text-sm text-stone-600">
          Search active items when no barcode is handy or barcode lookup needs a fallback.
        </p>
      </div>
      <input
        className="min-h-11 w-full rounded-md border border-stone-300 px-3 text-base"
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Search item name or barcode"
        value={searchText}
      />
      <div className="space-y-2">
        {isLoading ? (
          <p className="rounded-md border border-stone-200 bg-stone-50 p-3 text-sm text-stone-600">
            Loading receiving items...
          </p>
        ) : items.length > 0 ? (
          items.map((item) => (
            <button
              className="min-h-14 w-full rounded-md border border-stone-200 bg-stone-50 p-3 text-left"
              key={item.id}
              onClick={() => onSelect(item)}
              type="button"
            >
              <span className="block font-semibold text-stone-950">{item.name}</span>
              <span className="mt-1 block text-sm text-stone-600">
                Default unit: {item.defaultUnit}
              </span>
            </button>
          ))
        ) : (
          <p className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm font-medium text-amber-900">
            {trimmedSearch
              ? `No active receiving items match "${trimmedSearch}". Check spelling or ask a manager to add the item.`
              : "No active receiving items are available. Ask a manager to add pilot inventory items."}
          </p>
        )}
      </div>
    </section>
  );
}
