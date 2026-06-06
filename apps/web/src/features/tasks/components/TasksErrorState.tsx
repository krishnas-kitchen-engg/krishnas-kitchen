type TasksErrorStateProps = {
  message: string;
};

export function TasksErrorState({ message }: TasksErrorStateProps) {
  return (
    <p className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
      {message}
    </p>
  );
}
