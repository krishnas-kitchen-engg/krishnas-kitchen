import type { EntityId } from "@krishnas-kitchen/types";
import { isNonEmptyString } from "@krishnas-kitchen/utils";

import type { InventoryActor } from "./types";
import type {
  BarcodeValidationErrorDetail,
  InventoryBarcode,
  InventoryBarcodeScanInput
} from "./barcode";
import { validateBarcode } from "./barcode";

export type UnknownBarcodeStatus = "dismissed" | "linked" | "pending";

export type UnknownBarcodeWorkflowContext = "lookup" | "receiving" | "return" | "scan" | "transfer";

export type UnknownBarcodeItemReference = {
  deletedAt: string | null;
  id: EntityId;
  organizationId: EntityId;
};

export type UnknownBarcodeRecord = {
  actor: InventoryActor;
  barcode: InventoryBarcode;
  createdAt: string;
  dismissedAt: string | null;
  dismissedBy: InventoryActor | null;
  dismissalReason: string | null;
  firstSeenAt: string;
  id: EntityId;
  lastSeenAt: string;
  lastSeenBy: InventoryActor;
  linkedAt: string | null;
  linkedBy: InventoryActor | null;
  linkedItemId: EntityId | null;
  notes: string | null;
  organizationId: EntityId;
  scanCount: number;
  sourceWorkflow: UnknownBarcodeWorkflowContext | null;
  status: UnknownBarcodeStatus;
  templeId: EntityId | null;
  updatedAt: string;
};

export type UnknownBarcodeDraft = Omit<UnknownBarcodeRecord, "createdAt" | "id" | "updatedAt"> & {
  clientId: EntityId;
};

export type RecordUnknownBarcodeInput = InventoryBarcodeScanInput & {
  actor: InventoryActor;
  clientId: EntityId;
  notes?: string;
  organizationId: EntityId;
  scannedAt: string;
  sourceWorkflow?: UnknownBarcodeWorkflowContext;
  templeId?: EntityId;
};

export type LinkUnknownBarcodeInput = {
  actor: InventoryActor;
  item: UnknownBarcodeItemReference | null;
  linkedAt: string;
  notes?: string;
  organizationId: EntityId;
};

export type DismissUnknownBarcodeInput = {
  actor: InventoryActor;
  dismissedAt: string;
  reason: string;
  organizationId: EntityId;
};

export type UnknownBarcodeQuery = {
  limit?: number;
  organizationId: EntityId;
  status?: UnknownBarcodeStatus;
  templeId?: EntityId;
};

export type UnknownBarcodeValidationErrorCode =
  | "BARCODE_INVALID"
  | "DISMISSAL_REASON_REQUIRED"
  | "ITEM_ARCHIVED"
  | "ITEM_NOT_FOUND"
  | "ITEM_ORGANIZATION_MISMATCH"
  | "ORGANIZATION_MISMATCH"
  | "UNKNOWN_BARCODE_NOT_FOUND"
  | "UNKNOWN_BARCODE_NOT_PENDING";

export type UnknownBarcodeValidationErrorDetail = {
  barcodeErrors?: readonly BarcodeValidationErrorDetail[];
  code: UnknownBarcodeValidationErrorCode;
  field: "barcode" | "item" | "organizationId" | "reason" | "status" | "unknownBarcode";
  message: string;
};

export type UnknownBarcodeValidationResult =
  | {
      ok: true;
    }
  | {
      errors: UnknownBarcodeValidationErrorDetail[];
      ok: false;
    };

export class UnknownBarcodeValidationError extends Error {
  readonly errors: readonly UnknownBarcodeValidationErrorDetail[];

  constructor(errors: readonly UnknownBarcodeValidationErrorDetail[]) {
    super("Unknown barcode validation failed.");
    this.name = "UnknownBarcodeValidationError";
    this.errors = errors;
  }
}

function createUnknownBarcodeError(
  code: UnknownBarcodeValidationErrorCode,
  field: UnknownBarcodeValidationErrorDetail["field"],
  message: string,
  barcodeErrors?: readonly BarcodeValidationErrorDetail[]
): UnknownBarcodeValidationErrorDetail {
  return {
    ...(barcodeErrors ? { barcodeErrors } : {}),
    code,
    field,
    message
  };
}

function compareText(left: string, right: string): number {
  return left.localeCompare(right, "en", { sensitivity: "base" });
}

function normalizeNotes(value: string | undefined): string | null {
  const trimmedValue = value?.trim();

  return trimmedValue ? trimmedValue : null;
}

function applyLimit<T>(values: T[], limit: number | undefined): T[] {
  return typeof limit === "number" ? values.slice(0, Math.max(limit, 0)) : values;
}

export function validateUnknownBarcodeScanInput(input: RecordUnknownBarcodeInput):
  | {
      barcode: InventoryBarcode;
      ok: true;
    }
  | {
      errors: UnknownBarcodeValidationErrorDetail[];
      ok: false;
    } {
  const validation = validateBarcode(input);

  if (!validation.ok) {
    return {
      errors: [
        createUnknownBarcodeError(
          "BARCODE_INVALID",
          "barcode",
          "Unknown barcode must be a valid barcode.",
          validation.errors
        )
      ],
      ok: false
    };
  }

  return {
    barcode: validation.barcode,
    ok: true
  };
}

export function validateUnknownBarcodePending(
  record: UnknownBarcodeRecord | null,
  organizationId: EntityId
): UnknownBarcodeValidationResult {
  if (!record) {
    return {
      errors: [
        createUnknownBarcodeError(
          "UNKNOWN_BARCODE_NOT_FOUND",
          "unknownBarcode",
          "Unknown barcode was not found."
        )
      ],
      ok: false
    };
  }

  if (record.organizationId !== organizationId) {
    return {
      errors: [
        createUnknownBarcodeError(
          "ORGANIZATION_MISMATCH",
          "organizationId",
          "Unknown barcode belongs to another organization."
        )
      ],
      ok: false
    };
  }

  if (record.status !== "pending") {
    return {
      errors: [
        createUnknownBarcodeError(
          "UNKNOWN_BARCODE_NOT_PENDING",
          "status",
          "Unknown barcode is no longer pending review."
        )
      ],
      ok: false
    };
  }

  return { ok: true };
}

export function validateUnknownBarcodeLink(
  record: UnknownBarcodeRecord | null,
  input: LinkUnknownBarcodeInput
): UnknownBarcodeValidationResult {
  const pendingValidation = validateUnknownBarcodePending(record, input.organizationId);
  if (!pendingValidation.ok) {
    return pendingValidation;
  }

  if (!input.item) {
    return {
      errors: [createUnknownBarcodeError("ITEM_NOT_FOUND", "item", "Linked item was not found.")],
      ok: false
    };
  }

  if (input.item.organizationId !== input.organizationId) {
    return {
      errors: [
        createUnknownBarcodeError(
          "ITEM_ORGANIZATION_MISMATCH",
          "item",
          "Linked item belongs to another organization."
        )
      ],
      ok: false
    };
  }

  if (input.item.deletedAt) {
    return {
      errors: [createUnknownBarcodeError("ITEM_ARCHIVED", "item", "Linked item is archived.")],
      ok: false
    };
  }

  return { ok: true };
}

export function validateUnknownBarcodeDismissal(
  record: UnknownBarcodeRecord | null,
  input: DismissUnknownBarcodeInput
): UnknownBarcodeValidationResult {
  const pendingValidation = validateUnknownBarcodePending(record, input.organizationId);
  if (!pendingValidation.ok) {
    return pendingValidation;
  }

  if (!isNonEmptyString(input.reason)) {
    return {
      errors: [
        createUnknownBarcodeError(
          "DISMISSAL_REASON_REQUIRED",
          "reason",
          "Dismissal reason is required."
        )
      ],
      ok: false
    };
  }

  return { ok: true };
}

export function createUnknownBarcodeDraft(
  input: RecordUnknownBarcodeInput,
  barcode: InventoryBarcode
): UnknownBarcodeDraft {
  return {
    actor: input.actor,
    barcode,
    clientId: input.clientId,
    dismissedAt: null,
    dismissedBy: null,
    dismissalReason: null,
    firstSeenAt: input.scannedAt,
    lastSeenAt: input.scannedAt,
    lastSeenBy: input.actor,
    linkedAt: null,
    linkedBy: null,
    linkedItemId: null,
    notes: normalizeNotes(input.notes),
    organizationId: input.organizationId,
    scanCount: 1,
    sourceWorkflow: input.sourceWorkflow ?? null,
    status: "pending",
    templeId: input.templeId ?? null
  };
}

export function mergeUnknownBarcodeScan(
  existingRecord: UnknownBarcodeRecord,
  input: RecordUnknownBarcodeInput
): UnknownBarcodeRecord {
  return {
    ...existingRecord,
    lastSeenAt: input.scannedAt,
    lastSeenBy: input.actor,
    notes: normalizeNotes(input.notes) ?? existingRecord.notes,
    scanCount: existingRecord.scanCount + 1,
    sourceWorkflow: input.sourceWorkflow ?? existingRecord.sourceWorkflow,
    templeId: input.templeId ?? existingRecord.templeId,
    updatedAt: input.scannedAt
  };
}

export function linkUnknownBarcode(
  record: UnknownBarcodeRecord,
  input: LinkUnknownBarcodeInput & {
    item: UnknownBarcodeItemReference;
  }
): UnknownBarcodeRecord {
  return {
    ...record,
    linkedAt: input.linkedAt,
    linkedBy: input.actor,
    linkedItemId: input.item.id,
    notes: normalizeNotes(input.notes) ?? record.notes,
    status: "linked",
    updatedAt: input.linkedAt
  };
}

export function dismissUnknownBarcode(
  record: UnknownBarcodeRecord,
  input: DismissUnknownBarcodeInput
): UnknownBarcodeRecord {
  return {
    ...record,
    dismissedAt: input.dismissedAt,
    dismissedBy: input.actor,
    dismissalReason: input.reason.trim(),
    status: "dismissed",
    updatedAt: input.dismissedAt
  };
}

export function sortUnknownBarcodesForReview(
  records: readonly UnknownBarcodeRecord[],
  query: UnknownBarcodeQuery
): UnknownBarcodeRecord[] {
  return applyLimit(
    records
      .filter(
        (record) =>
          record.organizationId === query.organizationId &&
          (!query.templeId || record.templeId === query.templeId) &&
          (!query.status || record.status === query.status)
      )
      .sort(
        (left, right) =>
          compareText(right.lastSeenAt, left.lastSeenAt) || compareText(right.id, left.id)
      ),
    query.limit
  );
}
