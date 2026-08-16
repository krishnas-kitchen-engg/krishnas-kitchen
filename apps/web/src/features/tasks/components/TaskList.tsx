import type { InventoryCatalogItem } from "@/domains/inventory";

import type { VolunteerTask } from "../types/taskTypes";
import { TaskListItem } from "./TaskListItem";
import { TasksEmptyState } from "./TasksEmptyState";

type TaskListProps = {
  canResolveUnknownBarcodes: boolean;
  dismissReasonsById: Readonly<Record<string, string>>;
  isSubmittingAction: boolean;
  linkItemIdsById: Readonly<Record<string, string>>;
  onDismissUnknownBarcode: (unknownBarcodeId: string) => void;
  onDismissReasonChange: (unknownBarcodeId: string, reason: string) => void;
  onLinkItemChange: (unknownBarcodeId: string, itemId: string) => void;
  onLinkUnknownBarcode: (unknownBarcodeId: string) => void;
  catalogItems: readonly InventoryCatalogItem[];
  tasks: readonly VolunteerTask[];
};

export function TaskList({
  canResolveUnknownBarcodes,
  catalogItems,
  dismissReasonsById,
  isSubmittingAction,
  linkItemIdsById,
  onDismissReasonChange,
  onDismissUnknownBarcode,
  onLinkItemChange,
  onLinkUnknownBarcode,
  tasks
}: TaskListProps) {
  if (tasks.length === 0) {
    return <TasksEmptyState />;
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <TaskListItem
          canResolveUnknownBarcodes={canResolveUnknownBarcodes}
          catalogItems={catalogItems}
          dismissReasonsById={dismissReasonsById}
          isSubmittingAction={isSubmittingAction}
          key={task.id}
          linkItemIdsById={linkItemIdsById}
          onDismissReasonChange={onDismissReasonChange}
          onDismissUnknownBarcode={onDismissUnknownBarcode}
          onLinkItemChange={onLinkItemChange}
          onLinkUnknownBarcode={onLinkUnknownBarcode}
          task={task}
        />
      ))}
    </div>
  );
}
