import type {
  InventoryBalance,
  InventoryTransaction,
  ReceivingResolvedItem
} from "@/domains/inventory";

type ReceiveSuccessStateProps = {
  balances: readonly InventoryBalance[];
  item: ReceivingResolvedItem;
  onReset: () => void;
  receivedTransaction: InventoryTransaction;
  recentTransactions: readonly InventoryTransaction[];
};

export function ReceiveSuccessState({
  balances,
  item,
  onReset,
  receivedTransaction,
  recentTransactions
}: ReceiveSuccessStateProps) {
  return (
    <section className="space-y-4 rounded-md border border-emerald-200 bg-emerald-50 p-4">
      <div>
        <p className="text-sm font-semibold uppercase text-emerald-800">Received</p>
        <h2 className="mt-1 text-xl font-semibold text-stone-950">{item.item.name}</h2>
        <p className="mt-1 text-sm text-stone-700">
          Transaction {receivedTransaction.id} added to inventory history.
        </p>
      </div>
      <div>
        <h3 className="text-sm font-semibold text-stone-950">Current balance</h3>
        <ul className="mt-2 space-y-2">
          {balances.map((balance) => (
            <li className="rounded-md bg-white p-3 text-sm" key={balance.unit}>
              {balance.quantity} {balance.unit}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="text-sm font-semibold text-stone-950">Item history</h3>
        <p className="mt-1 text-sm text-stone-700">
          {recentTransactions.length} recent transaction
          {recentTransactions.length === 1 ? "" : "s"} available.
        </p>
      </div>
      <button
        className="min-h-11 w-full rounded-md bg-brand-900 px-4 text-sm font-semibold text-white"
        onClick={onReset}
        type="button"
      >
        Receive another item
      </button>
    </section>
  );
}
