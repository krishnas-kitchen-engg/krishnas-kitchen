import type { VolunteerTask } from "../types/taskTypes";
import { LowStockTaskCard } from "./LowStockTaskCard";
import { UnknownBarcodeTaskCard } from "./UnknownBarcodeTaskCard";

type TaskListItemProps = {
  task: VolunteerTask;
};

export function TaskListItem({ task }: TaskListItemProps) {
  if (task.category === "unknown_barcode") {
    return <UnknownBarcodeTaskCard task={task} />;
  }

  if (task.category === "low_stock") {
    return <LowStockTaskCard task={task} />;
  }

  return (
    <article className="rounded-md border border-stone-200 bg-white p-4">
      <h2 className="text-base font-semibold text-stone-950">{task.title}</h2>
      <p className="mt-1 text-sm leading-6 text-stone-700">{task.description}</p>
    </article>
  );
}
