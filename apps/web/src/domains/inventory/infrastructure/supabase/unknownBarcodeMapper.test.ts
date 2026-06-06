import assert from "node:assert/strict";
import { describe, it } from "vitest";

import type { UnknownBarcodeRow } from "./unknownBarcodeMapper";
import {
  mapUnknownBarcodeDraftToInsert,
  mapUnknownBarcodeRecordToUpdate,
  mapUnknownBarcodeRow
} from "./unknownBarcodeMapper";

const row: UnknownBarcodeRow = {
  actor_temp_session_id: null,
  actor_type: "user",
  actor_user_id: "user-1",
  barcode_format: "upc_a",
  barcode_value: "036000291452",
  created_at: "2026-06-06T08:00:00.000Z",
  dismissal_reason: null,
  dismissed_at: null,
  dismissed_by_actor_temp_session_id: null,
  dismissed_by_actor_type: null,
  dismissed_by_actor_user_id: null,
  first_seen_at: "2026-06-06T08:00:00.000Z",
  id: "unknown-1",
  last_seen_at: "2026-06-06T08:00:00.000Z",
  last_seen_by_actor_temp_session_id: null,
  last_seen_by_actor_type: "user",
  last_seen_by_actor_user_id: "user-1",
  linked_at: null,
  linked_barcode_mapping_id: null,
  linked_by_actor_temp_session_id: null,
  linked_by_actor_type: null,
  linked_by_actor_user_id: null,
  linked_item_id: null,
  notes: "unlabeled bag",
  organization_id: "org-1",
  scan_count: 1,
  source_workflow: "scan",
  status: "pending",
  temple_id: "temple-1",
  updated_at: "2026-06-06T08:00:00.000Z"
};

describe("unknown barcode mapper", () => {
  it("maps unknown barcode rows to domain records", () => {
    const record = mapUnknownBarcodeRow(row);

    assert.equal(record.id, "unknown-1");
    assert.deepEqual(record.barcode, {
      format: "upc_a",
      value: "036000291452"
    });
    assert.deepEqual(record.actor, {
      type: "user",
      userId: "user-1"
    });
    assert.equal(record.status, "pending");
    assert.equal(record.templeId, "temple-1");
  });

  it("maps unknown barcode drafts to insert shape", () => {
    const insert = mapUnknownBarcodeDraftToInsert({
      actor: {
        tempSessionId: "session-1",
        type: "temporary_volunteer"
      },
      barcode: {
        format: "ean_13",
        value: "4006381333931"
      },
      clientId: "unknown-new",
      dismissedAt: null,
      dismissedBy: null,
      dismissalReason: null,
      firstSeenAt: "2026-06-06T08:00:00.000Z",
      lastSeenAt: "2026-06-06T08:00:00.000Z",
      lastSeenBy: {
        tempSessionId: "session-1",
        type: "temporary_volunteer"
      },
      linkedAt: null,
      linkedBarcodeMappingId: null,
      linkedBy: null,
      linkedItemId: null,
      notes: null,
      organizationId: "org-1",
      scanCount: 1,
      sourceWorkflow: "receiving",
      status: "pending",
      templeId: "temple-1"
    });

    assert.equal(insert.id, "unknown-new");
    assert.equal(insert.actor_type, "temporary_volunteer");
    assert.equal(insert.actor_temp_session_id, "session-1");
    assert.equal(insert.barcode_format, "ean_13");
    assert.equal(insert.barcode_value, "4006381333931");
    assert.equal(insert.status, "pending");
    assert.equal(insert.temple_id, "temple-1");
  });

  it("maps link and dismiss lifecycle updates", () => {
    const linkedUpdate = mapUnknownBarcodeRecordToUpdate({
      ...mapUnknownBarcodeRow(row),
      linkedAt: "2026-06-06T09:00:00.000Z",
      linkedBarcodeMappingId: "barcode-mapping-1",
      linkedBy: {
        type: "user",
        userId: "manager-1"
      },
      linkedItemId: "rice",
      status: "linked",
      updatedAt: "2026-06-06T09:00:00.000Z"
    });
    const dismissedUpdate = mapUnknownBarcodeRecordToUpdate({
      ...mapUnknownBarcodeRow(row),
      dismissedAt: "2026-06-06T10:00:00.000Z",
      dismissedBy: {
        type: "system"
      },
      dismissalReason: "not an inventory item",
      status: "dismissed",
      updatedAt: "2026-06-06T10:00:00.000Z"
    });

    assert.equal(linkedUpdate.status, "linked");
    assert.equal(linkedUpdate.linked_barcode_mapping_id, "barcode-mapping-1");
    assert.equal(linkedUpdate.linked_item_id, "rice");
    assert.equal(linkedUpdate.linked_by_actor_user_id, "manager-1");
    assert.equal(dismissedUpdate.status, "dismissed");
    assert.equal(dismissedUpdate.dismissal_reason, "not an inventory item");
    assert.equal(dismissedUpdate.dismissed_by_actor_type, "system");
  });
});
