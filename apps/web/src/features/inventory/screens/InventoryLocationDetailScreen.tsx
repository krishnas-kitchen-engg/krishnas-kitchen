import { InventoryBalanceList } from "../components/InventoryBalanceList";
import { InventoryEmptyState } from "../components/InventoryEmptyState";
import { InventoryErrorState } from "../components/InventoryErrorState";
import { InventoryLoadingState } from "../components/InventoryLoadingState";
import { InventoryTransactionList } from "../components/InventoryTransactionList";
import { useInventoryLocationDetail } from "../hooks/useInventoryLocationDetail";

type InventoryLocationDetailScreenProps = {
  locationId: string;
};

export function InventoryLocationDetailScreen({ locationId }: InventoryLocationDetailScreenProps) {
  const detail = useInventoryLocationDetail(locationId);

  if (detail.isLoading) {
    return <InventoryLoadingState />;
  }

  if (detail.error) {
    return <InventoryErrorState message={detail.error} />;
  }

  if (!detail.location) {
    return <InventoryEmptyState message="Location was not found." />;
  }

  return (
    <section className="space-y-5">
      <div className="rounded-md border border-stone-200 bg-white p-4">
        <h2 className="text-xl font-semibold text-brand-950">{detail.location.name}</h2>
        <p className="mt-2 text-sm text-stone-600">Location ID: {detail.location.id}</p>
      </div>

      <section className="space-y-2">
        <h3 className="text-sm font-semibold uppercase text-stone-600">Current balances</h3>
        <InventoryBalanceList balances={detail.balances} />
      </section>

      <section className="space-y-2">
        <h3 className="text-sm font-semibold uppercase text-stone-600">Recent transactions</h3>
        <InventoryTransactionList transactions={detail.transactions} />
      </section>
    </section>
  );
}
