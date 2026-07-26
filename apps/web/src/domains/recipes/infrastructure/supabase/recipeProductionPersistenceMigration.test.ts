import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it } from "vitest";

function readMigration() {
  return readFileSync(
    resolve(
      process.cwd(),
      "infra/supabase/migrations/20260607000700_add_recipe_production_persistence.sql"
    ),
    "utf8"
  );
}

describe("recipe production persistence migration", () => {
  it("adds Supabase tables for recipes and production runs", () => {
    const migration = readMigration();

    assert.match(migration, /create table if not exists public\.recipes/i);
    assert.match(migration, /create table if not exists public\.recipe_production_runs/i);
    assert.match(migration, /ingredients jsonb not null/i);
    assert.match(migration, /consumption_transaction_ids uuid\[\]/i);
  });

  it("enforces scoped recipe and production-run authorization policies", () => {
    const migration = readMigration();

    assert.match(migration, /enable row level security/i);
    assert.match(migration, /Authenticated recipe managers can create scoped recipes/i);
    assert.match(migration, /Authenticated recipe managers can create scoped production runs/i);
    assert.match(migration, /actor_user_id = auth\.uid\(\)/i);
    assert.match(migration, /senior_cook/i);
    assert.match(migration, /inventory_manager/i);
  });
});
