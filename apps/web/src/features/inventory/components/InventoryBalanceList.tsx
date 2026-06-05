import type { InventoryBalance } from "@/domains/inventory";

type InventoryBalanceListProps = {
  balances: readonly InventoryBalance[];
};

export function InventoryBalanceList({ balances }: InventoryBalanceListProps) {
  if (balances.length === 0) {
    return <p className="text-sm text-stone-600">No current balances.</p>;
  }

  return (
    <ul className="space-y-2">
      {balances.map((balance) => (
        <li
          className="rounded-md border border-stone-200 bg-white p-3 text-sm"
          key={`${balance.locationId}:${balance.itemId}:${balance.unit}`}
        >
          <span className="font-semibold text-stone-950">
            {balance.quantity} {balance.unit}
          </span>
          <span className="ml-2 text-stone-600">at {balance.locationId}</span>
        </li>
      ))}
    </ul>
  );
}
