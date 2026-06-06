import assert from "node:assert/strict";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@krishnas-kitchen/types";
import { describe, it } from "vitest";

import type { InventoryLowStockThresholdRow } from "./lowStockThresholdMapper";
import { createSupabaseLowStockThresholdRepository } from "./supabaseLowStockThresholdRepository";

type SupabaseResult<T> = {
  data: T;
  error: null;
};

class ThresholdQuery implements PromiseLike<SupabaseResult<InventoryLowStockThresholdRow[]>> {
  private filters: Array<(row: InventoryLowStockThresholdRow) => boolean> = [];
  private orders: Array<{
    ascending: boolean;
    column: keyof InventoryLowStockThresholdRow;
  }> = [];

  constructor(private readonly rows: readonly InventoryLowStockThresholdRow[]) {}

  eq<K extends keyof InventoryLowStockThresholdRow>(
    column: K,
    value: InventoryLowStockThresholdRow[K]
  ): this {
    this.filters.push((row) => row[column] === value);
    return this;
  }

  is<K extends keyof InventoryLowStockThresholdRow>(
    column: K,
    value: InventoryLowStockThresholdRow[K]
  ): this {
    this.filters.push((row) => row[column] === value);
    return this;
  }

  order<K extends keyof InventoryLowStockThresholdRow>(
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

  then<TResult1 = SupabaseResult<InventoryLowStockThresholdRow[]>, TResult2 = never>(
    onfulfilled?:
      | ((
          value: SupabaseResult<InventoryLowStockThresholdRow[]>
        ) => TResult1 | PromiseLike<TResult1>)
      | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ): PromiseLike<TResult1 | TResult2> {
    return Promise.resolve({
      data: this.apply(),
      error: null
    }).then(onfulfilled, onrejected);
  }

  private apply(): InventoryLowStockThresholdRow[] {
    return this.rows
      .filter((row) => this.filters.every((filter) => filter(row)))
      .sort((left, right) => {
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
  }
}

class SupabaseClientStub {
  readonly tables: string[] = [];

  constructor(private readonly rows: readonly InventoryLowStockThresholdRow[]) {}

  from(table: "inventory_low_stock_thresholds"): ThresholdQuery {
    this.tables.push(table);
    return new ThresholdQuery(this.rows);
  }
}

function createRow(
  overrides: Partial<InventoryLowStockThresholdRow> = {}
): InventoryLowStockThresholdRow {
  return {
    archived_at: null,
    archived_by_actor_temp_session_id: null,
    archived_by_actor_type: null,
    archived_by_actor_user_id: null,
    created_at: "2026-06-06T08:00:00.000Z",
    created_by_actor_temp_session_id: null,
    created_by_actor_type: "user",
    created_by_actor_user_id: "user-1",
    id: "threshold-1",
    item_id: "rice",
    location_id: "pantry",
    minimum_quantity: 5,
    organization_id: "org-1",
    temple_id: "temple-1",
    unit: "kg",
    updated_at: "2026-06-06T08:00:00.000Z",
    ...overrides
  };
}

describe("Supabase low stock threshold repository", () => {
  it("lists active thresholds within organization, temple, and location scope", async () => {
    const stub = new SupabaseClientStub([
      createRow({ id: "pantry-rice" }),
      createRow({ id: "org-wide", location_id: null, temple_id: null }),
      createRow({ id: "other-location", location_id: "freezer" }),
      createRow({ id: "other-temple", temple_id: "temple-2" }),
      createRow({ id: "other-org", organization_id: "org-2" }),
      createRow({ archived_at: "2026-06-06T09:00:00.000Z", id: "archived" })
    ]);
    const repository = createSupabaseLowStockThresholdRepository(
      stub as unknown as SupabaseClient<Database>
    );

    const thresholds = await repository.listActiveLowStockThresholds({
      locationId: "pantry",
      organizationId: "org-1",
      templeId: "temple-1"
    });

    assert.deepEqual(stub.tables, ["inventory_low_stock_thresholds"]);
    assert.deepEqual(
      thresholds.map((threshold) => threshold.locationId ?? "all"),
      ["all", "pantry"]
    );
  });

  it("preserves item scope and deterministic row order", async () => {
    const stub = new SupabaseClientStub([
      createRow({ id: "flour", item_id: "flour" }),
      createRow({ id: "rice", item_id: "rice" })
    ]);
    const repository = createSupabaseLowStockThresholdRepository(
      stub as unknown as SupabaseClient<Database>
    );

    const thresholds = await repository.listActiveLowStockThresholds({
      itemId: "rice",
      organizationId: "org-1",
      templeId: "temple-1"
    });

    assert.deepEqual(
      thresholds.map((threshold) => threshold.itemId),
      ["rice"]
    );
  });
});
