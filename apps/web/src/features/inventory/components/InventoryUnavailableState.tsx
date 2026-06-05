export function InventoryUnavailableState() {
  return (
    <section className="rounded-md border border-amber-200 bg-amber-50 p-4">
      <h2 className="text-base font-semibold text-amber-950">Inventory unavailable</h2>
      <p className="mt-2 text-sm leading-6 text-amber-900">
        Inventory services are not available for this session. Check the connection and try again.
      </p>
    </section>
  );
}
