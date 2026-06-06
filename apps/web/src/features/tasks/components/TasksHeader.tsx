type TasksHeaderProps = {
  templeName: string;
};

export function TasksHeader({ templeName }: TasksHeaderProps) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold uppercase text-brand-800">{templeName}</p>
      <h1 className="text-2xl font-semibold text-stone-950">Tasks</h1>
      <p className="text-sm leading-6 text-stone-700">
        Review inventory cleanup work that needs attention.
      </p>
    </div>
  );
}
