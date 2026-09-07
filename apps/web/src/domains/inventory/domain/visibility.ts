import type {
  InventoryBalance,
  InventoryItemBalance,
  InventoryLocationBalance,
  InventoryLowStockAlert,
  InventoryLowStockThreshold,
  InventorySummaryProjection,
  InventoryTransaction,
  InventoryTransactionHistoryQuery,
  InventoryTransactionScope
} from "./types";
import { calculateInventoryBalances } from "./aggregation";

function compareText(left: string, right: string): number {
  return left.localeCompare(right);
}

function compareBalances(left: InventoryBalance, right: InventoryBalance): number {
  return (
    compareText(left.organizationId, right.organizationId) ||
    compareText(left.templeId, right.templeId) ||
    compareText(left.locationId, right.locationId) ||
    compareText(left.itemId, right.itemId) ||
    compareText(left.unit, right.unit)
  );
}

function matchesScope(
  transaction: InventoryTransaction,
  scope: InventoryTransactionScope
): boolean {
  return (
    transaction.organizationId === scope.organizationId &&
    (!scope.templeId || transaction.templeId === scope.templeId) &&
    (!scope.itemId || transaction.itemId === scope.itemId) &&
    (!scope.locationId ||
      transaction.sourceLocationId === scope.locationId ||
      transaction.destinationLocationId === scope.locationId)
  );
}

function matchesHistoryQuery(
  transaction: InventoryTransaction,
  query: InventoryTransactionHistoryQuery
): boolean {
  return (
    matchesScope(transaction, query) &&
    (!query.transactionType || transaction.transactionType === query.transactionType)
  );
}

export function projectInventoryBalances(
  transactions: readonly InventoryTransaction[],
  scope: InventoryTransactionScope
): InventoryBalance[] {
  return calculateInventoryBalances(
    transactions.filter((transaction) => matchesScope(transaction, scope))
  ).sort(compareBalances);
}

export function projectItemBalances(
  transactions: readonly InventoryTransaction[],
  scope: InventoryTransactionScope
): InventoryItemBalance[] {
  const itemBalances = new Map<string, InventoryItemBalance>();

  for (const balance of projectInventoryBalances(transactions, scope)) {
    const key = [balance.organizationId, scope.templeId ?? "", balance.itemId, balance.unit].join(
      ":"
    );
    const existingBalance = itemBalances.get(key);

    itemBalances.set(key, {
      itemId: balance.itemId,
      organizationId: balance.organizationId,
      quantity: (existingBalance?.quantity ?? 0) + balance.quantity,
      ...(scope.templeId ? { templeId: scope.templeId } : {}),
      unit: balance.unit
    });
  }

  return Array.from(itemBalances.values())
    .filter((balance) => balance.quantity !== 0)
    .sort(
      (left, right) =>
        compareText(left.organizationId, right.organizationId) ||
        compareText(left.templeId ?? "", right.templeId ?? "") ||
        compareText(left.itemId, right.itemId) ||
        compareText(left.unit, right.unit)
    );
}

export function projectLocationBalances(
  transactions: readonly InventoryTransaction[],
  scope: InventoryTransactionScope
): InventoryLocationBalance[] {
  const locationBalances = new Map<string, InventoryLocationBalance>();

  for (const balance of projectInventoryBalances(transactions, scope)) {
    const key = [balance.organizationId, balance.templeId, balance.locationId].join(":");
    const existingBalance = locationBalances.get(key);
    const itemBalances = [...(existingBalance?.itemBalances ?? []), balance].sort(compareBalances);

    locationBalances.set(key, {
      itemBalances,
      locationId: balance.locationId,
      organizationId: balance.organizationId,
      templeId: balance.templeId
    });
  }

  return Array.from(locationBalances.values()).sort(
    (left, right) =>
      compareText(left.organizationId, right.organizationId) ||
      compareText(left.templeId, right.templeId) ||
      compareText(left.locationId, right.locationId)
  );
}

export function projectInventorySummary(
  transactions: readonly InventoryTransaction[],
  scope: InventoryTransactionScope
): InventorySummaryProjection {
  const scopedTransactions = transactions.filter((transaction) => matchesScope(transaction, scope));
  const balances = projectInventoryBalances(scopedTransactions, scope);

  return {
    balanceCount: balances.length,
    itemCount: new Set(balances.map((balance) => balance.itemId)).size,
    locationCount: new Set(balances.map((balance) => balance.locationId)).size,
    organizationId: scope.organizationId,
    ...(scope.templeId ? { templeId: scope.templeId } : {}),
    transactionCount: scopedTransactions.length
  };
}

export function projectTransactionHistory(
  transactions: readonly InventoryTransaction[],
  query: InventoryTransactionHistoryQuery
): InventoryTransaction[] {
  const history = transactions
    .filter((transaction) => matchesHistoryQuery(transaction, query))
    .sort(
      (left, right) =>
        compareText(right.createdAt, left.createdAt) || compareText(right.id, left.id)
    );

  return typeof query.limit === "number" ? history.slice(0, Math.max(query.limit, 0)) : history;
}

export function detectLowStock(
  balances: readonly InventoryBalance[],
  thresholds: readonly InventoryLowStockThreshold[]
): InventoryLowStockAlert[] {
  return thresholds
    .filter((threshold) => threshold.minimumQuantity > 0)
    .map((threshold): InventoryLowStockAlert | null => {
      const matchingBalances = balances.filter(
        (balance) =>
          balance.organizationId === threshold.organizationId &&
          (!threshold.templeId || balance.templeId === threshold.templeId) &&
          (!threshold.locationId || balance.locationId === threshold.locationId) &&
          balance.itemId === threshold.itemId &&
          balance.unit === threshold.unit
      );
      const currentQuantity = matchingBalances.reduce(
        (total, balance) => total + (balance?.quantity ?? 0),
        0
      );

      if (currentQuantity > threshold.minimumQuantity) {
        return null;
      }

      return {
        ...threshold,
        currentQuantity,
        shortageQuantity: threshold.minimumQuantity - currentQuantity
      };
    })
    .filter((alert): alert is InventoryLowStockAlert => alert !== null)
    .sort(
      (left, right) =>
        compareText(left.organizationId, right.organizationId) ||
        compareText(left.templeId ?? "", right.templeId ?? "") ||
        compareText(left.locationId ?? "", right.locationId ?? "") ||
        compareText(left.itemId, right.itemId) ||
        compareText(left.unit, right.unit)
    );
}
