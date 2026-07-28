import type { EntityId, ItemUnit, TimestampFields } from "@krishnas-kitchen/types";

import type {
  ItemPurchasePreferenceInput,
  ProcurementActor,
  ProcurementScope,
  PurchaseItemReference,
  PurchaseListItemProgressInput,
  PurchaseListInput,
  PurchaseListItemStatus,
  PurchaseListPublishInput,
  PurchaseListStatus,
  PurchaseLocationInput,
  PurchasePublishMode,
  PurchaseReceiptStatus,
  PurchaseRequestInput,
  PurchaseRequestReviewInput,
  PurchaseRequestStatus
} from "../domain/types";

export type PurchaseRequestRecord = TimestampFields &
  ProcurementScope & {
    id: EntityId;
    includedPurchaseListItemId?: EntityId | null;
    item: PurchaseItemReference;
    neededBy?: string | null;
    notes?: string | null;
    quantity: number;
    requestedBy: ProcurementActor;
    reviewedAt?: string | null;
    reviewedBy?: ProcurementActor | null;
    status: PurchaseRequestStatus;
    unit: ItemUnit;
  };

export type PurchaseLocationRecord = TimestampFields &
  ProcurementScope & {
    archivedAt?: string | null;
    createdBy: ProcurementActor;
    defaultPurchaserUserId?: EntityId | null;
    description?: string | null;
    id: EntityId;
    name: string;
    notes?: string | null;
  };

export type ItemPurchasePreferenceRecord = TimestampFields &
  ProcurementScope & {
    archivedAt?: string | null;
    backupPurchaseLocationId?: EntityId | null;
    createdBy: ProcurementActor;
    estimatedUnitCost?: number | null;
    id: EntityId;
    itemId: EntityId;
    notes?: string | null;
    packSize?: number | null;
    preferredPurchaseLocationId: EntityId;
    preferredPurchaseUnit?: ItemUnit | null;
    purchaserUserId?: EntityId | null;
  };

export type PurchaseListRecord = TimestampFields &
  ProcurementScope & {
    createdBy: ProcurementActor;
    id: EntityId;
    name: string;
    publishMode: PurchasePublishMode;
    publishedAt?: string | null;
    publishedBy?: ProcurementActor | null;
    scheduledPublishAt?: string | null;
    status: PurchaseListStatus;
  };

export type PurchaseListItemRecord = TimestampFields &
  ProcurementScope & {
    approvedQuantity: number;
    assignedPurchaserUserId?: EntityId | null;
    id: EntityId;
    inventoryTransactionId?: EntityId | null;
    item: PurchaseItemReference;
    notes?: string | null;
    purchaseListId: EntityId;
    purchaseLocationId?: EntityId | null;
    purchasedAt?: string | null;
    purchasedBy?: ProcurementActor | null;
    purchasedQuantity?: number | null;
    sourcePurchaseRequestIds: EntityId[];
    status: PurchaseListItemStatus;
    totalCost?: number | null;
    unit: ItemUnit;
    unitCost?: number | null;
  };

export type PurchaseReceiptRecord = TimestampFields &
  ProcurementScope & {
    id: EntityId;
    notes?: string | null;
    purchaseDate?: string | null;
    purchaseListId?: EntityId | null;
    purchaseLocationId?: EntityId | null;
    purchaserUserId: EntityId;
    receiptImagePath: string;
    status: PurchaseReceiptStatus;
    totalCost?: number | null;
    uploadedBy: ProcurementActor;
  };

export type PurchaseRequestListQuery = ProcurementScope & {
  requesterUserId?: EntityId;
  status?: PurchaseRequestStatus;
};

export type PurchaseRequestReviewUpdate = PurchaseRequestReviewInput & {
  reviewedAt: string;
};

export type PurchaseListPublishRepository = {
  listPurchaseLists: (scope: ProcurementScope) => Promise<readonly PurchaseListRecord[]>;
  publishApprovedPurchaseRequests: (input: PurchaseListPublishInput) => Promise<PurchaseListRecord>;
};

export type PurchaseListItemProgressUpdate = PurchaseListItemProgressInput & {
  purchasedAt: string;
};

export type PurchaserListRepository = {
  listAssignedPurchaseListItems: (
    scope: ProcurementScope & { purchaserUserId: EntityId }
  ) => Promise<readonly PurchaseListItemRecord[]>;
  updatePurchaseListItemProgress: (
    input: PurchaseListItemProgressUpdate
  ) => Promise<PurchaseListItemRecord>;
};

export type ProcurementRepository = {
  createItemPurchasePreference: (
    input: ItemPurchasePreferenceInput
  ) => Promise<ItemPurchasePreferenceRecord>;
  createPurchaseList: (input: PurchaseListInput) => Promise<PurchaseListRecord>;
  createPurchaseLocation: (input: PurchaseLocationInput) => Promise<PurchaseLocationRecord>;
  createPurchaseRequest: (input: PurchaseRequestInput) => Promise<PurchaseRequestRecord>;
  findPurchaseRequestById: (
    scope: ProcurementScope & { requestId: EntityId }
  ) => Promise<PurchaseRequestRecord | null>;
  listItemPurchasePreferences: (
    scope: ProcurementScope
  ) => Promise<readonly ItemPurchasePreferenceRecord[]>;
  listPurchaseLocations: (scope: ProcurementScope) => Promise<readonly PurchaseLocationRecord[]>;
  listPurchaseRequests: (
    query: PurchaseRequestListQuery
  ) => Promise<readonly PurchaseRequestRecord[]>;
  reviewPurchaseRequest: (input: PurchaseRequestReviewUpdate) => Promise<PurchaseRequestRecord>;
};
