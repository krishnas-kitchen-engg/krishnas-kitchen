type TasksEmptyStateProps = {
  message?: string;
};

export function TasksEmptyState({ message = "No open inventory tasks" }: TasksEmptyStateProps) {
  return (
    <p className="rounded-md border border-stone-200 bg-white p-4 text-sm text-stone-600">
      {message}
    </p>
  );
}
