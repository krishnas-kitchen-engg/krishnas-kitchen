import type { InventoryCatalogLocation, ReceivingResolvedItem } from "@/domains/inventory";
import type { ItemUnit } from "@krishnas-kitchen/types";

type ReceiveConfirmationProps = {
  isSubmitting: boolean;
  item: ReceivingResolvedItem;
  location: InventoryCatalogLocation | null;
  notes: string;
  onBack: () => void;
  onNotesChange: (notes: string) => void;
  onSubmit: () => void;
  quantity: string;
  unit: ItemUnit | "";
};

export function ReceiveConfirmation({
  isSubmitting,
  item,
  location,
  notes,
  onBack,
  onNotesChange,
  onSubmit,
  quantity,
  unit
}: ReceiveConfirmationProps) {
  return (
    <section className="space-y-4 rounded-md border border-stone-200 bg-white p-4">
      <div>
        <h2 className="text-base font-semibold text-stone-950">Confirm receiving</h2>
        <p className="mt-1 text-sm text-stone-600">Review before creating the inventory event.</p>
      </div>
      <dl className="space-y-2 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-stone-600">Item</dt>
          <dd className="text-right font-semibold text-stone-950">{item.item.name}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-stone-600">Quantity</dt>
          <dd className="text-right font-semibold text-stone-950">
            {quantity} {unit}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-stone-600">Location</dt>
          <dd className="text-right font-semibold text-stone-950">{location?.name ?? "Unknown"}</dd>
        </div>
      </dl>
      <label className="block space-y-1 text-sm font-medium text-stone-700">
        Notes
        <textarea
          className="min-h-24 w-full rounded-md border border-stone-300 px-3 py-2 text-base"
          onChange={(event) => onNotesChange(event.target.value)}
          placeholder="Optional receiving notes"
          value={notes}
        />
      </label>
      <div className="grid grid-cols-2 gap-2">
        <button
          className="min-h-11 rounded-md border border-stone-300 px-4 text-sm font-semibold text-stone-700"
          onClick={onBack}
          type="button"
        >
          Back
        </button>
        <button
          className="min-h-11 rounded-md bg-brand-900 px-4 text-sm font-semibold text-white disabled:bg-stone-300"
          disabled={isSubmitting}
          onClick={onSubmit}
          type="button"
        >
          {isSubmitting ? "Receiving..." : "Receive"}
        </button>
      </div>
    </section>
  );
}
