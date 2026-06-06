import assert from "node:assert/strict";
import { describe, it } from "vitest";

import {
  createReceivingTransaction,
  createTransferTransaction
} from "../domain/transactionHelpers";
import type {
  InventoryLowStockThreshold,
  InventoryTransaction,
  InventoryTransactionDraft,
  InventoryTransactionScope,
  ReceivingInventoryTransactionDraft
} from "../domain/types";
import type { InventoryTransactionRepository } from "./inventoryRepository";
import { createInventoryVisibilityService } from "./inventoryVisibilityService";
import { resolveLowStockThresholdPrecedence } from "./inventoryVisibilityService";

function persist(
  draft: InventoryTransactionDraft,
  id: string,
  createdAt: string
): InventoryTransaction {
  return {
    ...draft,
    createdAt,
    id
  };
}

function createMemoryRepository(
  transactions: readonly InventoryTransaction[]
): InventoryTransactionRepository & {
  scopes: InventoryTransactionScope[];
} {
  const scopes: InventoryTransactionScope[] = [];

  return {
    scopes,
    createReceivingTransaction(_draft: ReceivingInventoryTransactionDraft) {
      throw new Error("Visibility tests should not create receiving transactions.");
    },
    createTransaction(_draft: InventoryTransactionDraft) {
      throw new Error("Visibility tests should not create transactions.");
    },
    findTransactionById() {
      return Promise.resolve(null);
    },
    listTransactions(scope) {
      scopes.push(scope);

      return Promise.resolve(
        transactions.filter(
          (transaction) =>
            transaction.organizationId === scope.organizationId &&
            (!scope.templeId || transaction.templeId === scope.templeId) &&
            (!scope.itemId || transaction.itemId === scope.itemId) &&
            (!scope.locationId ||
              transaction.sourceLocationId === scope.locationId ||
              transaction.destinationLocationId === scope.locationId)
        )
      );
    }
  };
}

const actor = {
  type: "user" as const,
  userId: "manager-1"
};

const transactions = [
  persist(
    createReceivingTransaction({
      actor,
      itemId: "rice",
      locationId: "trailer",
      organizationId: "org-1",
      quantity: 30,
      templeId: "temple-1",
      unit: "kg"
    }),
    "received-1",
    "2026-06-04T08:00:00.000Z"
  ),
  persist(
    createTransferTransaction({
      actor,
      destinationLocationId: "pantry",
      itemId: "rice",
      organizationId: "org-1",
      quantity: 10,
      sourceLocationId: "trailer",
      templeId: "temple-1",
      unit: "kg"
    }),
    "transfer-1",
    "2026-06-04T08:05:00.000Z"
  ),
  persist(
    createReceivingTransaction({
      actor,
      itemId: "rice",
      locationId: "pantry",
      organizationId: "org-2",
      quantity: 100,
      templeId: "temple-2",
      unit: "kg"
    }),
    "received-other-org",
    "2026-06-04T08:10:00.000Z"
  )
] satisfies InventoryTransaction[];

describe("inventory visibility service", () => {
  it("returns item, location, summary, history, and low stock projections from transactions", async () => {
    const repository = createMemoryRepository(transactions);
    const service = createInventoryVisibilityService(repository);
    const scope = {
      organizationId: "org-1",
      templeId: "temple-1"
    };

    const itemBalances = await service.getItemBalances(scope);
    const locationBalances = await service.getLocationBalances(scope);
    const summary = await service.getInventorySummary(scope);
    const history = await service.getTransactionHistory({
      ...scope,
      transactionType: "transfer"
    });
    const alerts = await service.getLowStockAlerts(scope, [
      {
        itemId: "rice",
        locationId: "pantry",
        minimumQuantity: 15,
        organizationId: "org-1",
        templeId: "temple-1",
        unit: "kg"
      }
    ]);

    assert.equal(
      repository.scopes.every((requestedScope) => requestedScope.organizationId === "org-1"),
      true
    );
    assert.deepEqual(
      itemBalances.map((balance) => balance.quantity),
      [30]
    );
    assert.deepEqual(
      locationBalances.map((balance) => [balance.locationId, balance.itemBalances.length]),
      [
        ["pantry", 1],
        ["trailer", 1]
      ]
    );
    assert.equal(summary.transactionCount, 2);
    assert.deepEqual(
      history.map((transaction) => transaction.id),
      ["transfer-1"]
    );
    assert.deepEqual(
      alerts.map((alert) => alert.shortageQuantity),
      [5]
    );
  });

  it("loads active low stock thresholds from the repository when none are supplied", async () => {
    const repository = createMemoryRepository(transactions);
    const thresholdScopes: InventoryTransactionScope[] = [];
    const service = createInventoryVisibilityService(repository, {
      lowStockThresholdRepository: {
        listActiveLowStockThresholds(scope) {
          thresholdScopes.push(scope);

          return Promise.resolve([
            {
              itemId: "rice",
              locationId: "pantry",
              minimumQuantity: 15,
              organizationId: "org-1",
              templeId: "temple-1",
              unit: "kg"
            }
          ] satisfies InventoryLowStockThreshold[]);
        }
      }
    });

    const alerts = await service.getLowStockAlerts({
      organizationId: "org-1",
      templeId: "temple-1"
    });

    assert.deepEqual(thresholdScopes, [
      {
        organizationId: "org-1",
        templeId: "temple-1"
      }
    ]);
    assert.deepEqual(
      alerts.map((alert) => alert.shortageQuantity),
      [5]
    );
  });

  it("applies organization thresholds when no narrower threshold exists", () => {
    const thresholds = resolveLowStockThresholdPrecedence(
      [
        {
          itemId: "rice",
          minimumQuantity: 20,
          organizationId: "org-1",
          unit: "kg"
        }
      ],
      {
        locationId: "pantry",
        organizationId: "org-1",
        templeId: "temple-1"
      }
    );

    assert.deepEqual(
      thresholds.map((threshold) => threshold.minimumQuantity),
      [20]
    );
  });

  it("lets temple thresholds override organization thresholds", () => {
    const thresholds = resolveLowStockThresholdPrecedence(
      [
        {
          itemId: "rice",
          minimumQuantity: 20,
          organizationId: "org-1",
          unit: "kg"
        },
        {
          itemId: "rice",
          minimumQuantity: 15,
          organizationId: "org-1",
          templeId: "temple-1",
          unit: "kg"
        }
      ],
      {
        locationId: "pantry",
        organizationId: "org-1",
        templeId: "temple-1"
      }
    );

    assert.deepEqual(
      thresholds.map((threshold) => threshold.minimumQuantity),
      [15]
    );
  });

  it("lets location thresholds override temple and organization thresholds", () => {
    const thresholds = resolveLowStockThresholdPrecedence(
      [
        {
          itemId: "rice",
          minimumQuantity: 20,
          organizationId: "org-1",
          unit: "kg"
        },
        {
          itemId: "rice",
          minimumQuantity: 15,
          organizationId: "org-1",
          templeId: "temple-1",
          unit: "kg"
        },
        {
          itemId: "rice",
          locationId: "pantry",
          minimumQuantity: 10,
          organizationId: "org-1",
          templeId: "temple-1",
          unit: "kg"
        }
      ],
      {
        locationId: "pantry",
        organizationId: "org-1",
        templeId: "temple-1"
      }
    );

    assert.deepEqual(
      thresholds.map((threshold) => threshold.minimumQuantity),
      [10]
    );
  });

  it("does not emit duplicate low-stock alerts when multiple scope levels match", async () => {
    const repository = createMemoryRepository(transactions);
    const service = createInventoryVisibilityService(repository, {
      lowStockThresholdRepository: {
        listActiveLowStockThresholds() {
          return Promise.resolve([
            {
              itemId: "rice",
              minimumQuantity: 20,
              organizationId: "org-1",
              unit: "kg"
            },
            {
              itemId: "rice",
              minimumQuantity: 15,
              organizationId: "org-1",
              templeId: "temple-1",
              unit: "kg"
            },
            {
              itemId: "rice",
              locationId: "pantry",
              minimumQuantity: 12,
              organizationId: "org-1",
              templeId: "temple-1",
              unit: "kg"
            }
          ] satisfies InventoryLowStockThreshold[]);
        }
      }
    });

    const alerts = await service.getLowStockAlerts({
      locationId: "pantry",
      organizationId: "org-1",
      templeId: "temple-1"
    });

    assert.equal(alerts.length, 1);
    assert.equal(alerts[0]?.minimumQuantity, 12);
    assert.equal(alerts[0]?.shortageQuantity, 2);
  });

  it("preserves explicit threshold behavior while applying precedence", async () => {
    const repository = createMemoryRepository(transactions);
    const service = createInventoryVisibilityService(repository);

    const alerts = await service.getLowStockAlerts(
      {
        locationId: "pantry",
        organizationId: "org-1",
        templeId: "temple-1"
      },
      [
        {
          itemId: "rice",
          minimumQuantity: 20,
          organizationId: "org-1",
          unit: "kg"
        },
        {
          itemId: "rice",
          locationId: "pantry",
          minimumQuantity: 12,
          organizationId: "org-1",
          templeId: "temple-1",
          unit: "kg"
        }
      ]
    );

    assert.equal(alerts.length, 1);
    assert.equal(alerts[0]?.minimumQuantity, 12);
  });
});
