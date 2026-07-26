import { useContext, useEffect, useState } from "react";

import {
  useInventoryCatalogQueries,
  useInventoryPermissions,
  useInventoryVisibility
} from "@/domains/inventory";
import { InventoryAvailabilityContext } from "@/domains/inventory/integration/inventoryContextValue";
import { useRecipeProductionRunRepository } from "@/domains/recipes";
import { useAuth } from "@/features/auth";

import type {
  InventoryDashboardActivityItem,
  InventoryDashboardData,
  InventoryDashboardLoaderInput,
  InventoryDashboardState
} from "../types/inventoryDashboardTypes";

const recentActivityLimit = 8;

const unavailableMetricStatus = {
  status: "unavailable" as const,
  value: "Unavailable"
};

export const initialInventoryDashboardState: InventoryDashboardState = {
  error: null,
  isLoading: false,
  lowStockAlerts: [],
  metrics: {
    activeItems: {
      label: "Active items",
      value: 0
    },
    consumedToday: {
      label: "Consumed today",
      value: 0
    },
    lowStockItems: {
      label: "Low stock",
      value: 0
    },
    outOfStockItems: {
      label: "Out of stock",
      value: 0
    },
    productionRunsToday: {
      label: "Production runs today",
      value: 0
    },
    receivedToday: {
      label: "Received today",
      value: 0
    }
  },
  recentActivity: []
};

function getStartOfToday(now: Date): string {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);

  return start.toISOString();
}

function isToday(timestamp: string, startOfToday: string): boolean {
  return timestamp >= startOfToday;
}

function formatActivity(transaction: {
  itemId: string;
  quantity: number;
  timestamp?: string;
  transactionType: string;
  unit: string;
}): string {
  const quantity = `${transaction.quantity} ${transaction.unit}`;

  if (transaction.transactionType === "received") {
    return `${transaction.itemId} received (+${quantity})`;
  }

  if (transaction.transactionType === "consumed") {
    return `${transaction.itemId} consumed (-${quantity})`;
  }

  if (transaction.transactionType === "adjusted") {
    return `${transaction.itemId} adjusted (${quantity})`;
  }

  if (transaction.transactionType === "reversal") {
    return `${transaction.itemId} reversal recorded`;
  }

  return `${transaction.itemId} ${transaction.transactionType} (${quantity})`;
}

export function toInventoryDashboardActivity(transaction: {
  createdAt: string;
  id: string;
  itemId: string;
  quantity: number;
  transactionType: string;
  unit: string;
}): InventoryDashboardActivityItem {
  return {
    description: formatActivity(transaction),
    id: transaction.id,
    timestamp: transaction.createdAt
  };
}

export async function loadInventoryDashboard(
  input: InventoryDashboardLoaderInput
): Promise<InventoryDashboardData> {
  const startOfToday = getStartOfToday(input.now ?? new Date());
  const scope = {
    organizationId: input.organizationId,
    templeId: input.templeId
  };
  const [
    activeItems,
    lowStockAlerts,
    visibleItemBalances,
    recentTransactions,
    receivedTransactions,
    consumedTransactions,
    productionRunsResult
  ] = await Promise.all([
    input.catalogQueries.searchItems({
      organizationId: input.organizationId
    }),
    input.visibility.getLowStockAlerts(scope),
    input.visibility.getItemBalances(scope),
    input.visibility.getTransactionHistory({
      limit: recentActivityLimit,
      ...scope
    }),
    input.visibility.getTransactionHistory({
      ...scope,
      transactionType: "received"
    }),
    input.visibility.getTransactionHistory({
      ...scope,
      transactionType: "consumed"
    }),
    input.productionRunRepository
      .listProductionRuns({
        organizationId: input.organizationId,
        since: startOfToday,
        templeId: input.templeId
      })
      .then((runs) => ({ runs, status: "fulfilled" as const }))
      .catch(() => ({ runs: [], status: "rejected" as const }))
  ]);
  const todayReceives = receivedTransactions.filter((transaction) =>
    isToday(transaction.createdAt, startOfToday)
  );
  const todayConsumption = consumedTransactions.filter((transaction) =>
    isToday(transaction.createdAt, startOfToday)
  );
  const productionRunsUnavailable = productionRunsResult.status === "rejected";

  return {
    lowStockAlerts,
    metrics: {
      activeItems: {
        label: "Active items",
        value: activeItems.length
      },
      consumedToday: {
        label: "Consumed today",
        value: todayConsumption.length
      },
      lowStockItems: {
        label: "Low stock",
        value: lowStockAlerts.filter((alert) => alert.currentQuantity > 0).length
      },
      outOfStockItems: {
        label: "Out of stock",
        value: lowStockAlerts.filter((alert) => alert.currentQuantity <= 0).length
      },
      productionRunsToday: {
        label: "Production runs today",
        ...(productionRunsUnavailable
          ? unavailableMetricStatus
          : { status: "available" as const, value: productionRunsResult.runs.length })
      },
      receivedToday: {
        label: "Received today",
        value: todayReceives.length
      }
    },
    productionRuns: productionRunsResult.runs,
    productionRunsUnavailable,
    recentActivity: recentTransactions.map(toInventoryDashboardActivity),
    todayConsumption,
    todayReceives,
    visibleItemBalances
  };
}

export function useInventoryDashboard(): InventoryDashboardState & {
  canViewDashboard: boolean;
  refresh: () => void;
} {
  const auth = useAuth();
  const permissions = useInventoryPermissions();
  const availability = useContext(InventoryAvailabilityContext);
  const catalogQueries = useInventoryCatalogQueries();
  const productionRunRepository = useRecipeProductionRunRepository();
  const visibility = useInventoryVisibility();
  const organizationId = auth.currentOrganization?.id;
  const templeId = auth.currentTemple?.id;
  const canViewDashboard = permissions.canAdjustInventory;
  const [refreshIndex, setRefreshIndex] = useState(0);
  const [state, setState] = useState<InventoryDashboardState>(initialInventoryDashboardState);

  useEffect(() => {
    if (!canViewDashboard || !organizationId || !templeId) {
      setState(initialInventoryDashboardState);
      return;
    }

    if (availability.status !== "ready") {
      setState({
        ...initialInventoryDashboardState,
        error: "Inventory services are unavailable."
      });
      return;
    }

    let isActive = true;
    const currentOrganizationId = organizationId;
    const currentTempleId = templeId;

    async function load() {
      setState((currentState) => ({
        ...currentState,
        error: null,
        isLoading: true
      }));

      try {
        const data = await loadInventoryDashboard({
          catalogQueries,
          organizationId: currentOrganizationId,
          productionRunRepository,
          templeId: currentTempleId,
          visibility
        });

        if (isActive) {
          setState({
            error: null,
            isLoading: false,
            lowStockAlerts: data.lowStockAlerts,
            metrics: data.metrics,
            recentActivity: data.recentActivity
          });
        }
      } catch (error) {
        if (isActive) {
          setState({
            ...initialInventoryDashboardState,
            error: error instanceof Error ? error.message : "Inventory dashboard failed to load."
          });
        }
      }
    }

    void load();

    return () => {
      isActive = false;
    };
  }, [
    availability.status,
    canViewDashboard,
    catalogQueries,
    organizationId,
    productionRunRepository,
    refreshIndex,
    templeId,
    visibility
  ]);

  return {
    ...state,
    canViewDashboard,
    refresh() {
      setRefreshIndex((currentIndex) => currentIndex + 1);
    }
  };
}
