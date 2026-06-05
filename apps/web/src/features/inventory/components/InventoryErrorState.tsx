type InventoryErrorStateProps = {
  message?: string;
};

export function InventoryErrorState({ message }: InventoryErrorStateProps) {
  return (
    <section className="rounded-md border border-red-200 bg-red-50 p-4">
      <h2 className="text-base font-semibold text-red-950">Inventory could not load</h2>
      <p className="mt-2 text-sm leading-6 text-red-900">
        {message ?? "Please try again in a moment."}
      </p>
    </section>
  );
}
