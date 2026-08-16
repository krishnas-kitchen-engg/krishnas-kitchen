import { useAuth } from "@/features/auth";

import { FutureTaskPlaceholder } from "../components/FutureTaskPlaceholder";
import { TaskCategoryTabs } from "../components/TaskCategoryTabs";
import { TaskList } from "../components/TaskList";
import { TasksEmptyState } from "../components/TasksEmptyState";
import { TasksErrorState } from "../components/TasksErrorState";
import { TasksHeader } from "../components/TasksHeader";
import { TasksLoadingState } from "../components/TasksLoadingState";
import { useVolunteerTasks } from "../hooks/useVolunteerTasks";

export function TasksScreen() {
  const auth = useAuth();
  const tasks = useVolunteerTasks();

  if (!tasks.canReadTasks) {
    return (
      <section className="rounded-md border border-stone-200 bg-white p-4">
        <h2 className="text-lg font-semibold text-stone-950">Tasks unavailable</h2>
        <p className="mt-2 text-sm leading-6 text-stone-600">
          Your current session does not include inventory read permission.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <TasksHeader templeName={auth.currentTemple?.name ?? "Current temple"} />
      <TaskCategoryTabs
        onChange={tasks.setSelectedCategory}
        selectedCategory={tasks.selectedCategory}
      />
      {tasks.isLoading ? <TasksLoadingState /> : null}
      {tasks.unknownBarcodes.status === "unavailable" ? (
        <TasksErrorState message="Unknown barcode tasks are unavailable." />
      ) : null}
      {tasks.lowStock.status === "unavailable" ? (
        <TasksErrorState message="Low stock tasks are unavailable." />
      ) : null}
      {tasks.actionError ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-800">
          {tasks.actionError}
        </div>
      ) : null}
      {tasks.actionSuccess ? (
        <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm font-medium text-green-800">
          {tasks.actionSuccess}
        </div>
      ) : null}
      {tasks.allTasks.length === 0 &&
      tasks.unknownBarcodes.status === "loaded" &&
      tasks.lowStock.status === "loaded" ? (
        <TasksEmptyState />
      ) : (
        <TaskList
          canResolveUnknownBarcodes={tasks.canResolveUnknownBarcodes}
          catalogItems={tasks.catalogItems}
          dismissReasonsById={tasks.dismissReasonsById}
          isSubmittingAction={tasks.isSubmittingAction}
          linkItemIdsById={tasks.linkItemIdsById}
          onDismissReasonChange={tasks.setDismissReason}
          onDismissUnknownBarcode={(unknownBarcodeId) => {
            void tasks.dismissUnknownBarcode(unknownBarcodeId);
          }}
          onLinkItemChange={tasks.setLinkItemId}
          onLinkUnknownBarcode={(unknownBarcodeId) => {
            void tasks.linkUnknownBarcode(unknownBarcodeId);
          }}
          tasks={tasks.filteredTasks}
        />
      )}
      <FutureTaskPlaceholder />
    </section>
  );
}
