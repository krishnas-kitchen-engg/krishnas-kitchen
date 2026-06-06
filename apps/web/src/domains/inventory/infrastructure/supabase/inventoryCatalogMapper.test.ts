import assert from "node:assert/strict";
import { describe, it } from "vitest";

import type { InventoryBarcodeRow } from "./inventoryCatalogMapper";
import {
  mapInventoryBarcodeArchiveUpdate,
  mapInventoryBarcodeMappingRow,
  mapInventoryBarcodeMappingToInsert
} from "./inventoryCatalogMapper";

const barcodeRow: InventoryBarcodeRow = {
  archived_at: null,
  archived_by_actor_temp_session_id: null,
  archived_by_actor_type: null,
  archived_by_actor_user_id: null,
  archive_reason: null,
  barcode: "4006381333931",
  barcode_format: "ean_13",
  barcode_value: "4006381333931",
  created_at: "2026-06-06T08:00:00.000Z",
  created_by_actor_temp_session_id: null,
  created_by_actor_type: "user",
  created_by_actor_user_id: "user-1",
  id: "mapping-1",
  item_id: "rice",
  notes: "case barcode",
  organization_id: "org-1",
  source_unknown_barcode_id: "unknown-1",
  updated_at: "2026-06-06T08:00:00.000Z"
};

describe("inventory catalog mapper", () => {
  it("maps barcode mapping rows with explicit actor and unknown barcode traceability", () => {
    const mapping = mapInventoryBarcodeMappingRow(barcodeRow);

    assert.equal(mapping.id, "mapping-1");
    assert.deepEqual(mapping.barcode, {
      format: "ean_13",
      value: "4006381333931"
    });
    assert.deepEqual(mapping.createdBy, {
      type: "user",
      userId: "user-1"
    });
    assert.equal(mapping.sourceUnknownBarcodeId, "unknown-1");
  });

  it("maps barcode mapping drafts to repository insert shape without legacy column coupling", () => {
    const insert = mapInventoryBarcodeMappingToInsert({
      archivedAt: null,
      archivedBy: null,
      archiveReason: null,
      barcode: {
        format: "upc_a",
        value: "036000291452"
      },
      clientId: "mapping-new",
      createdBy: {
        tempSessionId: "session-1",
        type: "temporary_volunteer"
      },
      itemId: "rice",
      notes: null,
      organizationId: "org-1",
      sourceUnknownBarcodeId: "unknown-1"
    });

    assert.equal(insert.barcode_format, "upc_a");
    assert.equal(insert.barcode_value, "036000291452");
    assert.equal(insert.barcode, undefined);
    assert.equal(insert.created_by_actor_type, "temporary_volunteer");
    assert.equal(insert.created_by_actor_temp_session_id, "session-1");
    assert.equal(insert.source_unknown_barcode_id, "unknown-1");
  });

  it("maps archival updates without changing barcode identity", () => {
    const update = mapInventoryBarcodeArchiveUpdate({
      ...mapInventoryBarcodeMappingRow(barcodeRow),
      archivedAt: "2026-06-06T09:00:00.000Z",
      archivedBy: {
        type: "system"
      },
      archiveReason: "duplicate",
      updatedAt: "2026-06-06T09:00:00.000Z"
    });

    assert.equal(update.archived_at, "2026-06-06T09:00:00.000Z");
    assert.equal(update.archived_by_actor_type, "system");
    assert.equal(update.archive_reason, "duplicate");
    assert.equal(update.updated_at, "2026-06-06T09:00:00.000Z");
    assert.equal("barcode_value" in update, false);
  });
});
