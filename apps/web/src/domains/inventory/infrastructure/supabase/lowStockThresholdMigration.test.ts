import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "vitest";

const migration = readFileSync(
  join(
    process.cwd(),
    "infra",
    "supabase",
    "migrations",
    "20260606000500_add_inventory_low_stock_thresholds.sql"
  ),
  "utf8"
);

describe("low stock threshold persistence migration", () => {
  it("adds durable threshold storage additively", () => {
    assert.match(migration, /create table if not exists public\.inventory_low_stock_thresholds/i);
    assert.match(
      migration,
      /organization_id uuid not null references public\.organizations\(id\)/i
    );
    assert.match(migration, /temple_id uuid references public\.temples\(id\)/i);
    assert.match(migration, /location_id uuid references public\.locations\(id\)/i);
    assert.match(migration, /minimum_quantity numeric\(12, 3\) not null check/i);
    assert.doesNotMatch(migration, /drop table|drop column/i);
  });

  it("supports active threshold lifecycle and deterministic active lookups", () => {
    assert.match(
      migration,
      /create unique index if not exists inventory_low_stock_thresholds_active_unique/i
    );
    assert.match(migration, /where archived_at is null/i);
    assert.match(migration, /idx_inventory_low_stock_thresholds_active_scope/i);
    assert.match(
      migration,
      /alter table public\.inventory_low_stock_thresholds enable row level security/i
    );
  });
});
