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
    "20260607000400_add_volunteer_inventory_read_rpc_functions.sql"
  ),
  "utf8"
);

const rpcNames = [
  "list_volunteer_inventory_items",
  "list_volunteer_inventory_locations",
  "lookup_volunteer_inventory_barcode",
  "list_volunteer_inventory_transactions",
  "list_volunteer_inventory_low_stock_thresholds",
  "list_volunteer_pending_unknown_barcodes"
];

describe("volunteer inventory read RPC migration", () => {
  it("adds bounded read RPCs for each volunteer inventory visibility surface", () => {
    for (const rpcName of rpcNames) {
      assert.match(migration, new RegExp(`create or replace function public\\.${rpcName}\\(`, "i"));
    }

    assert.match(migration, /returns setof public\.items/i);
    assert.match(migration, /returns setof public\.locations/i);
    assert.match(migration, /returns setof public\.item_barcodes/i);
    assert.match(migration, /returns setof public\.inventory_transactions/i);
    assert.match(migration, /returns setof public\.inventory_low_stock_thresholds/i);
    assert.match(migration, /returns setof public\.unknown_barcodes/i);
  });

  it("validates active volunteer sessions before returning inventory data", () => {
    assert.equal(
      (migration.match(/public\.get_active_volunteer_session_scope\(/gi) ?? []).length,
      rpcNames.length
    );
    assert.match(migration, /volunteer_session_id uuid/i);
    assert.match(migration, /expected_client_session_id text/i);
    assert.match(migration, /nullif\(trim\(expected_client_session_id\), ''\)/i);
    assert.doesNotMatch(migration, /organization_id uuid/i);
    assert.doesNotMatch(migration, /temple_id uuid/i);
  });

  it("keeps RPCs security-definer with explicit search paths", () => {
    assert.equal((migration.match(/^\s*security definer/gim) ?? []).length, rpcNames.length);
    assert.equal(
      (migration.match(/^\s*set search_path = public/gim) ?? []).length,
      rpcNames.length
    );
  });

  it("scopes returned rows to organization and temple where appropriate", () => {
    assert.match(migration, /item\.organization_id = session_scope\.organization_id/i);
    assert.match(migration, /location\.organization_id = session_scope\.organization_id/i);
    assert.match(migration, /location\.temple_id = session_scope\.temple_id/i);
    assert.match(
      migration,
      /inventory_transaction\.organization_id = session_scope\.organization_id[\s\S]+inventory_transaction\.temple_id = session_scope\.temple_id/i
    );
    assert.match(migration, /unknown_barcode\.organization_id = session_scope\.organization_id/i);
    assert.match(migration, /unknown_barcode\.temple_id = session_scope\.temple_id/i);
  });

  it("requires non-null transaction locations to resolve within the volunteer temple", () => {
    assert.match(
      migration,
      /source_location\s+on source_location\.id = inventory_transaction\.source_location_id[\s\S]+source_location\.temple_id = session_scope\.temple_id/i
    );
    assert.match(
      migration,
      /destination_location\s+on destination_location\.id = inventory_transaction\.destination_location_id[\s\S]+destination_location\.temple_id = session_scope\.temple_id/i
    );
    assert.match(
      migration,
      /inventory_transaction\.source_location_id is null[\s\S]+source_location\.id is not null[\s\S]+source_location\.deleted_at is null/i
    );
    assert.match(
      migration,
      /inventory_transaction\.destination_location_id is null[\s\S]+destination_location\.id is not null[\s\S]+destination_location\.deleted_at is null/i
    );
  });

  it("excludes archived or deleted records from volunteer reads", () => {
    assert.match(migration, /item\.deleted_at is null/i);
    assert.match(migration, /location\.deleted_at is null/i);
    assert.match(migration, /source_location\.deleted_at is null/i);
    assert.match(migration, /destination_location\.deleted_at is null/i);
    assert.match(migration, /barcode_mapping\.archived_at is null/i);
    assert.match(migration, /threshold\.archived_at is null/i);
    assert.match(migration, /threshold_location\.deleted_at is null/i);
  });

  it("grants anonymous execution only for the controlled RPCs and no table access", () => {
    for (const rpcName of rpcNames) {
      assert.match(
        migration,
        new RegExp(`revoke execute on function public\\.${rpcName}\\([\\s\\S]+from public`, "i")
      );
      assert.match(
        migration,
        new RegExp(`grant execute on function public\\.${rpcName}\\([\\s\\S]+to anon`, "i")
      );
    }

    assert.doesNotMatch(migration, /grant select|grant insert|grant update|grant delete/i);
    assert.doesNotMatch(migration, /create policy/i);
    assert.doesNotMatch(migration, /to authenticated/i);
  });
});
