import assert from "node:assert/strict";
import { describe, it } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@krishnas-kitchen/types";

import type { InventoryItemRow, InventoryLocationRow } from "./inventoryCatalogMapper";
import type { InventoryTransactionRow } from "./inventoryTransactionMapper";
import type { InventoryLowStockThresholdRow } from "./lowStockThresholdMapper";
import type { UnknownBarcodeRow } from "./unknownBarcodeMapper";
import type { InventoryBarcodeRow } from "./inventoryCatalogMapper";
import { createSupabaseInventoryRepositoryAdapters } from "./supabaseInventoryRepositoryAdapters";

type RpcName =
  | "list_volunteer_inventory_barcodes"
  | "list_volunteer_inventory_items"
  | "list_volunteer_inventory_locations"
  | "list_volunteer_inventory_low_stock_thresholds"
  | "list_volunteer_inventory_transactions"
  | "list_volunteer_pending_unknown_barcodes"
  | "lookup_volunteer_inventory_barcode";

class VolunteerReadRpcStub {
  readonly fromCalls: string[] = [];
  readonly rpcCalls: Array<{ name: RpcName; params: Record<string, unknown> }> = [];

  constructor(private readonly responses: Partial<Record<RpcName, unknown[]>> = {}) {}

  from(table: string): never {
    this.fromCalls.push(table);
    throw new Error(`Direct table access is not allowed in volunteer read tests: ${table}`);
  }

  rpc<TData>(
    name: RpcName,
    params: Record<string, unknown>
  ): Promise<{ data: TData; error: null }> {
    this.rpcCalls.push({ name, params });

    return Promise.resolve({
      data: (this.responses[name] ?? []) as TData,
      error: null
    });
  }
}

function createVolunteerAdapters(responses: Partial<Record<RpcName, unknown[]>> = {}) {
  const stub = new VolunteerReadRpcStub(responses);
  const adapters = createSupabaseInventoryRepositoryAdapters(
    stub as unknown as SupabaseClient<Database>,
    {
      volunteerReadSession: {
        clientSessionId: "client-session-1",
        sessionId: "volunteer-session-1"
      }
    }
  );

  return { adapters, stub };
}

const itemRow: InventoryItemRow = {
  default_unit: "kg",
  deleted_at: null,
  id: "rice",
  name: "Rice",
  organization_id: "org-from-session",
  receiving_units: ["kg"],
  return_units: ["kg"],
  transfer_units: ["kg"]
};

const locationRow: InventoryLocationRow = {
  deleted_at: null,
  id: "pantry",
  name: "Pantry",
  organization_id: "org-from-session",
  temple_id: "temple-from-session"
};

const barcodeRow: InventoryBarcodeRow = {
  archived_at: null,
  archived_by_actor_temp_session_id: null,
  archived_by_actor_type: null,
  archived_by_actor_user_id: null,
  archive_reason: null,
  barcode: "036000291452",
  barcode_format: "upc_a",
  barcode_value: "036000291452",
  created_at: "2026-06-07T08:00:00.000Z",
  created_by_actor_temp_session_id: null,
  created_by_actor_type: "system",
  created_by_actor_user_id: null,
  id: "barcode-rice",
  item_id: "rice",
  notes: null,
  organization_id: "org-from-session",
  source_unknown_barcode_id: null,
  updated_at: "2026-06-07T08:00:00.000Z"
};

const transactionRow: InventoryTransactionRow = {
  actor_temp_session_id: "volunteer-session-1",
  actor_type: "temporary_volunteer",
  actor_user_id: null,
  audit_metadata: {},
  created_at: "2026-06-07T08:10:00.000Z",
  destination_location_id: "pantry",
  id: "transaction-1",
  item_id: "rice",
  notes: null,
  organization_id: "org-from-session",
  quantity: 5,
  quantity_effect: "increase",
  reversal_of_transaction_id: null,
  source_location_id: null,
  temple_id: "temple-from-session",
  transaction_type: "received",
  unit: "kg"
};

const thresholdRow: InventoryLowStockThresholdRow = {
  archived_at: null,
  archived_by_actor_temp_session_id: null,
  archived_by_actor_type: null,
  archived_by_actor_user_id: null,
  created_at: "2026-06-07T08:00:00.000Z",
  created_by_actor_temp_session_id: null,
  created_by_actor_type: "system",
  created_by_actor_user_id: null,
  id: "threshold-1",
  item_id: "rice",
  location_id: "pantry",
  minimum_quantity: 10,
  organization_id: "org-from-session",
  temple_id: "temple-from-session",
  unit: "kg",
  updated_at: "2026-06-07T08:00:00.000Z"
};

const unknownBarcodeRow: UnknownBarcodeRow = {
  actor_temp_session_id: "volunteer-session-1",
  actor_type: "temporary_volunteer",
  actor_user_id: null,
  barcode_format: "upc_a",
  barcode_value: "042100005264",
  created_at: "2026-06-07T08:00:00.000Z",
  dismissal_reason: null,
  dismissed_at: null,
  dismissed_by_actor_temp_session_id: null,
  dismissed_by_actor_type: null,
  dismissed_by_actor_user_id: null,
  first_seen_at: "2026-06-07T08:00:00.000Z",
  id: "unknown-1",
  last_seen_at: "2026-06-07T08:05:00.000Z",
  last_seen_by_actor_temp_session_id: "volunteer-session-1",
  last_seen_by_actor_type: "temporary_volunteer",
  last_seen_by_actor_user_id: null,
  linked_at: null,
  linked_barcode_mapping_id: null,
  linked_by_actor_temp_session_id: null,
  linked_by_actor_type: null,
  linked_by_actor_user_id: null,
  linked_item_id: null,
  notes: null,
  organization_id: "org-from-session",
  scan_count: 1,
  source_workflow: "scan",
  status: "pending",
  temple_id: "temple-from-session",
  updated_at: "2026-06-07T08:05:00.000Z"
};

describe("Supabase volunteer inventory read repositories", () => {
  it("routes volunteer item and location reads through RPCs without direct table access", async () => {
    const { adapters, stub } = createVolunteerAdapters({
      list_volunteer_inventory_items: [itemRow],
      list_volunteer_inventory_locations: [locationRow]
    });

    const items = await adapters.catalogQueryRepository.listItems("browser-org");
    const locations = await adapters.catalogQueryRepository.listLocations("browser-org");

    assert.deepEqual(
      items.map((item) => item.id),
      ["rice"]
    );
    assert.deepEqual(
      locations.map((location) => location.id),
      ["pantry"]
    );
    assert.deepEqual(stub.fromCalls, []);
    assert.deepEqual(
      stub.rpcCalls.map((call) => call.name),
      ["list_volunteer_inventory_items", "list_volunteer_inventory_locations"]
    );
    assert.equal(stub.rpcCalls[0]?.params.volunteer_session_id, "volunteer-session-1");
    assert.equal(stub.rpcCalls[0]?.params.expected_client_session_id, "client-session-1");
  });

  it("routes volunteer barcode lookup through RPCs and ignores browser organization scope", async () => {
    const { adapters, stub } = createVolunteerAdapters({
      list_volunteer_inventory_items: [itemRow],
      lookup_volunteer_inventory_barcode: [barcodeRow]
    });

    const matches = await adapters.barcodeLookupRepository.findItemsByBarcode("browser-org", {
      format: "upc_a",
      value: "036000291452"
    });

    assert.deepEqual(
      matches.map((item) => item.id),
      ["rice"]
    );
    assert.deepEqual(matches[0]?.barcodes, [
      {
        format: "upc_a",
        value: "036000291452"
      }
    ]);
    assert.deepEqual(stub.fromCalls, []);
    assert.deepEqual(
      stub.rpcCalls.map((call) => call.name),
      ["lookup_volunteer_inventory_barcode", "list_volunteer_inventory_items"]
    );
    assert.equal(stub.rpcCalls[0]?.params.requested_barcode_value, "036000291452");
  });

  it("routes volunteer barcode catalog listing through RPCs", async () => {
    const { adapters, stub } = createVolunteerAdapters({
      list_volunteer_inventory_barcodes: [barcodeRow],
      list_volunteer_inventory_items: [itemRow]
    });

    const barcodes = await adapters.catalogQueryRepository.listBarcodes("browser-org");

    assert.deepEqual(barcodes, [
      {
        format: "upc_a",
        itemId: "rice",
        itemName: "Rice",
        organizationId: "org-from-session",
        value: "036000291452"
      }
    ]);
    assert.deepEqual(stub.fromCalls, []);
    assert.deepEqual(
      stub.rpcCalls.map((call) => call.name),
      ["list_volunteer_inventory_barcodes", "list_volunteer_inventory_items"]
    );
  });

  it("routes volunteer visibility, low stock, and unknown barcode reads through RPCs", async () => {
    const { adapters, stub } = createVolunteerAdapters({
      list_volunteer_inventory_low_stock_thresholds: [thresholdRow],
      list_volunteer_inventory_transactions: [transactionRow],
      list_volunteer_pending_unknown_barcodes: [unknownBarcodeRow]
    });

    const transactions = await adapters.transactionRepository.listTransactions({
      organizationId: "browser-org",
      templeId: "temple-from-session"
    });
    const thresholds = await adapters.lowStockThresholdRepository.listActiveLowStockThresholds({
      organizationId: "browser-org",
      templeId: "temple-from-session"
    });
    const unknownBarcodes = await adapters.unknownBarcodeRepository.listUnknownBarcodes({
      organizationId: "browser-org",
      status: "pending",
      templeId: "temple-from-session"
    });

    assert.deepEqual(
      transactions.map((transaction) => transaction.id),
      ["transaction-1"]
    );
    assert.deepEqual(
      thresholds.map((threshold) => threshold.itemId),
      ["rice"]
    );
    assert.deepEqual(
      unknownBarcodes.map((barcode) => barcode.id),
      ["unknown-1"]
    );
    assert.deepEqual(stub.fromCalls, []);
    assert.deepEqual(
      stub.rpcCalls.map((call) => call.name),
      [
        "list_volunteer_inventory_transactions",
        "list_volunteer_inventory_low_stock_thresholds",
        "list_volunteer_pending_unknown_barcodes"
      ]
    );
  });

  it("returns empty read models when volunteer RPC validation returns no rows", async () => {
    const { adapters, stub } = createVolunteerAdapters();

    const items = await adapters.catalogQueryRepository.listItems("browser-org");
    const locations = await adapters.catalogQueryRepository.listLocations("browser-org");
    const transactions = await adapters.transactionRepository.listTransactions({
      organizationId: "browser-org"
    });

    assert.deepEqual(items, []);
    assert.deepEqual(locations, []);
    assert.deepEqual(transactions, []);
    assert.deepEqual(stub.fromCalls, []);
  });

  it("returns empty barcode catalog results when volunteer RPC validation returns no rows", async () => {
    const { adapters, stub } = createVolunteerAdapters();

    const barcodes = await adapters.catalogQueryRepository.listBarcodes("browser-org");

    assert.deepEqual(barcodes, []);
    assert.deepEqual(stub.fromCalls, []);
    assert.deepEqual(
      stub.rpcCalls.map((call) => call.name),
      ["list_volunteer_inventory_barcodes", "list_volunteer_inventory_items"]
    );
  });
});
