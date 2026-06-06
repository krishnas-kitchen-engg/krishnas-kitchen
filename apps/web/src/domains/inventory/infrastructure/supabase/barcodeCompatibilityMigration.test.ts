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
    "20260606000300_reconcile_item_barcodes_catalog_schema.sql"
  ),
  "utf8"
);

describe("barcode catalog compatibility migration", () => {
  it("adds barcode catalog columns without dropping the legacy barcode column", () => {
    assert.match(migration, /create type public\.barcode_format as enum/i);
    assert.match(migration, /add column if not exists barcode_value text/i);
    assert.match(migration, /add column if not exists barcode_format public\.barcode_format/i);
    assert.match(migration, /add column if not exists archived_at timestamptz/i);
    assert.match(migration, /add column if not exists source_unknown_barcode_id uuid/i);
    assert.doesNotMatch(migration, /drop column\s+barcode/i);
  });

  it("backfills legacy rows and keeps new inserts compatible with old barcode storage", () => {
    assert.match(migration, /barcode_value = coalesce\(barcode_value, barcode\)/i);
    assert.match(migration, /created_by_actor_type = coalesce\(created_by_actor_type, 'system'/i);
    assert.match(migration, /sync_item_barcodes_legacy_barcode/i);
    assert.match(migration, /new\.barcode = new\.barcode_value/i);
  });

  it("uses active-only duplicate prevention for barcode mappings", () => {
    assert.match(migration, /drop constraint if exists item_barcodes_unique/i);
    assert.match(
      migration,
      /create unique index if not exists item_barcodes_active_unique[\s\S]*where archived_at is null/i
    );
    assert.match(
      migration,
      /create index if not exists idx_item_barcodes_active_lookup[\s\S]*where archived_at is null/i
    );
  });
});
