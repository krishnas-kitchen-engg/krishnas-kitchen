import assert from "node:assert/strict";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@krishnas-kitchen/types";
import { describe, it } from "vitest";

import { createSupabaseRecipeProductionRunRepository } from "./supabaseRecipeProductionRunRepository";

type ProductionRunRow = Database["public"]["Tables"]["recipe_production_runs"]["Row"];

const productionRunRow: ProductionRunRow = {
  actor_temp_session_id: null,
  actor_type: "user",
  actor_user_id: "manager-1",
  batch_count: 2,
  consumption_transaction_ids: ["tx-1", "tx-2"],
  created_at: "2026-07-21T01:00:00.000Z",
  id: "run-1",
  location_id: "pantry",
  notes: "Festival lunch",
  organization_id: "org-1",
  recipe_id: "recipe-1",
  recipe_name: "Khichdi",
  recipe_version: 1,
  servings: 50,
  temple_id: "temple-1"
};

class ProductionRunQuery {
  readonly filters: Record<string, unknown> = {};
  limitedTo: number | null = null;
  orderedBy: string | null = null;

  constructor(private readonly row: ProductionRunRow) {}

  select() {
    return this;
  }

  eq(field: string, value: unknown) {
    this.filters[field] = value;

    return this;
  }

  gte(field: string, value: unknown) {
    this.filters[`${field}:gte`] = value;

    return this;
  }

  limit(value: number) {
    this.limitedTo = value;

    return this;
  }

  order(field: string) {
    this.orderedBy = field;

    return this;
  }

  single() {
    return Promise.resolve({
      data: this.row,
      error: null
    });
  }

  then(
    resolve: (value: { data: ProductionRunRow[]; error: null }) => unknown,
    _reject?: (reason: unknown) => unknown
  ) {
    return Promise.resolve({
      data: [this.row],
      error: null
    }).then(resolve);
  }
}

class ProductionRunTable {
  inserted: Database["public"]["Tables"]["recipe_production_runs"]["Insert"] | null = null;
  readonly query = new ProductionRunQuery(productionRunRow);

  insert(payload: Database["public"]["Tables"]["recipe_production_runs"]["Insert"]) {
    this.inserted = payload;

    return new ProductionRunQuery(productionRunRow);
  }

  select() {
    return this.query.select();
  }
}

class SupabaseClientStub {
  readonly productionRuns = new ProductionRunTable();

  from(table: string) {
    assert.equal(table, "recipe_production_runs");

    return this.productionRuns;
  }
}

describe("Supabase recipe production run repository", () => {
  it("persists production-run records with actor and consumption traceability", async () => {
    const stub = new SupabaseClientStub();
    const repository = createSupabaseRecipeProductionRunRepository(
      stub as unknown as SupabaseClient<Database>
    );

    const run = await repository.createProductionRun({
      actor: {
        type: "user",
        userId: "manager-1"
      },
      batchCount: 2,
      consumptionTransactionIds: ["tx-1", "tx-2"],
      locationId: "pantry",
      notes: "Festival lunch",
      organizationId: "org-1",
      recipeId: "recipe-1",
      recipeName: "Khichdi",
      recipeVersion: 1,
      servings: 50,
      templeId: "temple-1"
    });

    assert.equal(run.id, "run-1");
    assert.equal(stub.productionRuns.inserted?.actor_user_id, "manager-1");
    assert.deepEqual(stub.productionRuns.inserted?.consumption_transaction_ids, ["tx-1", "tx-2"]);
  });

  it("lists scoped production runs for dashboard reads", async () => {
    const stub = new SupabaseClientStub();
    const repository = createSupabaseRecipeProductionRunRepository(
      stub as unknown as SupabaseClient<Database>
    );

    const runs = await repository.listProductionRuns({
      limit: 10,
      organizationId: "org-1",
      since: "2026-07-21T00:00:00.000Z",
      templeId: "temple-1"
    });

    assert.equal(runs.length, 1);
    assert.equal(runs[0]?.id, "run-1");
    assert.equal(stub.productionRuns.query.filters.organization_id, "org-1");
    assert.equal(stub.productionRuns.query.filters.temple_id, "temple-1");
    assert.equal(stub.productionRuns.query.filters["created_at:gte"], "2026-07-21T00:00:00.000Z");
    assert.equal(stub.productionRuns.query.limitedTo, 10);
    assert.equal(stub.productionRuns.query.orderedBy, "created_at");
  });
});
