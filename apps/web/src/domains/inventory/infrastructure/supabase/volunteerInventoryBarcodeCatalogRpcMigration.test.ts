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
    "20260607000500_add_volunteer_inventory_barcode_catalog_rpc.sql"
  ),
  "utf8"
);

describe("volunteer inventory barcode catalog RPC migration", () => {
  it("adds a scoped volunteer barcode catalog read RPC", () => {
    assert.match(
      migration,
      /create or replace function public\.list_volunteer_inventory_barcodes\(/i
    );
    assert.match(migration, /returns setof public\.item_barcodes/i);
    assert.match(migration, /volunteer_session_id uuid/i);
    assert.match(migration, /expected_client_session_id text/i);
  });

  it("validates the active volunteer session and does not accept browser organization scope", () => {
    assert.match(migration, /public\.get_active_volunteer_session_scope\(/i);
    assert.match(migration, /nullif\(trim\(expected_client_session_id\), ''\)/i);
    assert.match(migration, /barcode_mapping\.organization_id = session_scope\.organization_id/i);
    assert.doesNotMatch(migration, /organization_id uuid/i);
    assert.doesNotMatch(migration, /temple_id uuid/i);
  });

  it("returns only active mappings for active items", () => {
    assert.match(migration, /barcode_mapping\.archived_at is null/i);
    assert.match(migration, /item\.deleted_at is null/i);
    assert.match(migration, /item\.organization_id = session_scope\.organization_id/i);
  });

  it("keeps the RPC security-definer and grants only controlled function execution", () => {
    assert.match(migration, /^\s*security definer/im);
    assert.match(migration, /^\s*set search_path = public/im);
    assert.match(
      migration,
      /revoke execute on function public\.list_volunteer_inventory_barcodes\(uuid, text, timestamptz\)\s+from public/i
    );
    assert.match(
      migration,
      /grant execute on function public\.list_volunteer_inventory_barcodes\(uuid, text, timestamptz\)\s+to anon/i
    );
    assert.doesNotMatch(migration, /grant select|grant insert|grant update|grant delete/i);
    assert.doesNotMatch(migration, /create policy/i);
  });
});
