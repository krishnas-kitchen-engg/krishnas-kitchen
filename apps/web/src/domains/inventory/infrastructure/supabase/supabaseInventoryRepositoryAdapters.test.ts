import assert from "node:assert/strict";
import { describe, it } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@krishnas-kitchen/types";

import {
  createSupabaseInventoryRepositoryAdapters,
  UnsupportedInventoryRepositoryAdapterError
} from "./supabaseInventoryRepositoryAdapters";

describe("supabase inventory repository adapters", () => {
  it("provides transaction repository plus explicit scaffolds for pending adapters", async () => {
    const adapters = createSupabaseInventoryRepositoryAdapters({} as SupabaseClient<Database>);

    assert.equal(typeof adapters.transactionRepository.listTransactions, "function");
    await assert.rejects(
      () => adapters.catalogQueryRepository.listItems("org-1"),
      UnsupportedInventoryRepositoryAdapterError
    );
    await assert.rejects(
      () => adapters.unknownBarcodeRepository.listUnknownBarcodes({ organizationId: "org-1" }),
      UnsupportedInventoryRepositoryAdapterError
    );
  });
});
