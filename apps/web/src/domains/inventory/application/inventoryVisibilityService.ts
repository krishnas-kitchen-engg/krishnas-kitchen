import {
  detectLowStock,
  projectInventoryBalances,
  projectInventorySummary,
  projectItemBalances,
  projectLocationBalances,
  projectTransactionHistory
} from "../domain/visibility";
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
} from "../domain/types";
import type { InventoryTransactionRepository } from "./inventoryRepository";

function getThresholdScopeRank(threshold: InventoryLowStockThreshold): number {
  if (threshold.locationId) {
    return 3;
  }

  if (threshold.templeId) {
    return 2;
  }

  return 1;
}

function getThresholdPrecedenceKey(
  threshold: InventoryLowStockThreshold,
  scope: InventoryTransactionScope
): string {
  return [
    threshold.organizationId,
    scope.templeId ?? threshold.templeId ?? "",
    scope.locationId ?? threshold.locationId ?? "",
    threshold.itemId,
    threshold.unit
  ].join(":");
}

export function resolveLowStockThresholdPrecedence(
  thresholds: readonly InventoryLowStockThreshold[],
  scope: InventoryTransactionScope
): InventoryLowStockThreshold[] {
  const thresholdsByKey = new Map<string, InventoryLowStockThreshold>();

  for (const threshold of thresholds) {
    const key = getThresholdPrecedenceKey(threshold, scope);
    const existingThreshold = thresholdsByKey.get(key);

    if (
      !existingThreshold ||
      getThresholdScopeRank(threshold) > getThresholdScopeRank(existingThreshold)
    ) {
      thresholdsByKey.set(key, threshold);
    }
  }

  return Array.from(thresholdsByKey.values());
}

export type InventoryVisibilityService = {
  getInventorySummary: (scope: InventoryTransactionScope) => Promise<InventorySummaryProjection>;
  getItemBalances: (scope: InventoryTransactionScope) => Promise<InventoryItemBalance[]>;
  getLocationBalances: (scope: InventoryTransactionScope) => Promise<InventoryLocationBalance[]>;
  getLowStockAlerts: (
    scope: InventoryTransactionScope,
    thresholds?: readonly InventoryLowStockThreshold[]
  ) => Promise<InventoryLowStockAlert[]>;
  getTransactionHistory: (
    query: InventoryTransactionHistoryQuery
  ) => Promise<InventoryTransaction[]>;
  getVisibleBalances: (scope: InventoryTransactionScope) => Promise<InventoryBalance[]>;
};

export type InventoryLowStockThresholdRepository = {
  listActiveLowStockThresholds: (
    scope: InventoryTransactionScope
  ) => Promise<readonly InventoryLowStockThreshold[]>;
};

export function createInventoryVisibilityService(
  repository: InventoryTransactionRepository,
  options: {
    lowStockThresholdRepository?: InventoryLowStockThresholdRepository;
  } = {}
): InventoryVisibilityService {
  return {
    async getInventorySummary(scope) {
      const transactions = await repository.listTransactions(scope);

      return projectInventorySummary(transactions, scope);
    },

    async getItemBalances(scope) {
      const transactions = await repository.listTransactions(scope);

      return projectItemBalances(transactions, scope);
    },

    async getLocationBalances(scope) {
      const transactions = await repository.listTransactions(scope);

      return projectLocationBalances(transactions, scope);
    },

    async getLowStockAlerts(scope, thresholds) {
      const transactions = await repository.listTransactions(scope);
      const balances = projectInventoryBalances(transactions, scope);
      const availableThresholds =
        thresholds ??
        (options.lowStockThresholdRepository
          ? await options.lowStockThresholdRepository.listActiveLowStockThresholds(scope)
          : []);
      const scopedThresholds = resolveLowStockThresholdPrecedence(
        availableThresholds.filter(
          (threshold) =>
            threshold.organizationId === scope.organizationId &&
            (!scope.templeId || !threshold.templeId || threshold.templeId === scope.templeId) &&
            (!scope.itemId || threshold.itemId === scope.itemId) &&
            (!scope.locationId ||
              !threshold.locationId ||
              threshold.locationId === scope.locationId)
        ),
        scope
      );

      return detectLowStock(balances, scopedThresholds);
    },

    async getTransactionHistory(query) {
      const transactions = await repository.listTransactions(query);

      return projectTransactionHistory(transactions, query);
    },

    async getVisibleBalances(scope) {
      const transactions = await repository.listTransactions(scope);

      return projectInventoryBalances(transactions, scope);
    }
  };
}
