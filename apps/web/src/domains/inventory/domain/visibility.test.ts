import assert from "node:assert/strict";
import { describe, it } from "vitest";

import {
  createReceivingTransaction,
  createReversalTransaction,
  createReturnedTransaction,
  createTransferTransaction
} from "./transactionHelpers";
import type { InventoryTransaction } from "./types";
import {
  detectLowStock,
  projectInventoryBalances,
  projectInventorySummary,
  projectItemBalances,
  projectLocationBalances,
  projectTransactionHistory
} from "./visibility";

const actor = {
  type: "user" as const,
  userId: "manager-1"
};

function persisted(
  transaction: Omit<InventoryTransaction, "createdAt" | "id">,
  id: string,
  createdAt: string
): InventoryTransaction {
  return {
    ...transaction,
    createdAt,
    id
  };
}

const receivedTrailer = persisted(
  createReceivingTransaction({
    actor,
    itemId: "rice",
    locationId: "trailer",
    organizationId: "org-1",
    quantity: 50,
    templeId: "temple-1",
    unit: "kg"
  }),
  "received-trailer",
  "2026-06-04T08:00:00.000Z"
);

const transferToPantry = persisted(
  createTransferTransaction({
    actor,
    destinationLocationId: "pantry",
    itemId: "rice",
    organizationId: "org-1",
    quantity: 20,
    sourceLocationId: "trailer",
    templeId: "temple-1",
    unit: "kg"
  }),
  "transfer-pantry",
  "2026-06-04T08:05:00.000Z"
);

const returnedToPantry = persisted(
  createReturnedTransaction({
    actor,
    destinationLocationId: "pantry",
    itemId: "rice",
    organizationId: "org-1",
    quantity: 5,
    sourceLocationId: "kitchen",
    templeId: "temple-1",
    unit: "kg"
  }),
  "returned-pantry",
  "2026-06-04T08:10:00.000Z"
);

const reversalOfTransfer = persisted(
  createReversalTransaction(transferToPantry, {
    actor,
    auditMetadata: {
      reason: "wrong movement"
    }
  }),
  "reversal-transfer",
  "2026-06-04T08:15:00.000Z"
);

const otherOrganizationReceived = persisted(
  createReceivingTransaction({
    actor,
    itemId: "rice",
    locationId: "pantry",
    organizationId: "org-2",
    quantity: 999,
    templeId: "temple-2",
    unit: "kg"
  }),
  "other-org-received",
  "2026-06-04T08:20:00.000Z"
);

const transactions = [
  receivedTrailer,
  transferToPantry,
  returnedToPantry,
  reversalOfTransfer,
  otherOrganizationReceived
] satisfies InventoryTransaction[];

describe("inventory visibility projections", () => {
  it("projects deterministic balances from transactions without mutable balance state", () => {
    const balances = projectInventoryBalances(transactions, {
      organizationId: "org-1",
      templeId: "temple-1"
    });

    assert.deepEqual(
      balances.map((balance) => ({
        itemId: balance.itemId,
        locationId: balance.locationId,
        quantity: balance.quantity,
        unit: balance.unit
      })),
      [
        {
          itemId: "rice",
          locationId: "kitchen",
          quantity: -5,
          unit: "kg"
        },
        {
          itemId: "rice",
          locationId: "pantry",
          quantity: 5,
          unit: "kg"
        },
        {
          itemId: "rice",
          locationId: "trailer",
          quantity: 50,
          unit: "kg"
        }
      ]
    );
  });

  it("projects item and location balances for scoped visibility", () => {
    const scope = {
      organizationId: "org-1",
      templeId: "temple-1"
    };
    const itemBalances = projectItemBalances(transactions, scope);
    const locationBalances = projectLocationBalances(transactions, scope);

    assert.deepEqual(itemBalances, [
      {
        itemId: "rice",
        organizationId: "org-1",
        quantity: 50,
        templeId: "temple-1",
        unit: "kg"
      }
    ]);
    assert.deepEqual(
      locationBalances.map((locationBalance) => ({
        itemCount: locationBalance.itemBalances.length,
        locationId: locationBalance.locationId
      })),
      [
        {
          itemCount: 1,
          locationId: "kitchen"
        },
        {
          itemCount: 1,
          locationId: "pantry"
        },
        {
          itemCount: 1,
          locationId: "trailer"
        }
      ]
    );
  });

  it("projects inventory summary and transaction history", () => {
    const scope = {
      organizationId: "org-1",
      templeId: "temple-1"
    };
    const summary = projectInventorySummary(transactions, scope);
    const history = projectTransactionHistory(transactions, {
      ...scope,
      limit: 2
    });

    assert.deepEqual(summary, {
      balanceCount: 3,
      itemCount: 1,
      locationCount: 3,
      organizationId: "org-1",
      templeId: "temple-1",
      transactionCount: 4
    });
    assert.deepEqual(
      history.map((transaction) => transaction.id),
      ["reversal-transfer", "returned-pantry"]
    );
  });

  it("detects low stock by item and location from projected balances", () => {
    const balances = projectInventoryBalances(transactions, {
      organizationId: "org-1",
      templeId: "temple-1"
    });
    const alerts = detectLowStock(balances, [
      {
        itemId: "rice",
        locationId: "pantry",
        minimumQuantity: 10,
        organizationId: "org-1",
        templeId: "temple-1",
        unit: "kg"
      },
      {
        itemId: "rice",
        minimumQuantity: 45,
        organizationId: "org-1",
        templeId: "temple-1",
        unit: "kg"
      }
    ]);

    assert.deepEqual(alerts, [
      {
        currentQuantity: 5,
        itemId: "rice",
        locationId: "pantry",
        minimumQuantity: 10,
        organizationId: "org-1",
        shortageQuantity: 5,
        templeId: "temple-1",
        unit: "kg"
      }
    ]);
  });

  it("detects low stock when a threshold exists but current balance is zero", () => {
    const balances = projectInventoryBalances(transactions, {
      organizationId: "org-1",
      templeId: "temple-1"
    });
    const alerts = detectLowStock(balances, [
      {
        itemId: "dal",
        locationId: "pantry",
        minimumQuantity: 12,
        organizationId: "org-1",
        templeId: "temple-1",
        unit: "kg"
      }
    ]);

    assert.deepEqual(alerts, [
      {
        currentQuantity: 0,
        itemId: "dal",
        locationId: "pantry",
        minimumQuantity: 12,
        organizationId: "org-1",
        shortageQuantity: 12,
        templeId: "temple-1",
        unit: "kg"
      }
    ]);
  });
});
