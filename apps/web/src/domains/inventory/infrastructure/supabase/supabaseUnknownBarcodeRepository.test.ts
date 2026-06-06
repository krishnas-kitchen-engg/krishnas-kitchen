import assert from "node:assert/strict";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@krishnas-kitchen/types";
import { describe, it } from "vitest";

import type {
  UnknownBarcodeInsert,
  UnknownBarcodeRow,
  UnknownBarcodeUpdate
} from "./unknownBarcodeMapper";
import { mapUnknownBarcodeRow } from "./unknownBarcodeMapper";
import { createSupabaseUnknownBarcodeRepository } from "./supabaseUnknownBarcodeRepository";

type SupabaseResult<T> = {
  data: T;
  error: null;
};

class UnknownBarcodeQuery implements PromiseLike<SupabaseResult<UnknownBarcodeRow[]>> {
  private filters: Array<(row: UnknownBarcodeRow) => boolean> = [];
  private limitCount: number | null = null;
  private orders: Array<{ column: keyof UnknownBarcodeRow; ascending: boolean }> = [];

  constructor(
    private readonly rows: UnknownBarcodeRow[],
    private readonly stub: SupabaseClientStub
  ) {}

  eq<K extends keyof UnknownBarcodeRow>(column: K, value: UnknownBarcodeRow[K]): this {
    this.filters.push((row) => row[column] === value);
    return this;
  }

  is<K extends keyof UnknownBarcodeRow>(column: K, value: UnknownBarcodeRow[K]): this {
    this.filters.push((row) => row[column] === value);
    return this;
  }

  insert(payload: UnknownBarcodeInsert): this {
    this.stub.inserted = payload;
    this.rows.push(this.stub.rowFromInsert(payload));
    return this;
  }

  limit(count: number): this {
    this.limitCount = count;
    return this;
  }

  maybeSingle(): Promise<SupabaseResult<UnknownBarcodeRow | null>> {
    return Promise.resolve({
      data: this.apply()[0] ?? null,
      error: null
    });
  }

  order<K extends keyof UnknownBarcodeRow>(
    column: K,
    options: {
      ascending: boolean;
    }
  ): this {
    this.orders.push({ ascending: options.ascending, column });
    return this;
  }

  select(_columns: string): this {
    return this;
  }

  single(): Promise<SupabaseResult<UnknownBarcodeRow>> {
    const row = this.apply()[0];

    if (!row) {
      throw new Error("No unknown_barcodes row matched single query.");
    }

    return Promise.resolve({
      data: row,
      error: null
    });
  }

  then<TResult1 = SupabaseResult<UnknownBarcodeRow[]>, TResult2 = never>(
    onfulfilled?:
      | ((value: SupabaseResult<UnknownBarcodeRow[]>) => TResult1 | PromiseLike<TResult1>)
      | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ): PromiseLike<TResult1 | TResult2> {
    return Promise.resolve({
      data: this.apply(),
      error: null
    }).then(onfulfilled, onrejected);
  }

  update(payload: UnknownBarcodeUpdate): this {
    this.stub.updated = payload;
    this.stub.pendingUpdate = payload;
    return this;
  }

  private apply(): UnknownBarcodeRow[] {
    let values = this.rows.filter((row) => this.filters.every((filter) => filter(row)));

    if (this.pendingUpdateApplies()) {
      values = values.map((row) => {
        const updated = {
          ...row,
          ...this.stub.pendingUpdate
        };
        const index = this.rows.findIndex((existingRow) => existingRow.id === row.id);
        if (index >= 0) {
          this.rows[index] = updated;
        }

        return updated;
      });
      this.stub.pendingUpdate = null;
    }

    values = values.sort((left, right) => {
      for (const order of this.orders) {
        const leftValue = String(left[order.column] ?? "");
        const rightValue = String(right[order.column] ?? "");
        const result = leftValue.localeCompare(rightValue);

        if (result !== 0) {
          return order.ascending ? result : -result;
        }
      }

      return 0;
    });

    return this.limitCount === null ? values : values.slice(0, this.limitCount);
  }

  private pendingUpdateApplies(): boolean {
    return this.stub.pendingUpdate !== null;
  }
}

class SupabaseClientStub {
  inserted: UnknownBarcodeInsert | null = null;
  pendingUpdate: UnknownBarcodeUpdate | null = null;
  readonly tables: string[] = [];
  updated: UnknownBarcodeUpdate | null = null;

  constructor(readonly rows: UnknownBarcodeRow[]) {}

  from(table: "unknown_barcodes"): UnknownBarcodeQuery {
    this.tables.push(table);
    return new UnknownBarcodeQuery(this.rows, this);
  }

  rowFromInsert(payload: UnknownBarcodeInsert): UnknownBarcodeRow {
    return {
      actor_temp_session_id: payload.actor_temp_session_id ?? null,
      actor_type: payload.actor_type,
      actor_user_id: payload.actor_user_id ?? null,
      barcode_format: payload.barcode_format,
      barcode_value: payload.barcode_value,
      created_at: payload.created_at ?? "2026-06-06T08:00:00.000Z",
      dismissal_reason: payload.dismissal_reason ?? null,
      dismissed_at: payload.dismissed_at ?? null,
      dismissed_by_actor_temp_session_id: payload.dismissed_by_actor_temp_session_id ?? null,
      dismissed_by_actor_type: payload.dismissed_by_actor_type ?? null,
      dismissed_by_actor_user_id: payload.dismissed_by_actor_user_id ?? null,
      first_seen_at: payload.first_seen_at,
      id: payload.id ?? "unknown-new",
      last_seen_at: payload.last_seen_at,
      last_seen_by_actor_temp_session_id: payload.last_seen_by_actor_temp_session_id ?? null,
      last_seen_by_actor_type: payload.last_seen_by_actor_type,
      last_seen_by_actor_user_id: payload.last_seen_by_actor_user_id ?? null,
      linked_at: payload.linked_at ?? null,
      linked_barcode_mapping_id: payload.linked_barcode_mapping_id ?? null,
      linked_by_actor_temp_session_id: payload.linked_by_actor_temp_session_id ?? null,
      linked_by_actor_type: payload.linked_by_actor_type ?? null,
      linked_by_actor_user_id: payload.linked_by_actor_user_id ?? null,
      linked_item_id: payload.linked_item_id ?? null,
      notes: payload.notes ?? null,
      organization_id: payload.organization_id,
      scan_count: payload.scan_count ?? 1,
      source_workflow: payload.source_workflow ?? null,
      status: payload.status ?? "pending",
      temple_id: payload.temple_id ?? null,
      updated_at: payload.updated_at ?? "2026-06-06T08:00:00.000Z"
    };
  }
}

function createRow(overrides: Partial<UnknownBarcodeRow> = {}): UnknownBarcodeRow {
  return {
    actor_temp_session_id: null,
    actor_type: "user",
    actor_user_id: "user-1",
    barcode_format: "upc_a",
    barcode_value: "036000291452",
    created_at: "2026-06-06T08:00:00.000Z",
    dismissal_reason: null,
    dismissed_at: null,
    dismissed_by_actor_temp_session_id: null,
    dismissed_by_actor_type: null,
    dismissed_by_actor_user_id: null,
    first_seen_at: "2026-06-06T08:00:00.000Z",
    id: "unknown-1",
    last_seen_at: "2026-06-06T08:00:00.000Z",
    last_seen_by_actor_temp_session_id: null,
    last_seen_by_actor_type: "user",
    last_seen_by_actor_user_id: "user-1",
    linked_at: null,
    linked_barcode_mapping_id: null,
    linked_by_actor_temp_session_id: null,
    linked_by_actor_type: null,
    linked_by_actor_user_id: null,
    linked_item_id: null,
    notes: null,
    organization_id: "org-1",
    scan_count: 1,
    source_workflow: "scan",
    status: "pending",
    temple_id: "temple-1",
    updated_at: "2026-06-06T08:00:00.000Z",
    ...overrides
  };
}

function createRepository(rows: UnknownBarcodeRow[]) {
  const stub = new SupabaseClientStub(rows);

  return {
    repository: createSupabaseUnknownBarcodeRepository(stub as unknown as SupabaseClient<Database>),
    stub
  };
}

describe("Supabase unknown barcode repository", () => {
  it("creates durable unknown barcode records", async () => {
    const { repository, stub } = createRepository([]);

    const record = await repository.createUnknownBarcode({
      actor: {
        tempSessionId: "session-1",
        type: "temporary_volunteer"
      },
      barcode: {
        format: "upc_a",
        value: "036000291452"
      },
      clientId: "unknown-new",
      dismissedAt: null,
      dismissedBy: null,
      dismissalReason: null,
      firstSeenAt: "2026-06-06T08:00:00.000Z",
      lastSeenAt: "2026-06-06T08:00:00.000Z",
      lastSeenBy: {
        tempSessionId: "session-1",
        type: "temporary_volunteer"
      },
      linkedAt: null,
      linkedBarcodeMappingId: null,
      linkedBy: null,
      linkedItemId: null,
      notes: "unlabeled bag",
      organizationId: "org-1",
      scanCount: 1,
      sourceWorkflow: "scan",
      status: "pending",
      templeId: "temple-1"
    });

    assert.equal(stub.inserted?.id, "unknown-new");
    assert.equal(stub.inserted?.organization_id, "org-1");
    assert.equal(stub.inserted?.temple_id, "temple-1");
    assert.equal(record.id, "unknown-new");
    assert.equal(record.status, "pending");
  });

  it("finds duplicate pending barcodes inside organization and temple boundaries", async () => {
    const { repository } = createRepository([
      createRow({ id: "same-temple" }),
      createRow({ id: "other-temple", temple_id: "temple-2" }),
      createRow({ id: "other-org", organization_id: "org-2" })
    ]);

    const record = await repository.findPendingUnknownBarcodeByBarcode(
      "org-1",
      {
        format: "upc_a",
        value: "036000291452"
      },
      "temple-1"
    );

    assert.equal(record?.id, "same-temple");
  });

  it("lists pending review records with deterministic ordering and scope", async () => {
    const { repository } = createRepository([
      createRow({ id: "old", last_seen_at: "2026-06-06T08:00:00.000Z" }),
      createRow({ id: "new", last_seen_at: "2026-06-06T09:00:00.000Z" }),
      createRow({
        id: "other-temple",
        last_seen_at: "2026-06-06T10:00:00.000Z",
        temple_id: "temple-2"
      }),
      createRow({ id: "linked", status: "linked" })
    ]);

    const records = await repository.listUnknownBarcodes({
      organizationId: "org-1",
      status: "pending",
      templeId: "temple-1"
    });

    assert.deepEqual(
      records.map((record) => record.id),
      ["new", "old"]
    );
  });

  it("persists duplicate merge updates", async () => {
    const existing = mapUnknownBarcodeRow(createRow());
    const { repository, stub } = createRepository([createRow()]);

    const record = await repository.updateUnknownBarcode({
      ...existing,
      lastSeenAt: "2026-06-06T09:00:00.000Z",
      scanCount: 2,
      updatedAt: "2026-06-06T09:00:00.000Z"
    });

    assert.equal(stub.updated?.scan_count, 2);
    assert.equal(stub.updated?.last_seen_at, "2026-06-06T09:00:00.000Z");
    assert.equal(record.scanCount, 2);
  });

  it("persists link and dismiss lifecycle updates", async () => {
    const linked = mapUnknownBarcodeRow(createRow({ id: "link-me" }));
    const dismissed = mapUnknownBarcodeRow(createRow({ id: "dismiss-me" }));
    const { repository } = createRepository([
      createRow({ id: "link-me" }),
      createRow({ id: "dismiss-me" })
    ]);

    const linkedRecord = await repository.updateUnknownBarcode({
      ...linked,
      linkedAt: "2026-06-06T09:00:00.000Z",
      linkedBarcodeMappingId: "barcode-mapping-1",
      linkedBy: {
        type: "user",
        userId: "manager-1"
      },
      linkedItemId: "rice",
      status: "linked",
      updatedAt: "2026-06-06T09:00:00.000Z"
    });
    const dismissedRecord = await repository.updateUnknownBarcode({
      ...dismissed,
      dismissedAt: "2026-06-06T10:00:00.000Z",
      dismissedBy: {
        type: "system"
      },
      dismissalReason: "not inventory",
      status: "dismissed",
      updatedAt: "2026-06-06T10:00:00.000Z"
    });

    assert.equal(linkedRecord.status, "linked");
    assert.equal(linkedRecord.linkedBarcodeMappingId, "barcode-mapping-1");
    assert.equal(linkedRecord.linkedItemId, "rice");
    assert.equal(dismissedRecord.status, "dismissed");
    assert.equal(dismissedRecord.dismissalReason, "not inventory");
  });
});
