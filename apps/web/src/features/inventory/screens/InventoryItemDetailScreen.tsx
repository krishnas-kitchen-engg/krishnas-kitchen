import { InventoryBalanceList } from "../components/InventoryBalanceList";
import { InventoryEmptyState } from "../components/InventoryEmptyState";
import { InventoryErrorState } from "../components/InventoryErrorState";
import { InventoryLoadingState } from "../components/InventoryLoadingState";
import { InventoryTransactionList } from "../components/InventoryTransactionList";
import { useInventoryItemDetail } from "../hooks/useInventoryItemDetail";

type InventoryItemDetailScreenProps = {
  itemId: string;
};

export function InventoryItemDetailScreen({ itemId }: InventoryItemDetailScreenProps) {
  const detail = useInventoryItemDetail(itemId);

  if (detail.isLoading) {
    return <InventoryLoadingState />;
  }

  if (detail.error) {
    return <InventoryErrorState message={detail.error} />;
  }

  if (!detail.item) {
    return <InventoryEmptyState message="Item was not found." />;
  }

  return (
    <section className="space-y-5">
      <div className="rounded-md border border-stone-200 bg-white p-4">
        <h2 className="text-xl font-semibold text-brand-950">{detail.item.name}</h2>
        <p className="mt-2 text-sm text-stone-600">Default unit: {detail.item.defaultUnit}</p>
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
