import type { InventoryCatalogItem } from "@/domains/inventory";

import type { UnknownBarcodeReviewTask } from "../types/taskTypes";

type UnknownBarcodeTaskCardProps = {
  canResolve: boolean;
  dismissReason: string;
  isSubmitting: boolean;
  linkItemId: string;
  onDismiss: (unknownBarcodeId: string) => void;
  onDismissReasonChange: (unknownBarcodeId: string, reason: string) => void;
  onLink: (unknownBarcodeId: string) => void;
  onLinkItemChange: (unknownBarcodeId: string, itemId: string) => void;
  items: readonly InventoryCatalogItem[];
  task: UnknownBarcodeReviewTask;
};

export function UnknownBarcodeTaskCard({
  canResolve,
  dismissReason,
  isSubmitting,
  items,
  linkItemId,
  onDismiss,
  onDismissReasonChange,
  onLink,
  onLinkItemChange,
  task
}: UnknownBarcodeTaskCardProps) {
  return (
    <article className="space-y-2 rounded-md border border-amber-200 bg-amber-50 p-4">
      <p className="text-xs font-semibold uppercase text-amber-800">Unknown barcode</p>
      <h2 className="text-base font-semibold text-stone-950">{task.title}</h2>
      <p className="text-sm font-medium text-stone-800">{task.barcodeLabel}</p>
      <p className="text-sm leading-6 text-stone-700">{task.description}</p>
      {canResolve ? (
        <div className="space-y-3 rounded-md border border-amber-200 bg-white p-3">
          <label className="block text-sm font-medium text-stone-800">
            Link to item
            <select
              className="mt-2 min-h-11 w-full rounded-md border border-stone-300 bg-white px-3 text-base text-stone-950"
              disabled={isSubmitting}
              onChange={(event) => onLinkItemChange(task.unknownBarcodeId, event.target.value)}
              value={linkItemId}
            >
              <option value="">Choose active item</option>
              {items.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} ({item.defaultUnit})
                </option>
              ))}
            </select>
          </label>
          <button
            className="min-h-10 w-full rounded-md bg-brand-900 px-3 text-sm font-semibold text-white disabled:bg-stone-300"
            disabled={isSubmitting || !linkItemId}
            onClick={() => onLink(task.unknownBarcodeId)}
            type="button"
          >
            Link barcode
          </button>
          <label className="block text-sm font-medium text-stone-800">
            Dismissal reason
            <input
              className="mt-2 min-h-11 w-full rounded-md border border-stone-300 px-3 text-base text-stone-950"
              disabled={isSubmitting}
              onChange={(event) => onDismissReasonChange(task.unknownBarcodeId, event.target.value)}
              placeholder="Example: damaged label or duplicate scan"
              value={dismissReason}
            />
          </label>
          <button
            className="min-h-10 w-full rounded-md border border-stone-300 px-3 text-sm font-semibold text-stone-800 disabled:text-stone-400"
            disabled={isSubmitting || !dismissReason.trim()}
            onClick={() => onDismiss(task.unknownBarcodeId)}
            type="button"
          >
            Dismiss barcode
          </button>
        </div>
      ) : null}
    </article>
  );
}
