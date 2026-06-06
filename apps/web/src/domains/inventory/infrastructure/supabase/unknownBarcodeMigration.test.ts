import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "vitest";

const migration = readFileSync(
  join(process.cwd(), "infra", "supabase", "migrations", "20260606000400_add_unknown_barcodes.sql"),
  "utf8"
);

describe("unknown barcode persistence migration", () => {
  it("adds unknown barcode status and durable review table additively", () => {
    assert.match(migration, /create type public\.unknown_barcode_status as enum/i);
    assert.match(migration, /create table if not exists public\.unknown_barcodes/i);
    assert.match(
      migration,
      /organization_id uuid not null references public\.organizations\(id\)/i
    );
    assert.match(migration, /temple_id uuid references public\.temples\(id\)/i);
    assert.match(migration, /barcode_format public\.barcode_format not null/i);
    assert.match(migration, /barcode_value text not null/i);
    assert.doesNotMatch(migration, /drop table|drop column/i);
  });

  it("supports link, dismiss, and review queue lifecycle fields", () => {
    assert.match(migration, /linked_item_id uuid references public\.items\(id\)/i);
    assert.match(
      migration,
      /linked_barcode_mapping_id uuid references public\.item_barcodes\(id\)/i
    );
    assert.match(migration, /dismissal_reason text/i);
    assert.match(migration, /constraint unknown_barcodes_linked_state check/i);
    assert.match(migration, /constraint unknown_barcodes_dismissed_state check/i);
  });

  it("enforces pending duplicate merge keys and review ordering indexes", () => {
    assert.match(migration, /create unique index if not exists unknown_barcodes_pending_unique/i);
    assert.match(
      migration,
      /organization_id,[\s\S]*coalesce\(temple_id,[\s\S]*barcode_format,[\s\S]*barcode_value/i
    );
    assert.match(migration, /where status = 'pending'/i);
    assert.match(migration, /idx_unknown_barcodes_review_queue/i);
    assert.match(migration, /last_seen_at desc, id desc/i);
    assert.match(migration, /alter table public\.unknown_barcodes enable row level security/i);
  });
});
