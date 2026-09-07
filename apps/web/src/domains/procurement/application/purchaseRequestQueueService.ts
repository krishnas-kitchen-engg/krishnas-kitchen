import type { PurchaseRequestInput, ProcurementActor } from "../domain/types";
import type { PurchaseRequestRecord } from "./procurementRepository";
import type { PurchaseRequestReviewService } from "./purchaseRequestReviewService";
import type { PurchaseRequestService } from "./purchaseRequestService";

export type ApprovedPurchaseRequestCreateInput = Omit<PurchaseRequestInput, "requestedBy"> & {
  approvedBy: ProcurementActor;
};

export class PurchaseRequestQueueValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PurchaseRequestQueueValidationError";
  }
}

export type PurchaseRequestQueueService = {
  addApprovedPurchaseRequest: (
    input: ApprovedPurchaseRequestCreateInput
  ) => Promise<PurchaseRequestRecord>;
};

function assertValidApprover(actor: ProcurementActor) {
  if (actor.type !== "user" || !actor.userId?.trim()) {
    throw new PurchaseRequestQueueValidationError("A signed-in approver is required.");
  }
}

export function createPurchaseRequestQueueService(options: {
  requestService: PurchaseRequestService;
  reviewService: PurchaseRequestReviewService;
}): PurchaseRequestQueueService {
  return {
    async addApprovedPurchaseRequest(input) {
      assertValidApprover(input.approvedBy);

      const notes = input.notes ?? null;
      const createdRequest = await options.requestService.createPurchaseRequest({
        item: input.item,
        notes,
        organizationId: input.organizationId,
        quantity: input.quantity,
        ...(input.replenishmentKey ? { replenishmentKey: input.replenishmentKey } : {}),
        requestedBy: input.approvedBy,
        templeId: input.templeId,
        unit: input.unit
      });

      return options.reviewService.reviewPurchaseRequest({
        decision: "approved",
        notes,
        organizationId: input.organizationId,
        quantity: createdRequest.quantity,
        requestId: createdRequest.id,
        reviewedBy: input.approvedBy,
        templeId: input.templeId,
        unit: createdRequest.unit
      });
    }
  };
}
