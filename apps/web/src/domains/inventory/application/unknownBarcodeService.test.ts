import assert from "node:assert/strict";
import { describe, it } from "vitest";

import type { InventoryBarcode } from "../domain/barcode";
import type {
  UnknownBarcodeDraft,
  UnknownBarcodeItemReference,
  UnknownBarcodeRecord
} from "../domain/unknownBarcode";
import { UnknownBarcodeValidationError } from "../domain/unknownBarcode";
import {
  createUnknownBarcodeManagementService,
  type UnknownBarcodeItemRepository,
  type UnknownBarcodeRepository
} from "./unknownBarcodeService";

const actor = {
  type: "user" as const,
  userId: "manager-1"
};

const volunteerActor = {
  tempSessionId: "temp-1",
  type: "temporary_volunteer" as const
};

const riceItem: UnknownBarcodeItemReference = {
  deletedAt: null,
  id: "rice",
  organizationId: "org-1"
};

function sameBarcode(left: InventoryBarcode, right: InventoryBarcode): boolean {
  return left.format === right.format && left.value === right.value;
}

function persistUnknownBarcode(
  draft: UnknownBarcodeDraft,
  id: string,
  createdAt = draft.firstSeenAt
): UnknownBarcodeRecord {
  return {
    ...draft,
    createdAt,
    id,
    updatedAt: createdAt
  };
}

function createRepositories(
  options: {
    items?: readonly UnknownBarcodeItemReference[];
    records?: readonly UnknownBarcodeRecord[];
  } = {}
) {
  const records = [...(options.records ?? [])];
  const writes: UnknownBarcodeRecord[] = [];
  const itemLookups: { itemId: string; organizationId: string }[] = [];

  const unknownBarcodeRepository: UnknownBarcodeRepository & {
    records: UnknownBarcodeRecord[];
    writes: UnknownBarcodeRecord[];
  } = {
    records,
    writes,
    createUnknownBarcode(draft) {
      const record = persistUnknownBarcode(draft, draft.clientId);
      records.push(record);
      writes.push(record);

      return Promise.resolve(record);
    },
    findPendingUnknownBarcodeByBarcode(organizationId, barcode) {
      return Promise.resolve(
        records.find(
          (record) =>
            record.organizationId === organizationId &&
            record.status === "pending" &&
            sameBarcode(record.barcode, barcode)
        ) ?? null
      );
    },
    findUnknownBarcodeById(id) {
      return Promise.resolve(records.find((record) => record.id === id) ?? null);
    },
    listUnknownBarcodes(query) {
      return Promise.resolve(
        records.filter(
          (record) =>
            record.organizationId === query.organizationId &&
            (!query.templeId || record.templeId === query.templeId) &&
            (!query.status || record.status === query.status)
        )
      );
    },
    updateUnknownBarcode(record) {
      const index = records.findIndex((existingRecord) => existingRecord.id === record.id);
      if (index >= 0) {
        records[index] = record;
      }
      writes.push(record);

      return Promise.resolve(record);
    }
  };

  const itemRepository: UnknownBarcodeItemRepository & {
    itemLookups: { itemId: string; organizationId: string }[];
  } = {
    itemLookups,
    findItemForBarcodeLinking(itemId, organizationId) {
      itemLookups.push({ itemId, organizationId });

      return Promise.resolve(
        (options.items ?? []).find(
          (item) => item.id === itemId && item.organizationId === organizationId
        ) ?? null
      );
    }
  };

  return {
    itemRepository,
    service: createUnknownBarcodeManagementService({
      itemRepository,
      unknownBarcodeRepository
    }),
    unknownBarcodeRepository
  };
}

function createPendingRecord(overrides: Partial<UnknownBarcodeRecord> = {}): UnknownBarcodeRecord {
  return {
    actor,
    barcode: {
      format: "upc_a",
      value: "036000291452"
    },
    createdAt: "2026-06-04T08:00:00.000Z",
    dismissedAt: null,
    dismissedBy: null,
    dismissalReason: null,
    firstSeenAt: "2026-06-04T08:00:00.000Z",
    id: "unknown-1",
    lastSeenAt: "2026-06-04T08:00:00.000Z",
    lastSeenBy: actor,
    linkedAt: null,
    linkedBy: null,
    linkedItemId: null,
    notes: null,
    organizationId: "org-1",
    scanCount: 1,
    sourceWorkflow: "receiving",
    status: "pending",
    templeId: "temple-1",
    updatedAt: "2026-06-04T08:00:00.000Z",
    ...overrides
  };
}

describe("unknown barcode management service", () => {
  it("records valid unknown barcodes as pending review records", async () => {
    const { service, unknownBarcodeRepository } = createRepositories();

    const record = await service.recordUnknownBarcode({
      actor,
      clientId: "unknown-1",
      format: "upc_a",
      notes: "unlabeled rice bag",
      organizationId: "org-1",
      rawValue: "036000-29145 2",
      scannedAt: "2026-06-04T08:00:00.000Z",
      sourceWorkflow: "receiving",
      templeId: "temple-1"
    });

    assert.equal(record.status, "pending");
    assert.deepEqual(record.barcode, {
      format: "upc_a",
      value: "036000291452"
    });
    assert.equal(record.scanCount, 1);
    assert.equal(record.notes, "unlabeled rice bag");
    assert.equal(unknownBarcodeRepository.records.length, 1);
  });

  it("merges duplicate pending unknown barcode scans within an organization", async () => {
    const existingRecord = createPendingRecord();
    const { service, unknownBarcodeRepository } = createRepositories({
      records: [existingRecord]
    });

    const record = await service.recordUnknownBarcode({
      actor: volunteerActor,
      clientId: "ignored-client-id",
      format: "upc_a",
      notes: "seen again",
      organizationId: "org-1",
      rawValue: "036000291452",
      scannedAt: "2026-06-04T09:00:00.000Z",
      sourceWorkflow: "transfer",
      templeId: "temple-1"
    });

    assert.equal(record.id, "unknown-1");
    assert.equal(record.scanCount, 2);
    assert.equal(record.lastSeenAt, "2026-06-04T09:00:00.000Z");
    assert.equal(record.lastSeenBy.type, "temporary_volunteer");
    assert.equal(record.sourceWorkflow, "transfer");
    assert.equal(unknownBarcodeRepository.records.length, 1);
    assert.equal(unknownBarcodeRepository.writes.length, 1);
  });

  it("rejects invalid barcode values before persistence", async () => {
    const { service, unknownBarcodeRepository } = createRepositories();

    await assert.rejects(
      () =>
        service.recordUnknownBarcode({
          actor,
          clientId: "unknown-invalid",
          format: "upc_a",
          organizationId: "org-1",
          rawValue: "036000291453",
          scannedAt: "2026-06-04T08:00:00.000Z"
        }),
      UnknownBarcodeValidationError
    );
    assert.equal(unknownBarcodeRepository.records.length, 0);
  });

  it("lists pending review records within organization and temple boundaries deterministically", async () => {
    const { service } = createRepositories({
      records: [
        createPendingRecord({
          id: "old-pending",
          lastSeenAt: "2026-06-04T08:00:00.000Z"
        }),
        createPendingRecord({
          id: "new-pending",
          lastSeenAt: "2026-06-04T10:00:00.000Z"
        }),
        createPendingRecord({
          id: "other-temple",
          lastSeenAt: "2026-06-04T11:00:00.000Z",
          templeId: "temple-2"
        }),
        createPendingRecord({
          id: "linked-record",
          lastSeenAt: "2026-06-04T12:00:00.000Z",
          status: "linked"
        }),
        createPendingRecord({
          id: "other-org",
          lastSeenAt: "2026-06-04T13:00:00.000Z",
          organizationId: "org-2"
        })
      ]
    });

    const records = await service.listPendingUnknownBarcodes({
      limit: 2,
      organizationId: "org-1",
      templeId: "temple-1"
    });

    assert.deepEqual(
      records.map((record) => record.id),
      ["new-pending", "old-pending"]
    );
  });

  it("links pending unknown barcodes to active items in the same organization", async () => {
    const { itemRepository, service } = createRepositories({
      items: [riceItem],
      records: [createPendingRecord()]
    });

    const record = await service.linkUnknownBarcode("unknown-1", {
      actor,
      itemId: "rice",
      linkedAt: "2026-06-04T10:00:00.000Z",
      notes: "matched rice bag",
      organizationId: "org-1"
    });

    assert.equal(record.status, "linked");
    assert.equal(record.linkedItemId, "rice");
    assert.equal(record.linkedAt, "2026-06-04T10:00:00.000Z");
    assert.equal(record.notes, "matched rice bag");
    assert.deepEqual(itemRepository.itemLookups, [
      {
        itemId: "rice",
        organizationId: "org-1"
      }
    ]);
  });

  it("rejects linking when status or organization boundaries are invalid", async () => {
    const { service } = createRepositories({
      items: [riceItem],
      records: [
        createPendingRecord({
          id: "linked-record",
          linkedItemId: "rice",
          status: "linked"
        }),
        createPendingRecord({
          id: "other-org-record",
          organizationId: "org-2"
        })
      ]
    });

    await assert.rejects(
      () =>
        service.linkUnknownBarcode("linked-record", {
          actor,
          itemId: "rice",
          linkedAt: "2026-06-04T10:00:00.000Z",
          organizationId: "org-1"
        }),
      UnknownBarcodeValidationError
    );
    await assert.rejects(
      () =>
        service.linkUnknownBarcode("other-org-record", {
          actor,
          itemId: "rice",
          linkedAt: "2026-06-04T10:00:00.000Z",
          organizationId: "org-1"
        }),
      UnknownBarcodeValidationError
    );
  });

  it("rejects linking missing, archived, or cross-organization items", async () => {
    const archivedItem = {
      ...riceItem,
      deletedAt: "2026-06-04T08:00:00.000Z",
      id: "archived-rice"
    };
    const { service } = createRepositories({
      items: [archivedItem],
      records: [createPendingRecord()]
    });

    await assert.rejects(
      () =>
        service.linkUnknownBarcode("unknown-1", {
          actor,
          itemId: "missing-rice",
          linkedAt: "2026-06-04T10:00:00.000Z",
          organizationId: "org-1"
        }),
      UnknownBarcodeValidationError
    );
    await assert.rejects(
      () =>
        service.linkUnknownBarcode("unknown-1", {
          actor,
          itemId: "archived-rice",
          linkedAt: "2026-06-04T10:00:00.000Z",
          organizationId: "org-1"
        }),
      UnknownBarcodeValidationError
    );
  });

  it("dismisses pending unknown barcodes with an audit reason", async () => {
    const { service } = createRepositories({
      records: [createPendingRecord()]
    });

    const record = await service.dismissUnknownBarcode("unknown-1", {
      actor,
      dismissedAt: "2026-06-04T10:00:00.000Z",
      organizationId: "org-1",
      reason: "duplicate vendor label"
    });

    assert.equal(record.status, "dismissed");
    assert.equal(record.dismissalReason, "duplicate vendor label");
    assert.equal(record.dismissedAt, "2026-06-04T10:00:00.000Z");
  });

  it("rejects dismissals without a reason", async () => {
    const { service } = createRepositories({
      records: [createPendingRecord()]
    });

    await assert.rejects(
      () =>
        service.dismissUnknownBarcode("unknown-1", {
          actor,
          dismissedAt: "2026-06-04T10:00:00.000Z",
          organizationId: "org-1",
          reason: " "
        }),
      UnknownBarcodeValidationError
    );
  });
});
