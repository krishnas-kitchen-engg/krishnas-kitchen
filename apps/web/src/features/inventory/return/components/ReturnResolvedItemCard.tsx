import type { ReturnResolvedItem } from "@/domains/inventory";
import { InventoryItemPackageSummary } from "../../components/InventoryItemPackageSummary";

type ReturnResolvedItemCardProps = {
  item: ReturnResolvedItem;
  onChangeItem: () => void;
};

export function ReturnResolvedItemCard({ item, onChangeItem }: ReturnResolvedItemCardProps) {
  return (
    <section className="rounded-md border border-amber-200 bg-amber-50 p-4">
      <p className="text-xs font-semibold uppercase text-amber-800">
        {item.source === "scan" ? "Barcode item" : "Manual item"}
      </p>
      <h2 className="mt-1 text-lg font-semibold text-stone-950">{item.item.name}</h2>
      <InventoryItemPackageSummary item={item.item} showProductName />
      <button
        className="mt-3 min-h-10 rounded-md border border-amber-700 px-3 text-sm font-semibold text-amber-900"
        onClick={onChangeItem}
        type="button"
      >
        Change item
      </button>
    </section>
  );
}
