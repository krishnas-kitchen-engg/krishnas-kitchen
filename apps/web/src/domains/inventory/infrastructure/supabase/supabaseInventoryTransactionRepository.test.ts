import assert from "node:assert/strict";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@krishnas-kitchen/types";
import { describe, it } from "vitest";

import { createReceivingTransaction } from "../../domain/transactionHelpers";
import type {
  InventoryTransactionInsert,
  InventoryTransactionRow
} from "./inventoryTransactionMapper";
import { InventoryPersistenceError } from "./receivingPersistence";
import { createSupabaseInventoryTransactionRepository } from "./supabaseInventoryTransactionRepository";

type SupabaseError = {
  message: string;
};

type InsertResult = {
  data: InventoryTransactionRow | null;
  error: SupabaseError | null;
};

class InsertQuery {
  inserted: InventoryTransactionInsert | null = null;

  constructor(private readonly result: InsertResult) {}

  insert(payload: InventoryTransactionInsert): this {
    this.inserted = payload;
    return this;
  }

  select(_columns: string): this {
    return this;
  }

  single(): Promise<InsertResult> {
    return Promise.resolve(this.result);
  }
}

class SupabaseClientStub {
  readonly insertQuery: InsertQuery;
  readonly tables: string[] = [];

  constructor(result: InsertResult) {
    this.insertQuery = new InsertQuery(result);
  }

  from(table: string): InsertQuery {
    this.tables.push(table);
    return this.insertQuery;
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

function createRepository(stub: SupabaseClientStub) {
  return createSupabaseInventoryTransactionRepository(stub as unknown as SupabaseClient<Database>);
}

describe("Supabase inventory transaction repository", () => {
  it("persists receiving transactions through one append-only insert", async () => {
    const stub = new SupabaseClientStub({
      data: receivingRow,
      error: null
    });
    const repository = createRepository(stub);

    const transaction = await repository.createReceivingTransaction(receivingDraft);

    assert.deepEqual(stub.tables, ["inventory_transactions"]);
    assert.equal(stub.insertQuery.inserted?.transaction_type, "received");
    assert.equal(stub.insertQuery.inserted?.quantity_effect, "increase");
    assert.equal(stub.insertQuery.inserted?.quantity, 25);
    assert.equal(stub.insertQuery.inserted?.source_location_id, null);
    assert.equal(stub.insertQuery.inserted?.destination_location_id, "pantry");
    assert.equal(stub.insertQuery.inserted?.organization_id, "org-1");
    assert.deepEqual(stub.insertQuery.inserted?.audit_metadata, receivingRow.audit_metadata);
    assert.equal(transaction.transactionType, "received");
    assert.equal(transaction.auditMetadata.clientRequestId, receivingDraft.clientId);
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
