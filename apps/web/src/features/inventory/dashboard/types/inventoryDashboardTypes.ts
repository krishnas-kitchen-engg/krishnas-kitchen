import type {
  InventoryLowStockAlert,
  InventoryTransaction,
  InventoryVisibilityService
} from "@/domains/inventory";
import type { InventoryCatalogQueryService, InventoryItemBalance } from "@/domains/inventory";
import type { RecipeProductionRunRecord, RecipeProductionRunRepository } from "@/domains/recipes";

export type InventoryDashboardActivityItem = {
  description: string;
  id: string;
  timestamp: string;
};

export type InventoryDashboardMetric = {
  label: string;
  status?: "available" | "unavailable";
  value: number | string;
};

export type InventoryDashboardState = {
  error: string | null;
  isLoading: boolean;
  lowStockAlerts: readonly InventoryLowStockAlert[];
  metrics: {
    activeItems: InventoryDashboardMetric;
    lowStockItems: InventoryDashboardMetric;
    outOfStockItems: InventoryDashboardMetric;
    productionRunsToday: InventoryDashboardMetric;
    receivedToday: InventoryDashboardMetric;
    consumedToday: InventoryDashboardMetric;
  };
  recentActivity: readonly InventoryDashboardActivityItem[];
};

export type InventoryDashboardLoaderInput = {
  catalogQueries: InventoryCatalogQueryService;
  now?: Date;
  organizationId: string;
  productionRunRepository: RecipeProductionRunRepository;
  templeId: string;
  visibility: InventoryVisibilityService;
};

export type InventoryDashboardData = Omit<InventoryDashboardState, "error" | "isLoading"> & {
  productionRuns: readonly RecipeProductionRunRecord[];
  productionRunsUnavailable: boolean;
  todayConsumption: readonly InventoryTransaction[];
  todayReceives: readonly InventoryTransaction[];
  visibleItemBalances: readonly InventoryItemBalance[];
};
