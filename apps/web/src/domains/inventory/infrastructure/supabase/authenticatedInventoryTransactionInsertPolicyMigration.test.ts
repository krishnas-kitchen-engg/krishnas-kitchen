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
    "20260607000600_add_authenticated_inventory_transaction_insert_policy.sql"
  ),
  "utf8"
);

describe("authenticated inventory transaction insert policy migration", () => {
  it("adds an authenticated insert policy for inventory transactions", () => {
    assert.match(migration, /on public\.inventory_transactions/i);
    assert.match(migration, /for insert/i);
    assert.match(migration, /to authenticated/i);
    assert.match(migration, /with check/i);
  });

  it("requires permanent user actor identity to match the authenticated user", () => {
    assert.match(migration, /actor_type = 'user'/i);
    assert.match(migration, /actor_user_id = auth\.uid\(\)/i);
    assert.match(migration, /actor_temp_session_id is null/i);
    assert.doesNotMatch(migration, /to anon/i);
  });

  it("derives organization, temple, and role authorization from database helpers", () => {
    assert.match(migration, /public\.is_authenticated_user_in_organization\(organization_id\)/i);
    assert.match(migration, /public\.is_authenticated_user_assigned_to_temple\(temple_id\)/i);
    assert.match(migration, /public\.current_authenticated_user_roles\(\)/i);
    assert.match(
      migration,
      /authenticated_role\.organization_id = inventory_transactions\.organization_id/i
    );
    assert.match(migration, /authenticated_role\.temple_id = inventory_transactions\.temple_id/i);
  });

  it("limits receiving and reversal writes to the expected role families", () => {
    assert.match(
      migration,
      /transaction_type in \('received', 'transfer', 'returned', 'consumed'\)[\s\S]+'volunteer'[\s\S]+'cook'[\s\S]+'senior_cook'[\s\S]+'inventory_manager'[\s\S]+'temple_admin'[\s\S]+'super_admin'/i
    );
    assert.match(
      migration,
      /transaction_type in \('reversal', 'undo', 'adjusted'\)[\s\S]+'inventory_manager'[\s\S]+'temple_admin'[\s\S]+'super_admin'/i
    );
  });

  it("requires active item and scoped active locations for inserted transactions", () => {
    assert.match(migration, /from public\.items item/i);
    assert.match(migration, /item\.deleted_at is null/i);
    assert.match(migration, /source_location\.temple_id = temple_id/i);
    assert.match(migration, /destination_location\.temple_id = temple_id/i);
    assert.match(migration, /source_location\.deleted_at is null/i);
    assert.match(migration, /destination_location\.deleted_at is null/i);
  });
});
