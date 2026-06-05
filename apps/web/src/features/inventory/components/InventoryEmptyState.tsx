type InventoryEmptyStateProps = {
  message: string;
};

export function InventoryEmptyState({ message }: InventoryEmptyStateProps) {
  return (
    <section className="rounded-md border border-stone-200 bg-white p-4 text-sm text-stone-600">
      {message}
    </section>
  );
}
