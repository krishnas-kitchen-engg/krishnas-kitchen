import type { InventoryBalance, InventoryCatalogItem } from "@/domains/inventory";
import {
  formatInventoryQuantity,
  formatInventoryStock,
  formatPackageDefinition
} from "@/domains/inventory";

type InventoryBalanceListProps = {
  balances: readonly InventoryBalance[];
  items?: readonly InventoryCatalogItem[];
};

export function InventoryBalanceList({ balances, items = [] }: InventoryBalanceListProps) {
  if (balances.length === 0) {
    return <p className="text-sm text-stone-600">No current balances.</p>;
  }

  return (
    <ul className="space-y-2">
      {balances.map((balance) => {
        const item = items.find((candidate) => candidate.id === balance.itemId);
        const packageDefinition = item ? formatPackageDefinition(item) : null;
        const stock = item ? formatInventoryStock(balance.quantity, balance.unit, item) : null;

        return (
          <li
            className="rounded-md border border-stone-200 bg-white p-3 text-sm"
            key={`${balance.locationId}:${balance.itemId}:${balance.unit}`}
          >
            {item ? <span className="block font-medium text-stone-700">{item.name}</span> : null}
            <span className="mt-1 block font-semibold text-stone-950">
              {stock?.primary ?? formatInventoryQuantity(balance.quantity, balance.unit)}
            </span>
            {stock?.secondary ? (
              <span className="mt-1 block text-stone-600">
                {stock.secondary} = {stock.primary}
              </span>
            ) : null}
            {!stock?.secondary && packageDefinition ? (
              <span className="mt-1 block text-stone-600">Package: {packageDefinition}</span>
            ) : null}
            {!item ? <span className="ml-2 text-stone-600">at {balance.locationId}</span> : null}
          </li>
        );
      })}
    </ul>
  );
}
