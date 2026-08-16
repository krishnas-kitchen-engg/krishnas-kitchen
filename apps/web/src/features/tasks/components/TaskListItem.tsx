import type { InventoryCatalogItem } from "@/domains/inventory";

import type { VolunteerTask } from "../types/taskTypes";
import { LowStockTaskCard } from "./LowStockTaskCard";
import { UnknownBarcodeTaskCard } from "./UnknownBarcodeTaskCard";

type TaskListItemProps = {
  canResolveUnknownBarcodes: boolean;
  dismissReasonsById: Readonly<Record<string, string>>;
  isSubmittingAction: boolean;
  linkItemIdsById: Readonly<Record<string, string>>;
  onDismissUnknownBarcode: (unknownBarcodeId: string) => void;
  onDismissReasonChange: (unknownBarcodeId: string, reason: string) => void;
  onLinkItemChange: (unknownBarcodeId: string, itemId: string) => void;
  onLinkUnknownBarcode: (unknownBarcodeId: string) => void;
  catalogItems: readonly InventoryCatalogItem[];
  task: VolunteerTask;
};

export function TaskListItem({
  canResolveUnknownBarcodes,
  catalogItems,
  dismissReasonsById,
  isSubmittingAction,
  linkItemIdsById,
  onDismissReasonChange,
  onDismissUnknownBarcode,
  onLinkItemChange,
  onLinkUnknownBarcode,
  task
}: TaskListItemProps) {
  if (task.category === "unknown_barcode") {
    return (
      <UnknownBarcodeTaskCard
        canResolve={canResolveUnknownBarcodes}
        dismissReason={dismissReasonsById[task.unknownBarcodeId] ?? ""}
        isSubmitting={isSubmittingAction}
        items={catalogItems}
        linkItemId={linkItemIdsById[task.unknownBarcodeId] ?? ""}
        onDismiss={onDismissUnknownBarcode}
        onDismissReasonChange={onDismissReasonChange}
        onLink={onLinkUnknownBarcode}
        onLinkItemChange={onLinkItemChange}
        task={task}
      />
    );
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
