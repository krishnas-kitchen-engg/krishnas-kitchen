import assert from "node:assert/strict";
import { describe, it } from "vitest";

import type {
  InventoryCatalogItem,
  InventoryCatalogQueryService,
  InventoryLowStockAlert,
  InventoryTransaction,
  InventoryTransactionHistoryQuery,
  InventoryVisibilityService
} from "@/domains/inventory";
import type { RecipeProductionRunRepository } from "@/domains/recipes";

import { loadInventoryDashboard } from "./useInventoryDashboard";

const items: InventoryCatalogItem[] = [
  {
    barcodes: [],
    defaultUnit: "kg",
    deletedAt: null,
    id: "rice",
    name: "Rice",
    organizationId: "org-1"
  },
  {
    barcodes: [],
    defaultUnit: "kg",
    deletedAt: null,
    id: "dal",
    name: "Dal",
    organizationId: "org-1"
  },
  {
    barcodes: [],
    defaultUnit: "kg",
    deletedAt: null,
    id: "ghee",
    name: "Ghee",
    organizationId: "org-1"
  }
];

const lowStockAlerts: InventoryLowStockAlert[] = [
  {
    currentQuantity: 2,
    itemId: "dal",
    locationId: "pantry",
    minimumQuantity: 5,
    organizationId: "org-1",
    shortageQuantity: 3,
    templeId: "temple-1",
    unit: "kg"
  },
  {
    currentQuantity: 0,
    itemId: "ghee",
    locationId: "pantry",
    minimumQuantity: 3,
    organizationId: "org-1",
    shortageQuantity: 3,
    templeId: "temple-1",
    unit: "kg"
  }
];

const transactions: InventoryTransaction[] = [
  {
    actor: {
      type: "user",
      userId: "manager-1"
    },
    auditMetadata: {},
    createdAt: "2026-07-26T10:00:00.000Z",
    destinationLocationId: "pantry",
    id: "receive-today",
    itemId: "rice",
    notes: null,
    organizationId: "org-1",
    quantity: 10,
    quantityEffect: "increase",
    reversalOfTransactionId: null,
    sourceLocationId: null,
    templeId: "temple-1",
    transactionType: "received",
    unit: "kg"
  },
  {
    actor: {
      type: "user",
      userId: "cook-1"
    },
    auditMetadata: {},
    createdAt: "2026-07-26T11:00:00.000Z",
    destinationLocationId: null,
    id: "consume-today",
    itemId: "rice",
    notes: null,
    organizationId: "org-1",
    quantity: 4,
    quantityEffect: "decrease",
    reversalOfTransactionId: null,
    sourceLocationId: "pantry",
    templeId: "temple-1",
    transactionType: "consumed",
    unit: "kg"
  },
  {
    actor: {
      type: "user",
      userId: "manager-1"
    },
    auditMetadata: {},
    createdAt: "2026-07-25T11:00:00.000Z",
    destinationLocationId: "pantry",
    id: "receive-yesterday",
    itemId: "dal",
    notes: null,
    organizationId: "org-1",
    quantity: 2,
    quantityEffect: "increase",
    reversalOfTransactionId: null,
    sourceLocationId: null,
    templeId: "temple-1",
    transactionType: "received",
    unit: "kg"
  }
];

function createCatalogQueries(): InventoryCatalogQueryService {
  return {
    searchItems() {
      return Promise.resolve(items);
    }
  } as unknown as InventoryCatalogQueryService;
}

function createVisibility(): InventoryVisibilityService {
  return {
    getItemBalances() {
      return Promise.resolve([
        {
          itemId: "rice",
          organizationId: "org-1",
          quantity: 6,
          templeId: "temple-1",
          unit: "kg"
        }
      ]);
    },
    getLowStockAlerts() {
      return Promise.resolve(lowStockAlerts);
    },
    getTransactionHistory(query: InventoryTransactionHistoryQuery) {
      const scoped = transactions.filter(
        (transaction) =>
          transaction.organizationId === query.organizationId &&
          transaction.templeId === query.templeId &&
          (!query.transactionType || transaction.transactionType === query.transactionType)
      );

      return Promise.resolve(
        typeof query.limit === "number" ? scoped.slice(0, query.limit) : scoped
      );
    }
  } as unknown as InventoryVisibilityService;
}

function createProductionRunRepository(): RecipeProductionRunRepository {
  return {
    createProductionRun() {
      throw new Error("Dashboard must not create production runs.");
    },
    listProductionRuns() {
      return Promise.resolve([
        {
          actor: {
            type: "user",
            userId: "manager-1"
          },
          batchCount: 1,
          consumptionTransactionIds: ["consume-today"],
          createdAt: "2026-07-26T12:00:00.000Z",
          id: "run-1",
          locationId: "pantry",
          notes: null,
          organizationId: "org-1",
          recipeId: "recipe-1",
          recipeName: "Khichdi",
          recipeVersion: 1,
          servings: 25,
          templeId: "temple-1"
        }
      ]);
    }
  };
}

describe("inventory dashboard loader", () => {
  it("aggregates inventory health and today's activity from existing read models", async () => {
    const dashboard = await loadInventoryDashboard({
      catalogQueries: createCatalogQueries(),
      now: new Date("2026-07-26T13:00:00.000Z"),
      organizationId: "org-1",
      productionRunRepository: createProductionRunRepository(),
      templeId: "temple-1",
      visibility: createVisibility()
    });

    assert.equal(dashboard.metrics.activeItems.value, 3);
    assert.equal(dashboard.metrics.lowStockItems.value, 1);
    assert.equal(dashboard.metrics.outOfStockItems.value, 1);
    assert.equal(dashboard.metrics.receivedToday.value, 1);
    assert.equal(dashboard.metrics.consumedToday.value, 1);
    assert.equal(dashboard.metrics.productionRunsToday.value, 1);
    assert.equal(dashboard.recentActivity[0]?.description, "rice received (+10 kg)");
  });

  it("keeps inventory metrics available when production data is missing", async () => {
    const dashboard = await loadInventoryDashboard({
      catalogQueries: createCatalogQueries(),
      now: new Date("2026-07-26T13:00:00.000Z"),
      organizationId: "org-1",
      productionRunRepository: {
        createProductionRun() {
          throw new Error("Dashboard must not create production runs.");
        },
        listProductionRuns() {
          return Promise.reject(new Error("Production runs unavailable."));
        }
      },
      templeId: "temple-1",
      visibility: createVisibility()
    });

    assert.equal(dashboard.metrics.activeItems.value, 3);
    assert.equal(dashboard.metrics.productionRunsToday.value, "Unavailable");
    assert.equal(dashboard.productionRunsUnavailable, true);
  });
});
