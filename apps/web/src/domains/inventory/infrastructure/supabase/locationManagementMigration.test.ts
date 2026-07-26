import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, it } from "vitest";

const migration = readFileSync(
  resolve(process.cwd(), "infra/supabase/migrations/20260607000800_add_location_management.sql"),
  "utf8"
);

describe("location management migration", () => {
  it("adds location descriptions and active-name uniqueness", () => {
    assert.match(migration, /add column if not exists description text/i);
    assert.match(migration, /drop constraint if exists locations_unique_name_per_parent/i);
    assert.match(
      migration,
      /create unique index if not exists locations_unique_active_name_per_parent/i
    );
    assert.match(migration, /where deleted_at is null/i);
    assert.match(migration, /lower\(name\)/i);
  });

  it("allows only inventory managers and admins to create or update locations", () => {
    assert.match(migration, /for insert/i);
    assert.match(migration, /for update/i);
    assert.match(migration, /inventory_manager/i);
    assert.match(migration, /temple_admin/i);
    assert.match(migration, /super_admin/i);
  });
});
