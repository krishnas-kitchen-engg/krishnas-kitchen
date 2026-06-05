import assert from "node:assert/strict";
import { describe, it } from "vitest";

import type { InventoryTransaction } from "@/domains/inventory";

import { initialReceiveWorkflowState, receiveWorkflowReducer } from "./useReceiveWorkflowForm";

const receivedTransaction = {
  actor: {
    type: "temporary_volunteer",
    tempSessionId: "temp-1"
  },
  auditMetadata: {
    source: "online"
  },
  createdAt: "2026-06-05T08:00:00.000Z",
  destinationLocationId: "pantry",
  id: "received-1",
  itemId: "rice",
  notes: null,
  organizationId: "org-1",
  quantity: 5,
  quantityEffect: "increase",
  reversalOfTransactionId: null,
  sourceLocationId: null,
  templeId: "temple-1",
  transactionType: "received",
  unit: "kg"
} satisfies InventoryTransaction;

describe("receive workflow reducer", () => {
  it("stores successful receive history returned through visibility", () => {
    const state = receiveWorkflowReducer(initialReceiveWorkflowState, {
      balances: [
        {
          itemId: "rice",
          locationId: "pantry",
          organizationId: "org-1",
          quantity: 5,
          templeId: "temple-1",
          unit: "kg"
        }
      ],
      receivedTransaction,
      recentTransactions: [receivedTransaction],
      type: "receive_succeeded"
    });

    assert.equal(state.step, "success");
    assert.equal(state.receivedTransaction?.id, "received-1");
    assert.deepEqual(
      state.recentTransactions.map((transaction) => transaction.id),
      ["received-1"]
    );
  });

  it("resets after success so volunteers can receive another item", () => {
    const successState = receiveWorkflowReducer(initialReceiveWorkflowState, {
      balances: [],
      receivedTransaction,
      recentTransactions: [receivedTransaction],
      type: "receive_succeeded"
    });

    const resetState = receiveWorkflowReducer(successState, {
      type: "reset"
    });

    assert.deepEqual(resetState, initialReceiveWorkflowState);
  });
});
