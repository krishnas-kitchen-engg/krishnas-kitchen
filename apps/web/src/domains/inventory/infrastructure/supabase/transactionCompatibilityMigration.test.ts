import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "vitest";

const migrationsRoot = join(process.cwd(), "infra", "supabase", "migrations");

function readMigration(name: string): string {
  return readFileSync(join(migrationsRoot, name), "utf8");
}

describe("inventory transaction compatibility migrations", () => {
  it("adds reversal without removing legacy undo support", () => {
    const migration = readMigration("20260606000100_add_reversal_transaction_type.sql");

    assert.match(
      migration,
      /alter type public\.inventory_transaction_type\s+add value if not exists 'reversal'/i
    );
    assert.doesNotMatch(migration, /drop value|rename value|drop type/i);
  });

  it("supports current transaction semantics and legacy undo rows", () => {
    const migration = readMigration(
      "20260606000200_reconcile_inventory_transaction_constraints.sql"
    );

    assert.match(migration, /transaction_type = 'received'\s+and quantity_effect = 'increase'/i);
    assert.match(migration, /transaction_type = 'transfer'\s+and quantity_effect = 'transfer'/i);
    assert.match(migration, /transaction_type = 'returned'[\s\S]*'increase'[\s\S]*'transfer'/i);
    assert.match(
      migration,
      /transaction_type in \('reversal', 'undo', 'adjusted'\)[\s\S]*'increase'[\s\S]*'decrease'[\s\S]*'transfer'[\s\S]*'none'/i
    );
    assert.match(
      migration,
      /transaction_type <> 'reversal'[\s\S]*or reversal_of_transaction_id is not null/i
    );
  });
});
