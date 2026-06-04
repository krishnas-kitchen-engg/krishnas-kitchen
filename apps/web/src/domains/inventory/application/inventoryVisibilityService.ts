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

export type InventoryVisibilityService = {
  getInventorySummary: (scope: InventoryTransactionScope) => Promise<InventorySummaryProjection>;
  getItemBalances: (scope: InventoryTransactionScope) => Promise<InventoryItemBalance[]>;
  getLocationBalances: (scope: InventoryTransactionScope) => Promise<InventoryLocationBalance[]>;
  getLowStockAlerts: (
    scope: InventoryTransactionScope,
    thresholds: readonly InventoryLowStockThreshold[]
  ) => Promise<InventoryLowStockAlert[]>;
  getTransactionHistory: (
    query: InventoryTransactionHistoryQuery
  ) => Promise<InventoryTransaction[]>;
  getVisibleBalances: (scope: InventoryTransactionScope) => Promise<InventoryBalance[]>;
};

export function createInventoryVisibilityService(
  repository: InventoryTransactionRepository
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
      const scopedThresholds = thresholds.filter(
        (threshold) =>
          threshold.organizationId === scope.organizationId &&
          (!scope.templeId || !threshold.templeId || threshold.templeId === scope.templeId) &&
          (!scope.itemId || threshold.itemId === scope.itemId) &&
          (!scope.locationId || !threshold.locationId || threshold.locationId === scope.locationId)
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
