import type { InventoryTransaction } from "@/domains/inventory";

type InventoryTransactionListProps = {
  transactions: readonly InventoryTransaction[];
};

export function InventoryTransactionList({ transactions }: InventoryTransactionListProps) {
  if (transactions.length === 0) {
    return <p className="text-sm text-stone-600">No recent transactions.</p>;
  }

  return (
    <ul className="space-y-2">
      {transactions.map((transaction) => (
        <li
          className="rounded-md border border-stone-200 bg-white p-3 text-sm"
          key={transaction.id}
        >
          <span className="block font-semibold capitalize text-stone-950">
            {transaction.transactionType.replace("_", " ")} {transaction.quantity}{" "}
            {transaction.unit}
          </span>
          <span className="mt-1 block text-stone-600">{transaction.createdAt}</span>
        </li>
      ))}
    </ul>
  );
}
