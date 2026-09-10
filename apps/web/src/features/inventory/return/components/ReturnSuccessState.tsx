import type {
  InventoryBalance,
  InventoryTransaction,
  ReturnResolvedItem
} from "@/domains/inventory";
import { formatInventoryTransactionQuantity, type InventoryCatalogItem } from "@/domains/inventory";
import { InventoryBalanceList } from "../../components/InventoryBalanceList";

type ReturnSuccessStateProps = {
  destinationBalances: readonly InventoryBalance[];
  item: ReturnResolvedItem;
  onReset: () => void;
  recentDestinationLocationTransactions: readonly InventoryTransaction[];
  recentItemTransactions: readonly InventoryTransaction[];
  recentSourceLocationTransactions: readonly InventoryTransaction[];
  returnedTransaction: InventoryTransaction;
  sourceBalances: readonly InventoryBalance[];
};

function BalanceSummary({
  balances,
  item,
  title
}: {
  balances: readonly InventoryBalance[];
  item: InventoryCatalogItem;
  title: string;
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-stone-950">{title}</h3>
      <div className="mt-2">
        <InventoryBalanceList balances={balances} items={[item]} />
      </div>
    </div>
  );
}

export function ReturnSuccessState({
  destinationBalances,
  item,
  onReset,
  recentDestinationLocationTransactions,
  recentItemTransactions,
  recentSourceLocationTransactions,
  returnedTransaction,
  sourceBalances
}: ReturnSuccessStateProps) {
  return (
    <section className="space-y-4 rounded-md border border-amber-200 bg-amber-50 p-4">
      <div>
        <p className="text-sm font-semibold uppercase text-amber-800">Returned</p>
        <h2 className="mt-1 text-xl font-semibold text-stone-950">{item.item.name}</h2>
        <p className="mt-1 text-sm text-stone-700">
          {formatInventoryTransactionQuantity(returnedTransaction)} returned. Transaction{" "}
          {returnedTransaction.id} added to inventory history.
        </p>
      </div>
      <BalanceSummary balances={sourceBalances} item={item.item} title="Source balance" />
      <BalanceSummary
        balances={destinationBalances}
        item={item.item}
        title="Return destination balance"
      />
      <div className="grid grid-cols-3 gap-2 text-xs text-stone-700">
        <p>{recentItemTransactions.length} item events</p>
        <p>{recentSourceLocationTransactions.length} source events</p>
        <p>{recentDestinationLocationTransactions.length} destination events</p>
      </div>
      <button
        className="min-h-11 w-full rounded-md bg-brand-900 px-4 text-sm font-semibold text-white"
        onClick={onReset}
        type="button"
      >
        Return another item
      </button>
    </section>
  );
}
