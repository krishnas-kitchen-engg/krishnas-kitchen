import type { LowStockReviewTask } from "../types/taskTypes";

type LowStockTaskCardProps = {
  task: LowStockReviewTask;
};

export function LowStockTaskCard({ task }: LowStockTaskCardProps) {
  return (
    <article className="space-y-2 rounded-md border border-stone-200 bg-white p-4">
      <p className="text-xs font-semibold uppercase text-stone-600">Low stock</p>
      <h2 className="text-base font-semibold text-stone-950">{task.title}</h2>
      <p className="text-sm font-medium text-stone-800">{task.itemId}</p>
      <p className="text-sm leading-6 text-stone-700">{task.description}</p>
    </article>
  );
}
