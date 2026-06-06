import assert from "node:assert/strict";
import { describe, it } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@krishnas-kitchen/types";

import type {
  InventoryBarcodeInsert,
  InventoryBarcodeRow,
  InventoryBarcodeUpdate,
  InventoryItemRow,
  InventoryLocationRow
} from "./inventoryCatalogMapper";
import { createSupabaseInventoryRepositoryAdapters } from "./supabaseInventoryRepositoryAdapters";

type TableName = "item_barcodes" | "items" | "locations";

type TableRows = {
  item_barcodes: InventoryBarcodeRow;
  items: InventoryItemRow;
  locations: InventoryLocationRow;
};

type SupabaseResult<T> = {
  data: T;
  error: null;
};

class SelectQuery<T extends TableName> implements PromiseLike<SupabaseResult<TableRows[T][]>> {
  private filters: Array<(row: TableRows[T]) => boolean> = [];
  private limitCount: number | null = null;
  private orders: Array<{ column: keyof TableRows[T]; ascending: boolean }> = [];

  constructor(
    private readonly table: T,
    private readonly rows: TableRows[T][],
    protected readonly stub: SupabaseClientStub
  ) {}

  eq<K extends keyof TableRows[T]>(column: K, value: TableRows[T][K]): this {
    this.filters.push((row) => row[column] === value);
    return this;
  }

  in<K extends keyof TableRows[T]>(column: K, values: readonly TableRows[T][K][]): this {
    this.filters.push((row) => values.includes(row[column]));
    return this;
  }

  is<K extends keyof TableRows[T]>(column: K, value: TableRows[T][K]): this {
    this.filters.push((row) => row[column] === value);
    return this;
  }

  limit(count: number): this {
    this.limitCount = count;
    return this;
  }

  maybeSingle(): Promise<SupabaseResult<TableRows[T] | null>> {
    return Promise.resolve({
      data: this.apply()[0] ?? null,
      error: null
    });
  }

  order<K extends keyof TableRows[T]>(
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

  single(): Promise<SupabaseResult<TableRows[T]>> {
    const row = this.apply()[0];

    if (!row) {
      throw new Error(`No ${this.table} row matched single query.`);
    }

    return Promise.resolve({
      data: row,
      error: null
    });
  }

  then<TResult1 = SupabaseResult<TableRows[T][]>, TResult2 = never>(
    onfulfilled?:
      | ((value: SupabaseResult<TableRows[T][]>) => TResult1 | PromiseLike<TResult1>)
      | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ): PromiseLike<TResult1 | TResult2> {
    return Promise.resolve({
      data: this.apply(),
      error: null
    }).then(onfulfilled, onrejected);
  }

  update(payload: InventoryBarcodeUpdate): SelectQuery<"item_barcodes"> {
    if (this.table !== "item_barcodes") {
      throw new Error("Only item_barcodes supports updates in this test stub.");
    }

    this.stub.pendingBarcodeUpdate = payload;

    return this as unknown as SelectQuery<"item_barcodes">;
  }

  private apply(): TableRows[T][] {
    let values = this.rows.filter((row) => this.filters.every((filter) => filter(row)));

    if (this.stub.pendingBarcodeUpdate && this.table === "item_barcodes") {
      values = values.map((row) => ({
        ...row,
        ...this.stub.pendingBarcodeUpdate
      }));
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
}

class InsertQuery {
  constructor(
    private readonly row: InventoryBarcodeRow,
    private readonly stub: SupabaseClientStub
  ) {}

  insert(payload: InventoryBarcodeInsert): this {
    this.stub.insertedBarcode = payload;
    this.stub.rows.item_barcodes.push(this.row);
    return this;
  }

  select(_columns: string): this {
    return this;
  }

  single(): Promise<SupabaseResult<InventoryBarcodeRow>> {
    return Promise.resolve({
      data: this.row,
      error: null
    });
  }
}

class TableQuery<T extends TableName> extends SelectQuery<T> {
  insert(payload: InventoryBarcodeInsert): InsertQuery {
    if (this.tableName !== "item_barcodes") {
      throw new Error("Only item_barcodes supports inserts in this test stub.");
    }

    const row = this.stub.createdBarcodeRow(payload);

    this.stub.insertedBarcode = payload;
    this.stub.rows.item_barcodes.push(row);

    return new InsertQuery(row, this.stub);
  }

  constructor(
    private readonly tableName: T,
    rows: TableRows[T][],
    stub: SupabaseClientStub
  ) {
    super(tableName, rows, stub);
  }
}

class SupabaseClientStub {
  insertedBarcode: InventoryBarcodeInsert | null = null;
  pendingBarcodeUpdate: InventoryBarcodeUpdate | null = null;
  readonly tables: string[] = [];

  constructor(
    readonly rows: {
      item_barcodes: InventoryBarcodeRow[];
      items: InventoryItemRow[];
      locations: InventoryLocationRow[];
    }
  ) {}

  createdBarcodeRow(payload: InventoryBarcodeInsert): InventoryBarcodeRow {
    return {
      archived_at: null,
      archived_by_actor_temp_session_id: null,
      archived_by_actor_type: null,
      archived_by_actor_user_id: null,
      archive_reason: null,
      barcode: payload.barcode ?? payload.barcode_value,
      barcode_format: payload.barcode_format,
      barcode_value: payload.barcode_value,
      created_at: "2026-06-05T08:00:00.000Z",
      created_by_actor_temp_session_id: payload.created_by_actor_temp_session_id ?? null,
      created_by_actor_type: payload.created_by_actor_type,
      created_by_actor_user_id: payload.created_by_actor_user_id ?? null,
      id: payload.id ?? "mapping-new",
      item_id: payload.item_id,
      notes: payload.notes ?? null,
      organization_id: payload.organization_id,
      source_unknown_barcode_id: payload.source_unknown_barcode_id ?? null,
      updated_at: "2026-06-05T08:00:00.000Z"
    };
  }

  from<T extends TableName>(table: T): TableQuery<T> {
    this.tables.push(table);
    return new TableQuery(table, this.rows[table] as TableRows[T][], this);
  }
}

const items: InventoryItemRow[] = [
  {
    default_unit: "kg",
    deleted_at: null,
    id: "rice",
    name: "Rice",
    organization_id: "org-1",
    receiving_units: ["kg"],
    return_units: ["kg"],
    transfer_units: ["kg"]
  },
  {
    default_unit: "kg",
    deleted_at: "2026-06-01T00:00:00.000Z",
    id: "archived-dal",
    name: "Archived Dal",
    organization_id: "org-1",
    receiving_units: null,
    return_units: null,
    transfer_units: null
  },
  {
    default_unit: "unit",
    deleted_at: null,
    id: "other-rice",
    name: "Other Rice",
    organization_id: "org-2",
    receiving_units: null,
    return_units: null,
    transfer_units: null
  }
];

const locations: InventoryLocationRow[] = [
  {
    deleted_at: null,
    id: "pantry",
    name: "Pantry",
    organization_id: "org-1",
    temple_id: "temple-1"
  },
  {
    deleted_at: "2026-06-01T00:00:00.000Z",
    id: "old-freezer",
    name: "Old Freezer",
    organization_id: "org-1",
    temple_id: "temple-1"
  },
  {
    deleted_at: null,
    id: "other-pantry",
    name: "Other Pantry",
    organization_id: "org-2",
    temple_id: "temple-2"
  }
];

const barcodeRows: InventoryBarcodeRow[] = [
  {
    archived_at: null,
    archived_by_actor_temp_session_id: null,
    archived_by_actor_type: null,
    archived_by_actor_user_id: null,
    archive_reason: null,
    barcode: "036000291452",
    barcode_format: "upc_a",
    barcode_value: "036000291452",
    created_at: "2026-06-05T08:00:00.000Z",
    created_by_actor_temp_session_id: null,
    created_by_actor_type: "user",
    created_by_actor_user_id: "user-1",
    id: "barcode-rice",
    item_id: "rice",
    notes: null,
    organization_id: "org-1",
    source_unknown_barcode_id: null,
    updated_at: "2026-06-05T08:00:00.000Z"
  },
  {
    archived_at: "2026-06-05T09:00:00.000Z",
    archived_by_actor_temp_session_id: null,
    archived_by_actor_type: "user",
    archived_by_actor_user_id: "user-1",
    archive_reason: "duplicate",
    barcode: "036000291452",
    barcode_format: "upc_a",
    barcode_value: "036000291452",
    created_at: "2026-06-05T08:00:00.000Z",
    created_by_actor_temp_session_id: null,
    created_by_actor_type: "user",
    created_by_actor_user_id: "user-1",
    id: "barcode-archived",
    item_id: "archived-dal",
    notes: null,
    organization_id: "org-1",
    source_unknown_barcode_id: null,
    updated_at: "2026-06-05T09:00:00.000Z"
  },
  {
    archived_at: null,
    archived_by_actor_temp_session_id: null,
    archived_by_actor_type: null,
    archived_by_actor_user_id: null,
    archive_reason: null,
    barcode: "036000291452",
    barcode_format: "upc_a",
    barcode_value: "036000291452",
    created_at: "2026-06-05T08:00:00.000Z",
    created_by_actor_temp_session_id: null,
    created_by_actor_type: "user",
    created_by_actor_user_id: "user-2",
    id: "barcode-other",
    item_id: "other-rice",
    notes: null,
    organization_id: "org-2",
    source_unknown_barcode_id: null,
    updated_at: "2026-06-05T08:00:00.000Z"
  }
];

function createAdapters() {
  const stub = new SupabaseClientStub({
    item_barcodes: barcodeRows,
    items,
    locations
  });

  return {
    adapters: createSupabaseInventoryRepositoryAdapters(
      stub as unknown as SupabaseClient<Database>
    ),
    stub
  };
}

describe("supabase inventory repository adapters", () => {
  it("provides transaction and unknown barcode repositories", () => {
    const { adapters } = createAdapters();

    assert.equal(typeof adapters.transactionRepository.listTransactions, "function");
    assert.equal(typeof adapters.unknownBarcodeRepository.listUnknownBarcodes, "function");
  });

  it("lists active organization items, locations, and barcode catalog rows", async () => {
    const { adapters } = createAdapters();

    const listedItems = await adapters.catalogQueryRepository.listItems("org-1");
    const listedLocations = await adapters.catalogQueryRepository.listLocations("org-1");
    const listedBarcodes = await adapters.catalogQueryRepository.listBarcodes("org-1");

    assert.deepEqual(
      listedItems.map((item) => item.id),
      ["rice"]
    );
    assert.deepEqual(listedItems[0]?.barcodes, [
      {
        format: "upc_a",
        value: "036000291452"
      }
    ]);
    assert.deepEqual(
      listedLocations.map((location) => location.id),
      ["pantry"]
    );
    assert.deepEqual(
      listedBarcodes.map((barcode) => barcode.itemId),
      ["rice"]
    );
  });

  it("resolves barcode lookup through active mappings and active same-organization items", async () => {
    const { adapters } = createAdapters();

    const matches = await adapters.barcodeLookupRepository.findItemsByBarcode("org-1", {
      format: "upc_a",
      value: "036000291452"
    });

    assert.deepEqual(
      matches.map((item) => item.id),
      ["rice"]
    );
  });

  it("supports barcode mapping creation, archival, active lookup, and item validation lookup", async () => {
    const { adapters, stub } = createAdapters();
    const activeMapping = await adapters.barcodeCatalogRepository.findActiveBarcodeMappingByBarcode(
      "org-1",
      {
        format: "upc_a",
        value: "036000291452"
      }
    );
    const archivedItem = await adapters.barcodeCatalogItemRepository.findBarcodeCatalogItem(
      "archived-dal",
      "org-1"
    );
    const created = await adapters.barcodeCatalogRepository.createBarcodeMapping({
      archivedAt: null,
      archivedBy: null,
      archiveReason: null,
      barcode: {
        format: "ean_13",
        value: "4006381333931"
      },
      clientId: "mapping-new",
      createdBy: {
        type: "user",
        userId: "user-1"
      },
      itemId: "rice",
      notes: "case barcode",
      organizationId: "org-1",
      sourceUnknownBarcodeId: "unknown-1"
    });
    const archived = await adapters.barcodeCatalogRepository.archiveBarcodeMapping({
      ...created,
      archivedAt: "2026-06-05T10:00:00.000Z",
      archivedBy: {
        type: "user",
        userId: "user-1"
      },
      archiveReason: "duplicate",
      updatedAt: "2026-06-05T10:00:00.000Z"
    });

    assert.equal(activeMapping?.id, "barcode-rice");
    assert.equal(archivedItem?.deletedAt, "2026-06-01T00:00:00.000Z");
    assert.equal(stub.insertedBarcode?.barcode_value, "4006381333931");
    assert.equal(created.sourceUnknownBarcodeId, "unknown-1");
    assert.equal(archived.archivedAt, "2026-06-05T10:00:00.000Z");
  });
});
