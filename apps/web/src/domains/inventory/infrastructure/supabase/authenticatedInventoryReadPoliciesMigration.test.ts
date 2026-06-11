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
    "20260607000300_add_authenticated_inventory_read_policies.sql"
  ),
  "utf8"
);

const inventoryReadTables = [
  "items",
  "locations",
  "item_barcodes",
  "inventory_transactions",
  "inventory_low_stock_thresholds",
  "unknown_barcodes"
];

describe("authenticated inventory read policies migration", () => {
  it("adds select policies for each inventory-facing table", () => {
    for (const table of inventoryReadTables) {
      assert.match(
        migration,
        new RegExp(`create policy [\\s\\S]+ on public\\.${table}[\\s\\S]+for select`, "i")
      );
    }
  });

  it("limits policies to authenticated users and derives scope from helper functions", () => {
    assert.equal((migration.match(/to authenticated/gi) ?? []).length, inventoryReadTables.length);
    assert.match(migration, /public\.is_authenticated_user_in_organization\(organization_id\)/i);
    assert.match(migration, /public\.is_authenticated_user_assigned_to_temple\(temple_id\)/i);
    assert.match(
      migration,
      /public\.is_authenticated_user_assigned_to_temple\(threshold_location\.temple_id\)/i
    );
  });

  it("does not add anonymous or mutation policies", () => {
    assert.doesNotMatch(migration, /to anon/i);
    assert.doesNotMatch(migration, /to public/i);
    assert.doesNotMatch(migration, /for insert/i);
    assert.doesNotMatch(migration, /for update/i);
    assert.doesNotMatch(migration, /for delete/i);
    assert.doesNotMatch(migration, /grant select|grant insert|grant update|grant delete/i);
  });

  it("enforces temple isolation for temple-scoped inventory reads", () => {
    assert.match(
      migration,
      /on public\.locations[\s\S]+public\.is_authenticated_user_assigned_to_temple\(temple_id\)/i
    );
    assert.match(
      migration,
      /on public\.inventory_transactions[\s\S]+public\.is_authenticated_user_assigned_to_temple\(temple_id\)/i
    );
    assert.match(
      migration,
      /on public\.unknown_barcodes[\s\S]+temple_id is null[\s\S]+public\.is_authenticated_user_assigned_to_temple\(temple_id\)/i
    );
  });
});
