import assert from "node:assert/strict";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@krishnas-kitchen/types";
import { describe, it } from "vitest";

import {
  createReceivingTransaction,
  createReturnedTransaction,
  createReversalTransaction,
  createTransferTransaction
} from "../../domain/transactionHelpers";
import type { InventoryTransaction, InventoryTransactionDraft } from "../../domain/types";
import type { InventoryTransactionRow } from "./inventoryTransactionMapper";
import { InventoryPersistenceError } from "./receivingPersistence";
import { createSupabaseInventoryTransactionRepository } from "./supabaseInventoryTransactionRepository";

type SupabaseError = {
  message: string;
};

type InsertResult = {
  data: InventoryTransactionRow | null;
  error: SupabaseError | null;
};

class SupabaseClientStub {
  readonly calls: Array<{ args: Record<string, unknown>; functionName: string }> = [];
  readonly tables: string[] = [];

  constructor(private readonly result: InsertResult) {}

  from(table: string): never {
    this.tables.push(table);
    throw new Error(`Unexpected table query: ${table}`);
  }

  rpc(functionName: string, args: Record<string, unknown>): Promise<InsertResult> {
    this.calls.push({ args, functionName });
    return Promise.resolve(this.result);
  }
}

const receivingDraft = createReceivingTransaction({
  actor: {
    tempSessionId: "session-1",
    type: "temporary_volunteer"
  },
  auditMetadata: {
    deviceId: "phone-1",
    source: "offline_queue"
  },
  itemId: "rice",
  locationId: "pantry",
  organizationId: "org-1",
  quantity: 25,
  templeId: "temple-1",
  unit: "kg"
});

const receivingRow: InventoryTransactionRow = {
  actor_temp_session_id: "session-1",
  actor_type: "temporary_volunteer",
  actor_user_id: null,
  audit_metadata: {
    clientRequestId: receivingDraft.auditMetadata.clientRequestId,
    deviceId: "phone-1",
    source: "offline_queue"
  },
  created_at: "2026-06-03T07:00:00.000Z",
  destination_location_id: "pantry",
  id: "transaction-1",
  item_id: "rice",
  notes: null,
  organization_id: "org-1",
  quantity: 25,
  quantity_effect: "increase",
  reversal_of_transaction_id: null,
  source_location_id: null,
  temple_id: "temple-1",
  transaction_type: "received",
  unit: "kg"
};

function persisted(
  draft: InventoryTransactionDraft,
  id: string,
  createdAt = "2026-06-03T07:00:00.000Z"
): InventoryTransaction {
  return {
    ...draft,
    createdAt,
    id
  };
}

function rowFromDraft(draft: InventoryTransactionDraft, id: string): InventoryTransactionRow {
  return {
    actor_temp_session_id:
      draft.actor.type === "temporary_volunteer" ? draft.actor.tempSessionId : null,
    actor_type: draft.actor.type,
    actor_user_id: draft.actor.type === "user" ? draft.actor.userId : null,
    audit_metadata: draft.auditMetadata,
    created_at: "2026-06-03T07:00:00.000Z",
    destination_location_id: draft.destinationLocationId,
    id,
    item_id: draft.itemId,
    notes: draft.notes,
    organization_id: draft.organizationId,
    quantity: draft.quantity,
    quantity_effect: draft.quantityEffect,
    reversal_of_transaction_id: draft.reversalOfTransactionId,
    source_location_id: draft.sourceLocationId,
    temple_id: draft.templeId,
    transaction_type: draft.transactionType,
    unit: draft.unit
  };
}

function createRepository(stub: SupabaseClientStub) {
  return createSupabaseInventoryTransactionRepository(stub as unknown as SupabaseClient<Database>);
}

describe("Supabase inventory transaction repository", () => {
  it("persists receiving transactions through the guarded append function", async () => {
    const stub = new SupabaseClientStub({
      data: receivingRow,
      error: null
    });
    const repository = createRepository(stub);

    const transaction = await repository.createReceivingTransaction(receivingDraft);

    assert.deepEqual(stub.tables, []);
    assert.equal(stub.calls[0]?.functionName, "append_inventory_transaction");
    assert.equal(stub.calls[0]?.args.p_transaction_type, "received");
    assert.equal(stub.calls[0]?.args.p_quantity_effect, "increase");
    assert.equal(stub.calls[0]?.args.p_quantity, 25);
    assert.equal(stub.calls[0]?.args.p_source_location_id, null);
    assert.equal(stub.calls[0]?.args.p_destination_location_id, "pantry");
    assert.equal(stub.calls[0]?.args.p_organization_id, "org-1");
    assert.deepEqual(stub.calls[0]?.args.p_audit_metadata, receivingRow.audit_metadata);
    assert.equal(transaction.transactionType, "received");
    assert.equal(transaction.auditMetadata.clientRequestId, receivingDraft.clientId);
  });

  it("persists transfer transactions with explicit source and destination movement", async () => {
    const draft = createTransferTransaction({
      actor: {
        type: "user",
        userId: "user-1"
      },
      itemId: "rice",
      organizationId: "org-1",
      quantity: 10,
      sourceLocationId: "trailer",
      destinationLocationId: "pantry",
      templeId: "temple-1",
      unit: "kg"
    });
    const stub = new SupabaseClientStub({
      data: rowFromDraft(draft, "transfer-1"),
      error: null
    });
    const repository = createRepository(stub);

    const transaction = await repository.createTransaction(draft);

    assert.equal(stub.calls[0]?.args.p_transaction_type, "transfer");
    assert.equal(stub.calls[0]?.args.p_quantity_effect, "transfer");
    assert.equal(stub.calls[0]?.args.p_source_location_id, "trailer");
    assert.equal(stub.calls[0]?.args.p_destination_location_id, "pantry");
    assert.equal(transaction.transactionType, "transfer");
  });

  it("persists return transactions with transfer movement semantics", async () => {
    const draft = createReturnedTransaction({
      actor: {
        type: "user",
        userId: "user-1"
      },
      itemId: "rice",
      organizationId: "org-1",
      quantity: 4,
      sourceLocationId: "kitchen",
      destinationLocationId: "pantry",
      templeId: "temple-1",
      unit: "kg"
    });
    const stub = new SupabaseClientStub({
      data: rowFromDraft(draft, "return-1"),
      error: null
    });
    const repository = createRepository(stub);

    const transaction = await repository.createTransaction(draft);

    assert.equal(stub.calls[0]?.args.p_transaction_type, "returned");
    assert.equal(stub.calls[0]?.args.p_quantity_effect, "transfer");
    assert.equal(stub.calls[0]?.args.p_source_location_id, "kitchen");
    assert.equal(stub.calls[0]?.args.p_destination_location_id, "pantry");
    assert.equal(transaction.transactionType, "returned");
  });

  it("persists reversal transactions without mutating the original transaction", async () => {
    const original = persisted(
      createTransferTransaction({
        actor: {
          type: "user",
          userId: "user-1"
        },
        itemId: "rice",
        organizationId: "org-1",
        quantity: 7,
        sourceLocationId: "trailer",
        destinationLocationId: "pantry",
        templeId: "temple-1",
        unit: "kg"
      }),
      "transfer-1"
    );
    const draft = createReversalTransaction(original, {
      actor: {
        type: "user",
        userId: "user-1"
      }
    });
    const stub = new SupabaseClientStub({
      data: rowFromDraft(draft, "reversal-1"),
      error: null
    });
    const repository = createRepository(stub);

    const transaction = await repository.createTransaction(draft);

    assert.equal(stub.calls[0]?.args.p_transaction_type, "reversal");
    assert.equal(stub.calls[0]?.args.p_quantity_effect, "transfer");
    assert.equal(stub.calls[0]?.args.p_source_location_id, "pantry");
    assert.equal(stub.calls[0]?.args.p_destination_location_id, "trailer");
    assert.equal(stub.calls[0]?.args.p_reversal_of_transaction_id, "transfer-1");
    assert.equal(transaction.transactionType, "reversal");
    assert.equal(transaction.reversalOfTransactionId, "transfer-1");
  });

  it("wraps Supabase insert failures in inventory persistence errors", async () => {
    const stub = new SupabaseClientStub({
      data: null,
      error: {
        message: "insert failed"
      }
    });
    const repository = createRepository(stub);

    await assert.rejects(
      () => repository.createReceivingTransaction(receivingDraft),
      (error: unknown) =>
        error instanceof InventoryPersistenceError &&
        error.operation === "create_receiving_transaction" &&
        error.cause !== undefined
    );
  });

  it("treats missing inserted rows as persistence failures", async () => {
    const stub = new SupabaseClientStub({
      data: null,
      error: null
    });
    const repository = createRepository(stub);

    await assert.rejects(
      () => repository.createReceivingTransaction(receivingDraft),
      (error: unknown) =>
        error instanceof InventoryPersistenceError &&
        error.operation === "create_receiving_transaction"
    );
  });
});
