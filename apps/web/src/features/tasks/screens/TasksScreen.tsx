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
      {tasks.allTasks.length === 0 &&
      tasks.unknownBarcodes.status === "loaded" &&
      tasks.lowStock.status === "loaded" ? (
        <TasksEmptyState />
      ) : (
        <TaskList tasks={tasks.filteredTasks} />
      )}
      <FutureTaskPlaceholder />
    </section>
  );
}
