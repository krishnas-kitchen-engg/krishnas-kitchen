import assert from "node:assert/strict";
import { describe, it } from "vitest";

import type { InventoryTransaction } from "@/domains/inventory";

import { initialTransferWorkflowState, transferWorkflowReducer } from "./useTransferWorkflowForm";

const transferTransaction = {
  actor: {
    tempSessionId: "temp-1",
    type: "temporary_volunteer"
  },
  auditMetadata: {
    source: "online"
  },
  createdAt: "2026-06-05T08:00:00.000Z",
  destinationLocationId: "pantry",
  id: "transfer-1",
  itemId: "rice",
  notes: null,
  organizationId: "org-1",
  quantity: 5,
  quantityEffect: "transfer",
  reversalOfTransactionId: null,
  sourceLocationId: "trailer",
  templeId: "temple-1",
  transactionType: "transfer",
  unit: "kg"
} satisfies InventoryTransaction;

describe("transfer workflow reducer", () => {
  it("tracks source location changes", () => {
    const state = transferWorkflowReducer(initialTransferWorkflowState, {
      locationId: "trailer",
      type: "set_source_location"
    });

    assert.equal(state.sourceLocationId, "trailer");
    assert.equal(state.validationErrors.sourceLocationId, undefined);
  });

  it("tracks destination location changes", () => {
    const state = transferWorkflowReducer(initialTransferWorkflowState, {
      locationId: "pantry",
      type: "set_destination_location"
    });

    assert.equal(state.destinationLocationId, "pantry");
    assert.equal(state.validationErrors.destinationLocationId, undefined);
  });

  it("keeps same-location validation correct after edits", () => {
    const sameLocationState = [
      {
        locationId: "trailer",
        type: "set_source_location" as const
      },
      {
        locationId: "trailer",
        type: "set_destination_location" as const
      }
    ].reduce(transferWorkflowReducer, initialTransferWorkflowState);

    assert.equal(
      sameLocationState.validationErrors.sameLocation,
      "Source and destination must be different."
    );

    const correctedState = transferWorkflowReducer(sameLocationState, {
      locationId: "pantry",
      type: "set_destination_location"
    });

    assert.equal(correctedState.validationErrors.sameLocation, undefined);
    assert.equal(correctedState.destinationLocationId, "pantry");
  });

  it("returns to location selection when confirm step locations become the same", () => {
    const confirmState = {
      ...initialTransferWorkflowState,
      destinationLocationId: "pantry",
      sourceLocationId: "trailer",
      step: "confirm" as const
    };

    const state = transferWorkflowReducer(confirmState, {
      locationId: "trailer",
      type: "set_destination_location"
    });

    assert.equal(state.validationErrors.sameLocation, "Source and destination must be different.");
    assert.equal(state.step, "select_locations");
  });

  it("returns to location selection when source location is cleared from confirm step", () => {
    const confirmState = {
      ...initialTransferWorkflowState,
      destinationLocationId: "pantry",
      sourceLocationId: "trailer",
      step: "confirm" as const
    };

    const state = transferWorkflowReducer(confirmState, {
      locationId: "",
      type: "set_source_location"
    });

    assert.equal(state.sourceLocationId, "");
    assert.equal(state.step, "select_locations");
  });

  it("returns to location selection when destination location is cleared from confirm step", () => {
    const confirmState = {
      ...initialTransferWorkflowState,
      destinationLocationId: "pantry",
      sourceLocationId: "trailer",
      step: "confirm" as const
    };

    const state = transferWorkflowReducer(confirmState, {
      locationId: "",
      type: "set_destination_location"
    });

    assert.equal(state.destinationLocationId, "");
    assert.equal(state.step, "select_locations");
  });

  it("stores successful transfer histories returned through visibility", () => {
    const state = transferWorkflowReducer(initialTransferWorkflowState, {
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
      recentDestinationLocationTransactions: [transferTransaction],
      recentItemTransactions: [transferTransaction],
      recentSourceLocationTransactions: [transferTransaction],
      sourceBalances: [
        {
          itemId: "rice",
          locationId: "trailer",
          organizationId: "org-1",
          quantity: 10,
          templeId: "temple-1",
          unit: "kg"
        }
      ],
      transferTransaction,
      type: "transfer_succeeded"
    });

    assert.equal(state.step, "success");
    assert.equal(state.transferTransaction?.id, "transfer-1");
    assert.deepEqual(
      state.recentItemTransactions.map((transaction) => transaction.id),
      ["transfer-1"]
    );
    assert.deepEqual(
      state.recentSourceLocationTransactions.map((transaction) => transaction.id),
      ["transfer-1"]
    );
    assert.deepEqual(
      state.recentDestinationLocationTransactions.map((transaction) => transaction.id),
      ["transfer-1"]
    );
  });

  it("resets after success so volunteers can transfer another item", () => {
    const successState = transferWorkflowReducer(initialTransferWorkflowState, {
      destinationBalances: [],
      recentDestinationLocationTransactions: [transferTransaction],
      recentItemTransactions: [transferTransaction],
      recentSourceLocationTransactions: [transferTransaction],
      sourceBalances: [],
      transferTransaction,
      type: "transfer_succeeded"
    });

    const resetState = transferWorkflowReducer(successState, {
      type: "reset"
    });

    assert.deepEqual(resetState, initialTransferWorkflowState);
  });
});
