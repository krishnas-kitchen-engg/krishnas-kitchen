import assert from "node:assert/strict";
import { describe, it } from "vitest";

import type {
  InventoryActor,
  InventoryBalance,
  InventoryCatalogItem,
  InventoryCatalogLocation,
  InventoryService,
  InventoryTransaction,
  InventoryVisibilityService
} from "@/domains/inventory";

import type { RecipeRepositoryRecord } from "./recipeRepository";
import type {
  RecipeProductionRunRecord,
  RecipeProductionRunRepository
} from "./recipeProductionRepository";
import {
  createRecipeProductionService,
  RecipeProductionRollbackError,
  RecipeProductionValidationError
} from "./recipeProductionService";

const actor: InventoryActor = {
  type: "user",
  userId: "manager-1"
};

const recipe: RecipeRepositoryRecord = {
  createdAt: "2026-07-20T00:00:00.000Z",
  id: "recipe-khichdi",
  ingredients: [
    {
      itemId: "item-rice",
      quantity: 5,
      unit: "kg"
    },
    {
      itemId: "item-dal",
      quantity: 2,
      unit: "kg"
    }
  ],
  isActive: true,
  name: "Khichdi",
  organizationId: "org-1",
  servings: 25,
  templeId: "temple-1",
  updatedAt: "2026-07-20T00:00:00.000Z",
  version: 1
};

const location: InventoryCatalogLocation = {
  deletedAt: null,
  id: "pantry",
  name: "Pantry",
  organizationId: "org-1",
  templeId: "temple-1"
};

const items: InventoryCatalogItem[] = [
  {
    barcodes: [],
    defaultUnit: "kg",
    deletedAt: null,
    id: "item-rice",
    name: "Rice",
    organizationId: "org-1"
  },
  {
    barcodes: [],
    defaultUnit: "kg",
    deletedAt: null,
    id: "item-dal",
    name: "Dal",
    organizationId: "org-1"
  }
];

function createService(options: {
  balances: readonly InventoryBalance[];
  failConsumptionForItemId?: string;
  failProductionRun?: boolean;
  failReversalForTransactionId?: string;
  itemOverrides?: Map<string, InventoryCatalogItem | null>;
}) {
  const reversals: string[] = [];
  const transactions: InventoryTransaction[] = [];
  const productionRuns: RecipeProductionRunRecord[] = [];
  const service = createRecipeProductionService({
    catalog: {
      findProductionItem(_organizationId, itemId) {
        return Promise.resolve(
          options.itemOverrides?.get(itemId) ?? items.find((item) => item.id === itemId) ?? null
        );
      },
      findProductionLocation() {
        return Promise.resolve(location);
      }
    },
    inventoryService: {
      consumeInventory(input: Parameters<InventoryService["consumeInventory"]>[0]) {
        if (input.itemId === options.failConsumptionForItemId) {
          return Promise.reject(new Error("Consumption write failed."));
        }

        const transaction: InventoryTransaction = {
          actor: input.actor,
          auditMetadata: input.auditMetadata ?? {},
          createdAt: "2026-07-20T01:00:00.000Z",
          destinationLocationId: null,
          id: `tx-${transactions.length + 1}`,
          itemId: input.itemId,
          notes: input.notes ?? null,
          organizationId: input.organizationId,
          quantity: input.quantity,
          quantityEffect: "decrease",
          reversalOfTransactionId: null,
          sourceLocationId: input.locationId,
          templeId: input.templeId,
          transactionType: "consumed",
          unit: input.unit
        };
        transactions.push(transaction);

        return Promise.resolve(transaction);
      },
      undoTransaction(transactionId: string) {
        reversals.push(transactionId);

        if (transactionId === options.failReversalForTransactionId) {
          return Promise.reject(new Error("Reversal write failed."));
        }

        return Promise.resolve({
          ...transactions.find((transaction) => transaction.id === transactionId)!,
          id: `reversal-${transactionId}`,
          quantityEffect: "increase",
          reversalOfTransactionId: transactionId,
          transactionType: "reversal"
        });
      }
    } as unknown as InventoryService,
    productionRunRepository: {
      createProductionRun(input) {
        if (options.failProductionRun) {
          return Promise.reject(new Error("Production run write failed."));
        }

        const run: RecipeProductionRunRecord = {
          ...input,
          createdAt: "2026-07-20T01:00:00.000Z",
          id: `run-${productionRuns.length + 1}`
        };
        productionRuns.push(run);

        return Promise.resolve(run);
      },
      listProductionRuns() {
        return Promise.resolve([...productionRuns]);
      }
    } satisfies RecipeProductionRunRepository,
    visibilityService: {
      getVisibleBalances() {
        return Promise.resolve([...options.balances]);
      }
    } as unknown as InventoryVisibilityService
  });

  return {
    productionRuns,
    reversals,
    service,
    transactions
  };
}

describe("recipe production service", () => {
  it("records a production run and consumes scaled ingredients through inventory service", async () => {
    const { productionRuns, service, transactions } = createService({
      balances: [
        {
          itemId: "item-rice",
          locationId: "pantry",
          organizationId: "org-1",
          quantity: 12,
          templeId: "temple-1",
          unit: "kg"
        },
        {
          itemId: "item-dal",
          locationId: "pantry",
          organizationId: "org-1",
          quantity: 6,
          templeId: "temple-1",
          unit: "kg"
        }
      ]
    });

    const result = await service.executeProductionRun({
      actor,
      locationId: "pantry",
      notes: "Festival lunch",
      organizationId: "org-1",
      permission: "granted",
      recipe,
      targetServings: 50,
      templeId: "temple-1"
    });

    assert.equal(result.productionRun.servings, 50);
    assert.equal(result.productionRun.batchCount, 2);
    assert.equal(result.transactions.length, 2);
    assert.deepEqual(
      transactions.map(
        (transaction) => `${transaction.itemId}:${transaction.quantity}:${transaction.unit}`
      ),
      ["item-rice:10:kg", "item-dal:4:kg"]
    );
    assert.deepEqual(productionRuns[0]?.consumptionTransactionIds, ["tx-1", "tx-2"]);
  });

  it("fails before consuming inventory when scaled ingredients are short", async () => {
    const { productionRuns, service, transactions } = createService({
      balances: [
        {
          itemId: "item-rice",
          locationId: "pantry",
          organizationId: "org-1",
          quantity: 4,
          templeId: "temple-1",
          unit: "kg"
        }
      ]
    });

    await assert.rejects(
      () =>
        service.executeProductionRun({
          actor,
          locationId: "pantry",
          organizationId: "org-1",
          permission: "granted",
          recipe,
          targetServings: 50,
          templeId: "temple-1"
        }),
      RecipeProductionValidationError
    );
    assert.equal(transactions.length, 0);
    assert.equal(productionRuns.length, 0);
  });

  it("rejects inactive recipes", async () => {
    const { service } = createService({ balances: [] });

    await assert.rejects(
      () =>
        service.executeProductionRun({
          actor,
          locationId: "pantry",
          organizationId: "org-1",
          permission: "granted",
          recipe: {
            ...recipe,
            isActive: false
          },
          targetServings: 25,
          templeId: "temple-1"
        }),
      RecipeProductionValidationError
    );
  });

  it("fails before consuming inventory when an ingredient is unavailable for consumption", async () => {
    const { productionRuns, service, transactions } = createService({
      balances: [
        {
          itemId: "item-rice",
          locationId: "pantry",
          organizationId: "org-1",
          quantity: 10,
          templeId: "temple-1",
          unit: "kg"
        },
        {
          itemId: "item-dal",
          locationId: "pantry",
          organizationId: "org-1",
          quantity: 10,
          templeId: "temple-1",
          unit: "kg"
        }
      ],
      itemOverrides: new Map([
        [
          "item-dal",
          {
            ...items[1],
            consumptionUnits: ["unit"]
          } as InventoryCatalogItem
        ]
      ])
    });

    await assert.rejects(
      () =>
        service.executeProductionRun({
          actor,
          locationId: "pantry",
          organizationId: "org-1",
          permission: "granted",
          recipe,
          targetServings: 50,
          templeId: "temple-1"
        }),
      RecipeProductionValidationError
    );
    assert.equal(transactions.length, 0);
    assert.equal(productionRuns.length, 0);
  });

  it("rolls back consumed ingredients if a later consumption write fails", async () => {
    const { productionRuns, reversals, service, transactions } = createService({
      balances: [
        {
          itemId: "item-rice",
          locationId: "pantry",
          organizationId: "org-1",
          quantity: 10,
          templeId: "temple-1",
          unit: "kg"
        },
        {
          itemId: "item-dal",
          locationId: "pantry",
          organizationId: "org-1",
          quantity: 10,
          templeId: "temple-1",
          unit: "kg"
        }
      ],
      failConsumptionForItemId: "item-dal"
    });

    await assert.rejects(
      () =>
        service.executeProductionRun({
          actor,
          locationId: "pantry",
          organizationId: "org-1",
          permission: "granted",
          recipe,
          targetServings: 50,
          templeId: "temple-1"
        }),
      /Consumption write failed/
    );
    assert.deepEqual(
      transactions.map((transaction) => transaction.id),
      ["tx-1"]
    );
    assert.deepEqual(reversals, ["tx-1"]);
    assert.equal(productionRuns.length, 0);
  });

  it("rolls back consumed ingredients if production run persistence fails", async () => {
    const { productionRuns, reversals, service, transactions } = createService({
      balances: [
        {
          itemId: "item-rice",
          locationId: "pantry",
          organizationId: "org-1",
          quantity: 10,
          templeId: "temple-1",
          unit: "kg"
        },
        {
          itemId: "item-dal",
          locationId: "pantry",
          organizationId: "org-1",
          quantity: 10,
          templeId: "temple-1",
          unit: "kg"
        }
      ],
      failProductionRun: true
    });

    await assert.rejects(
      () =>
        service.executeProductionRun({
          actor,
          locationId: "pantry",
          organizationId: "org-1",
          permission: "granted",
          recipe,
          targetServings: 50,
          templeId: "temple-1"
        }),
      /Production run write failed/
    );
    assert.deepEqual(
      transactions.map((transaction) => transaction.id),
      ["tx-1", "tx-2"]
    );
    assert.deepEqual(reversals, ["tx-2", "tx-1"]);
    assert.equal(productionRuns.length, 0);
  });

  it("attempts every rollback and reports incomplete compensation", async () => {
    const { reversals, service } = createService({
      balances: [
        {
          itemId: "item-rice",
          locationId: "pantry",
          organizationId: "org-1",
          quantity: 10,
          templeId: "temple-1",
          unit: "kg"
        },
        {
          itemId: "item-dal",
          locationId: "pantry",
          organizationId: "org-1",
          quantity: 10,
          templeId: "temple-1",
          unit: "kg"
        }
      ],
      failProductionRun: true,
      failReversalForTransactionId: "tx-2"
    });

    await assert.rejects(
      () =>
        service.executeProductionRun({
          actor,
          locationId: "pantry",
          organizationId: "org-1",
          permission: "granted",
          recipe,
          targetServings: 50,
          templeId: "temple-1"
        }),
      (error: unknown) =>
        error instanceof RecipeProductionRollbackError &&
        error.failedTransactionIds.join(",") === "tx-2" &&
        error.cause instanceof Error &&
        error.cause.message === "Production run write failed."
    );
    assert.deepEqual(reversals, ["tx-2", "tx-1"]);
  });

  it("rejects denied production permission before consuming inventory", async () => {
    const { productionRuns, service, transactions } = createService({
      balances: [
        {
          itemId: "item-rice",
          locationId: "pantry",
          organizationId: "org-1",
          quantity: 10,
          templeId: "temple-1",
          unit: "kg"
        },
        {
          itemId: "item-dal",
          locationId: "pantry",
          organizationId: "org-1",
          quantity: 10,
          templeId: "temple-1",
          unit: "kg"
        }
      ]
    });

    await assert.rejects(
      () =>
        service.executeProductionRun({
          actor,
          locationId: "pantry",
          organizationId: "org-1",
          permission: "denied",
          recipe,
          targetServings: 50,
          templeId: "temple-1"
        }),
      RecipeProductionValidationError
    );
    assert.equal(transactions.length, 0);
    assert.equal(productionRuns.length, 0);
  });
});
