import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const migration = readFileSync(
  resolve(process.cwd(), "infra/supabase/migrations/20260910000200_add_item_workflow_units.sql"),
  "utf8"
);

describe("item workflow units migration", () => {
  it("adds every unit array written by item management", () => {
    for (const column of ["receiving_units", "transfer_units", "return_units"]) {
      expect(migration).toContain(`add column if not exists ${column} public.item_unit[]`);
    }
  });

  it("backfills each workflow with the item's default unit", () => {
    for (const column of ["receiving_units", "transfer_units", "return_units"]) {
      expect(migration).toContain(
        `${column} = coalesce(${column}, array[default_unit]::public.item_unit[])`
      );
    }
  });
});
