import assert from "node:assert/strict";
import { describe, it } from "vitest";

import { createReceivingTransaction } from "../../domain/transactionHelpers";
import type { InventoryTransactionRow } from "./inventoryTransactionMapper";
import {
  mapInventoryTransactionDraftToInsert,
  mapInventoryTransactionRow
} from "./inventoryTransactionMapper";
import {
  InventoryPersistenceError,
  assertPersistableReceivingTransactionDraft,
  mapReceivingTransactionDraftToInsert
} from "./receivingPersistence";

const receivingDraft = createReceivingTransaction({
  actor: {
    type: "user",
    userId: "user-1"
  },
  auditMetadata: {
    deviceId: "phone-1",
    source: "offline_queue"
  },
  itemId: "item-1",
  locationId: "location-1",
  notes: "delivery",
  organizationId: "org-1",
  quantity: 12,
  templeId: "temple-1",
  unit: "kg"
});

describe("inventory transaction mapper", () => {
  it("maps receiving drafts to append-only Supabase insert shape", () => {
    const insert = mapReceivingTransactionDraftToInsert(receivingDraft);

    assert.equal(insert.transaction_type, "received");
    assert.equal(insert.quantity_effect, "increase");
    assert.equal(insert.quantity, 12);
    assert.equal(insert.destination_location_id, "location-1");
    assert.equal(insert.source_location_id, null);
    assert.equal(insert.reversal_of_transaction_id, null);
    assert.equal(insert.organization_id, "org-1");
    assert.deepEqual(insert.audit_metadata, {
      clientRequestId: receivingDraft.auditMetadata.clientRequestId,
      deviceId: "phone-1",
      source: "offline_queue"
    });
  });

  it("preserves receiving transaction fields and audit metadata when rows round-trip", () => {
    const insert = mapInventoryTransactionDraftToInsert(receivingDraft);
    const row: InventoryTransactionRow = {
      actor_temp_session_id: insert.actor_temp_session_id ?? null,
      actor_type: insert.actor_type,
      actor_user_id: insert.actor_user_id ?? null,
      audit_metadata: insert.audit_metadata ?? {},
      created_at: "2026-06-03T07:00:00.000Z",
      destination_location_id: insert.destination_location_id ?? null,
      id: "transaction-1",
      item_id: insert.item_id,
      notes: insert.notes ?? null,
      organization_id: insert.organization_id,
      quantity: insert.quantity,
      quantity_effect: insert.quantity_effect,
      reversal_of_transaction_id: insert.reversal_of_transaction_id ?? null,
      source_location_id: insert.source_location_id ?? null,
      temple_id: insert.temple_id,
      transaction_type: insert.transaction_type,
      unit: insert.unit
    };

    const transaction = mapInventoryTransactionRow(row);

    assert.equal(transaction.id, "transaction-1");
    assert.equal(transaction.transactionType, "received");
    assert.equal(transaction.quantityEffect, "increase");
    assert.equal(transaction.quantity, 12);
    assert.equal(transaction.destinationLocationId, "location-1");
    assert.equal(transaction.sourceLocationId, null);
    assert.deepEqual(transaction.auditMetadata, receivingDraft.auditMetadata);
  });

  it("rejects persistence drafts that do not have receiving semantics", () => {
    assert.throws(
      () =>
        assertPersistableReceivingTransactionDraft({
          ...receivingDraft,
          quantityEffect: "decrease",
          sourceLocationId: "pantry",
          transactionType: "consumed"
        } as never),
      InventoryPersistenceError
    );
  });
});
