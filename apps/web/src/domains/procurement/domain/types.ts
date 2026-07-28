import type { ActorType, EntityId, ItemUnit } from "@krishnas-kitchen/types";

export type ProcurementActor = {
  tempSessionId?: EntityId | null;
  type: ActorType;
  userId?: EntityId | null;
};

export type ProcurementScope = {
  organizationId: EntityId;
  templeId: EntityId;
};

export type PurchaseRequestStatus =
  | "draft"
  | "submitted"
  | "needs_clarification"
  | "approved"
  | "rejected"
  | "included_in_published_list"
  | "cancelled";

export type PurchaseListStatus =
  | "cancelled"
  | "completed"
  | "draft"
  | "in_progress"
  | "published"
  | "ready_to_publish";

export type PurchaseListItemStatus =
  | "bought"
  | "cancelled"
  | "partially_bought"
  | "pending_purchase"
  | "receipt_uploaded"
  | "received_into_inventory"
  | "reconciled"
  | "substituted"
  | "unavailable";

export type PurchaseReceiptStatus =
  | "matched"
  | "needs_review"
  | "partially_matched"
  | "reconciled"
  | "rejected"
  | "uploaded";

export type PurchasePublishMode = "manual" | "scheduled";

export type PurchaseItemReference =
  | {
      itemId: EntityId;
      type: "existing_item";
    }
  | {
      category?: string | null;
      suggestedName: string;
      type: "new_item_suggestion";
    };

export type PurchaseRequestInput = ProcurementScope & {
  item: PurchaseItemReference;
  neededBy?: string | null;
  notes?: string | null;
  quantity: number;
  requestedBy: ProcurementActor;
  unit: ItemUnit;
};

export type PurchaseRequestReviewDecision = "approved" | "needs_clarification" | "rejected";

export type PurchaseRequestReviewInput = ProcurementScope & {
  decision: PurchaseRequestReviewDecision;
  notes?: string | null;
  quantity?: number | null;
  requestId: EntityId;
  reviewedBy: ProcurementActor;
  unit?: ItemUnit | null;
};

export type PurchaseRequestValidationField =
  | "item"
  | "item.itemId"
  | "item.suggestedName"
  | "neededBy"
  | "notes"
  | "organizationId"
  | "quantity"
  | "requestedBy"
  | "templeId"
  | "unit";

export type CatalogItemSummary = {
  category?: string | null;
  defaultUnit: ItemUnit;
  deletedAt?: string | null;
  id: EntityId;
  name: string;
};

export type PurchaseRequestValidationReferences = {
  duplicateCandidates?: readonly CatalogItemSummary[];
  item?: CatalogItemSummary | null;
};

export type PurchaseLocationInput = ProcurementScope & {
  createdBy: ProcurementActor;
  defaultPurchaserUserId?: EntityId | null;
  description?: string | null;
  name: string;
  notes?: string | null;
};

export type ItemPurchasePreferenceInput = ProcurementScope & {
  backupPurchaseLocationId?: EntityId | null;
  createdBy: ProcurementActor;
  estimatedUnitCost?: number | null;
  itemId: EntityId;
  notes?: string | null;
  packSize?: number | null;
  preferredPurchaseLocationId: EntityId;
  preferredPurchaseUnit?: ItemUnit | null;
  purchaserUserId?: EntityId | null;
};

export type PurchaseListInput = ProcurementScope & {
  createdBy: ProcurementActor;
  name: string;
  publishMode?: PurchasePublishMode;
  scheduledPublishAt?: string | null;
};

export type PurchaseListPublishInput = ProcurementScope & {
  name: string;
  publishedBy: ProcurementActor;
};

export type PurchaseListItemProgressStatus =
  | "bought"
  | "partially_bought"
  | "unavailable"
  | "substituted";

export type PurchaseListItemProgressInput = ProcurementScope & {
  itemId: EntityId;
  notes?: string | null;
  purchaseDate?: string | null;
  purchasedBy: ProcurementActor;
  purchasedQuantity?: number | null;
  status: PurchaseListItemProgressStatus;
  totalCost?: number | null;
  unitCost?: number | null;
};

export type PurchaseReceiptUploadInput = ProcurementScope & {
  file: File;
  itemId: EntityId;
  notes?: string | null;
  purchaseDate?: string | null;
  totalCost?: number | null;
  uploadedBy: ProcurementActor;
};

export type PurchaseInventoryReceiveInput = ProcurementScope & {
  itemId: EntityId;
  locationId: EntityId;
  notes?: string | null;
  receivedBy: ProcurementActor;
};
