import assert from "node:assert/strict";
import { describe, it } from "vitest";

import type { InventoryTransaction } from "@/domains/inventory";

import { initialReturnWorkflowState, returnWorkflowReducer } from "./useReturnWorkflowForm";

const returnedTransaction = {
  actor: {
    tempSessionId: "temp-1",
    type: "temporary_volunteer"
  },
  auditMetadata: {
    source: "online"
  },
  createdAt: "2026-06-05T08:00:00.000Z",
  destinationLocationId: "pantry",
  id: "return-1",
  itemId: "rice",
  notes: null,
  organizationId: "org-1",
  quantity: 5,
  quantityEffect: "transfer",
  reversalOfTransactionId: null,
  sourceLocationId: "kitchen",
  templeId: "temple-1",
  transactionType: "returned",
  unit: "kg"
} satisfies InventoryTransaction;

describe("return workflow reducer", () => {
  it("tracks source location changes", () => {
    const state = returnWorkflowReducer(initialReturnWorkflowState, {
      locationId: "kitchen",
      type: "set_source_location"
    });

    assert.equal(state.sourceLocationId, "kitchen");
    assert.equal(state.validationErrors.sourceLocationId, undefined);
  });

  it("tracks destination location changes", () => {
    const state = returnWorkflowReducer(initialReturnWorkflowState, {
      locationId: "pantry",
      type: "set_destination_location"
    });

    assert.equal(state.destinationLocationId, "pantry");
    assert.equal(state.validationErrors.destinationLocationId, undefined);
  });

  it("validates same-location returns", () => {
    const state = [
      {
        locationId: "pantry",
        type: "set_source_location" as const
      },
      {
        locationId: "pantry",
        type: "set_destination_location" as const
      }
    ].reduce(returnWorkflowReducer, initialReturnWorkflowState);

    assert.equal(state.validationErrors.sameLocation, "Source and destination must be different.");
    assert.equal(state.step, "select_locations");
  });

  it("returns to location selection when confirm step locations become the same", () => {
    const confirmState = {
      ...initialReturnWorkflowState,
      destinationLocationId: "pantry",
      sourceLocationId: "kitchen",
      step: "confirm" as const
    };

    const state = returnWorkflowReducer(confirmState, {
      locationId: "kitchen",
      type: "set_destination_location"
    });

    assert.equal(state.validationErrors.sameLocation, "Source and destination must be different.");
    assert.equal(state.step, "select_locations");
  });

  it("returns to location selection when source location is cleared from confirm step", () => {
    const confirmState = {
      ...initialReturnWorkflowState,
      destinationLocationId: "pantry",
      sourceLocationId: "kitchen",
      step: "confirm" as const
    };

    const state = returnWorkflowReducer(confirmState, {
      locationId: "",
      type: "set_source_location"
    });

    assert.equal(state.sourceLocationId, "");
    assert.equal(state.step, "select_locations");
  });

  it("returns to location selection when destination location is cleared from confirm step", () => {
    const confirmState = {
      ...initialReturnWorkflowState,
      destinationLocationId: "pantry",
      sourceLocationId: "kitchen",
      step: "confirm" as const
    };

    const state = returnWorkflowReducer(confirmState, {
      locationId: "",
      type: "set_destination_location"
    });

    assert.equal(state.destinationLocationId, "");
    assert.equal(state.step, "select_locations");
  });

  it("allows invalid same-location state to be corrected and continue", () => {
    const sameLocationState = [
      {
        locationId: "pantry",
        type: "set_source_location" as const
      },
      {
        locationId: "pantry",
        type: "set_destination_location" as const
      }
    ].reduce(returnWorkflowReducer, initialReturnWorkflowState);

    const correctedState = returnWorkflowReducer(sameLocationState, {
      locationId: "storage",
      type: "set_destination_location"
    });

    assert.equal(correctedState.validationErrors.sameLocation, undefined);
    assert.equal(correctedState.destinationLocationId, "storage");
    assert.equal(correctedState.step, "enter_quantity");
  });

  it("stores successful return histories returned through visibility", () => {
    const state = returnWorkflowReducer(initialReturnWorkflowState, {
      destinationBalances: [
        {
          itemId: "rice",
          locationId: "pantry",
          organizationId: "org-1",
          quantity: 5,
          templeId: "temple-1",
          unit: "kg"
        }
      ],
      recentDestinationLocationTransactions: [returnedTransaction],
      recentItemTransactions: [returnedTransaction],
      recentSourceLocationTransactions: [returnedTransaction],
      returnedTransaction,
      sourceBalances: [
        {
          itemId: "rice",
          locationId: "kitchen",
          organizationId: "org-1",
          quantity: 10,
          templeId: "temple-1",
          unit: "kg"
        }
      ],
      type: "return_succeeded"
    });

    assert.equal(state.step, "success");
    assert.equal(state.returnedTransaction?.id, "return-1");
    assert.equal(state.returnedTransaction?.transactionType, "returned");
    assert.deepEqual(
      state.recentItemTransactions.map((transaction) => transaction.id),
      ["return-1"]
    );
    assert.deepEqual(
      state.recentSourceLocationTransactions.map((transaction) => transaction.id),
      ["return-1"]
    );
    assert.deepEqual(
      state.recentDestinationLocationTransactions.map((transaction) => transaction.id),
      ["return-1"]
    );
  });

  it("resets after success so volunteers can return another item", () => {
    const successState = returnWorkflowReducer(initialReturnWorkflowState, {
      destinationBalances: [],
      recentDestinationLocationTransactions: [returnedTransaction],
      recentItemTransactions: [returnedTransaction],
      recentSourceLocationTransactions: [returnedTransaction],
      returnedTransaction,
      sourceBalances: [],
      type: "return_succeeded"
    });

    const resetState = returnWorkflowReducer(successState, {
      type: "reset"
    });

    assert.deepEqual(resetState, initialReturnWorkflowState);
  });
});
