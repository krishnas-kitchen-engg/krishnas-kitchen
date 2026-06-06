import type { UnknownBarcodeReviewTask } from "../types/taskTypes";

type UnknownBarcodeTaskCardProps = {
  task: UnknownBarcodeReviewTask;
};

export function UnknownBarcodeTaskCard({ task }: UnknownBarcodeTaskCardProps) {
  return (
    <article className="space-y-2 rounded-md border border-amber-200 bg-amber-50 p-4">
      <p className="text-xs font-semibold uppercase text-amber-800">Unknown barcode</p>
      <h2 className="text-base font-semibold text-stone-950">{task.title}</h2>
      <p className="text-sm font-medium text-stone-800">{task.barcodeLabel}</p>
      <p className="text-sm leading-6 text-stone-700">{task.description}</p>
    </article>
  );
}
