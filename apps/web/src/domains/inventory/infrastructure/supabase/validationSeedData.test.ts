import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "vitest";

const testDir = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = join(testDir, "../../../../../../../");
const seedRoot = join(repositoryRoot, "infra", "supabase", "seed");
const coreSeed = readFileSync(join(seedRoot, "seed_validation_core.sql"), "utf8");
const cleanupSeed = readFileSync(join(seedRoot, "seed_validation_cleanup.sql"), "utf8");
const seedRunbook = readFileSync(join(seedRoot, "VALIDATION_SEED_DATA.md"), "utf8");

describe("validation seed data", () => {
  it("includes pilot users with database-backed roles for receiving and manager verification", () => {
    assert.match(coreSeed, /validation\.manager@krishnas-kitchen\.test/i);
    assert.match(coreSeed, /validation\.volunteer@krishnas-kitchen\.test/i);
    assert.match(coreSeed, /insert into public\.user_roles/i);
    assert.match(coreSeed, /'inventory_manager'/i);
    assert.match(coreSeed, /'volunteer'/i);
  });

  it("includes pilot inventory fixtures for barcode and manual receiving", () => {
    assert.match(coreSeed, /insert into public\.items/i);
    assert.match(coreSeed, /Validation Rice/i);
    assert.match(coreSeed, /Validation Oil/i);
    assert.match(coreSeed, /insert into public\.locations/i);
    assert.match(coreSeed, /Validation Pantry/i);
    assert.match(coreSeed, /Validation Freezer/i);
    assert.match(coreSeed, /insert into public\.item_barcodes/i);
    assert.match(coreSeed, /036000291452/i);
    assert.match(coreSeed, /4006381333931/i);
  });

  it("includes visibility, reversal, and low-stock evidence needed for the pilot workflow", () => {
    assert.match(coreSeed, /insert into public\.inventory_transactions/i);
    assert.match(coreSeed, /'received'/i);
    assert.match(coreSeed, /'reversal'/i);
    assert.match(coreSeed, /reversal_of_transaction_id/i);
    assert.match(coreSeed, /"source":"validation_seed"/i);
    assert.match(coreSeed, /insert into public\.inventory_low_stock_thresholds/i);
  });

  it("documents a repeatable pilot reset and cleanup path", () => {
    assert.match(seedRunbook, /Receiving \+ Inventory Visibility Pilot Setup/i);
    assert.match(seedRunbook, /seed_validation_cleanup\.sql/i);
    assert.match(seedRunbook, /seed_validation_core\.sql/i);
    assert.match(cleanupSeed, /30000000-0000-4000-8000-000000000003/i);
  });
});
