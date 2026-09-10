import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  resolve(process.cwd(), "infra/supabase/migrations/20260910000100_add_inventory_packaging.sql"),
  "utf8"
);

describe("inventory packaging migration", () => {
  it("adds physical handling units and validated package metadata", () => {
    for (const unit of ["bottle", "can", "container", "pack", "bundle", "roll"]) {
      expect(migration).toContain(`add value if not exists '${unit}'`);
    }

    expect(migration).toMatch(/add column if not exists product_name text/i);
    expect(migration).toMatch(/add column if not exists handling_unit public\.item_unit/i);
    expect(migration).toMatch(/add column if not exists handling_unit public\.item_unit/i);
    expect(migration).toMatch(/add column if not exists package_description text/i);
    expect(migration).toMatch(/add column if not exists contents_quantity numeric/i);
    expect(migration).toMatch(/add column if not exists contents_unit public\.item_unit/i);
    expect(migration).toMatch(/add column if not exists contents_label text/i);
    expect(migration).toMatch(/items_contents_metadata_complete/i);
    expect(migration).toMatch(/items_contents_use_base_unit/i);
  });
});
