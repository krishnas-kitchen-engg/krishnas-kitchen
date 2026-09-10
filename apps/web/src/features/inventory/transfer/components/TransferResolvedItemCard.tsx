import type { TransferResolvedItem } from "@/domains/inventory";
import { InventoryItemPackageSummary } from "../../components/InventoryItemPackageSummary";

type TransferResolvedItemCardProps = {
  item: TransferResolvedItem;
  onChangeItem: () => void;
};

export function TransferResolvedItemCard({ item, onChangeItem }: TransferResolvedItemCardProps) {
  return (
    <section className="rounded-md border border-sky-200 bg-sky-50 p-4">
      <p className="text-xs font-semibold uppercase text-sky-800">
        {item.source === "scan" ? "Barcode item" : "Manual item"}
      </p>
      <h2 className="mt-1 text-lg font-semibold text-stone-950">{item.item.name}</h2>
      <InventoryItemPackageSummary item={item.item} showProductName />
      <button
        className="mt-3 min-h-10 rounded-md border border-sky-700 px-3 text-sm font-semibold text-sky-900"
        onClick={onChangeItem}
        type="button"
      >
        Change item
      </button>
    </section>
  );
}
