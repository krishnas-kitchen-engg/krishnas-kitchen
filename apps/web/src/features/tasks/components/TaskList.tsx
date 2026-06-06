import type { VolunteerTask } from "../types/taskTypes";
import { TaskListItem } from "./TaskListItem";
import { TasksEmptyState } from "./TasksEmptyState";

type TaskListProps = {
  tasks: readonly VolunteerTask[];
};

export function TaskList({ tasks }: TaskListProps) {
  if (tasks.length === 0) {
    return <TasksEmptyState />;
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <TaskListItem key={task.id} task={task} />
      ))}
    </div>
  );
}
