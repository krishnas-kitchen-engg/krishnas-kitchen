import type { InventoryBalance, InventoryBalanceKey, InventoryTransaction } from "./types";

function getBalanceKey(key: InventoryBalanceKey): string {
  return [key.organizationId, key.templeId, key.locationId, key.itemId, key.unit].join(":");
}

function addQuantity(
  balances: Map<string, InventoryBalance>,
  key: InventoryBalanceKey,
  quantityDelta: number
): void {
  const balanceKey = getBalanceKey(key);
  const existingBalance = balances.get(balanceKey);

  balances.set(balanceKey, {
    ...key,
    quantity: (existingBalance?.quantity ?? 0) + quantityDelta
  });
}

export function calculateInventoryBalances(
  transactions: readonly InventoryTransaction[]
): InventoryBalance[] {
  const balances = new Map<string, InventoryBalance>();

  for (const transaction of transactions) {
    const baseKey = {
      itemId: transaction.itemId,
      organizationId: transaction.organizationId,
      templeId: transaction.templeId,
      unit: transaction.unit
    };

    if (transaction.quantityEffect === "increase" && transaction.destinationLocationId) {
      addQuantity(
        balances,
        {
          ...baseKey,
          locationId: transaction.destinationLocationId
        },
        transaction.quantity
      );
    }

    if (transaction.quantityEffect === "decrease" && transaction.sourceLocationId) {
      addQuantity(
        balances,
        {
          ...baseKey,
          locationId: transaction.sourceLocationId
        },
        -transaction.quantity
      );
    }

    if (
      transaction.quantityEffect === "transfer" &&
      transaction.sourceLocationId &&
      transaction.destinationLocationId
    ) {
      addQuantity(
        balances,
        {
          ...baseKey,
          locationId: transaction.sourceLocationId
        },
        -transaction.quantity
      );
      addQuantity(
        balances,
        {
          ...baseKey,
          locationId: transaction.destinationLocationId
        },
        transaction.quantity
      );
    }
  }

  return Array.from(balances.values()).filter((balance) => balance.quantity !== 0);
}

export function calculateItemBalance(
  transactions: readonly InventoryTransaction[],
  itemId: string
): number {
  return calculateInventoryBalances(transactions)
    .filter((balance) => balance.itemId === itemId)
    .reduce((total, balance) => total + balance.quantity, 0);
}

export function calculateLocationItemBalance(
  transactions: readonly InventoryTransaction[],
  locationId: string,
  itemId: string
): number {
  return (
    calculateInventoryBalances(transactions).find(
      (balance) => balance.locationId === locationId && balance.itemId === itemId
    )?.quantity ?? 0
  );
}
