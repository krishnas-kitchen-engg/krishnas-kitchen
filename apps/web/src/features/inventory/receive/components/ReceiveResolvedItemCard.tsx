import type { ReceivingResolvedItem } from "@/domains/inventory";

type ReceiveResolvedItemCardProps = {
  item: ReceivingResolvedItem;
  onChangeItem: () => void;
};

export function ReceiveResolvedItemCard({ item, onChangeItem }: ReceiveResolvedItemCardProps) {
  return (
    <section className="rounded-md border border-emerald-200 bg-emerald-50 p-4">
      <p className="text-xs font-semibold uppercase text-emerald-800">
        {item.source === "scan" ? "Barcode item" : "Manual item"}
      </p>
      <h2 className="mt-1 text-lg font-semibold text-stone-950">{item.item.name}</h2>
      <p className="mt-1 text-sm text-stone-700">Default unit: {item.item.defaultUnit}</p>
      <button
        className="mt-3 min-h-10 rounded-md border border-emerald-700 px-3 text-sm font-semibold text-emerald-900"
        onClick={onChangeItem}
        type="button"
      >
        Change item
      </button>
    </section>
  );
}
