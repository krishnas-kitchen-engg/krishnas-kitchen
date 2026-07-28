import type {
  PurchaseListPublishInput,
  PurchaseListScheduleInput,
  ScheduledPurchaseListPublishInput
} from "../domain/types";
import type { PurchaseListPublishRepository, PurchaseListRecord } from "./procurementRepository";

export class PurchaseListPublishValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PurchaseListPublishValidationError";
  }
}

export type PurchaseListPublishService = {
  listPurchaseLists: (
    scope: Pick<PurchaseListPublishInput, "organizationId" | "templeId">
  ) => Promise<readonly PurchaseListRecord[]>;
  publishApprovedPurchaseRequests: (input: PurchaseListPublishInput) => Promise<PurchaseListRecord>;
  publishScheduledPurchaseList: (
    input: ScheduledPurchaseListPublishInput
  ) => Promise<PurchaseListRecord>;
  scheduleApprovedPurchaseRequests: (
    input: PurchaseListScheduleInput
  ) => Promise<PurchaseListRecord>;
};

function assertValidPublishInput(input: PurchaseListPublishInput) {
  if (!input.organizationId.trim()) {
    throw new PurchaseListPublishValidationError("Organization is required.");
  }

  if (!input.templeId.trim()) {
    throw new PurchaseListPublishValidationError("Temple is required.");
  }

  if (!input.name.trim()) {
    throw new PurchaseListPublishValidationError("Purchase list name is required.");
  }

  if (input.name.trim().length > 120) {
    throw new PurchaseListPublishValidationError(
      "Purchase list name must be 120 characters or fewer."
    );
  }

  if (input.publishedBy.type !== "user" || !input.publishedBy.userId?.trim()) {
    throw new PurchaseListPublishValidationError("A signed-in publisher is required.");
  }
}

function assertValidScheduleInput(input: PurchaseListScheduleInput) {
  assertValidPublishInput({
    name: input.name,
    organizationId: input.organizationId,
    publishedBy: input.scheduledBy,
    templeId: input.templeId
  });

  const scheduledDate = new Date(input.scheduledPublishAt);

  if (Number.isNaN(scheduledDate.getTime())) {
    throw new PurchaseListPublishValidationError("Scheduled publish time must be valid.");
  }

  if (scheduledDate.getTime() <= Date.now()) {
    throw new PurchaseListPublishValidationError("Scheduled publish time must be in the future.");
  }
}

function assertValidScheduledPublishInput(input: ScheduledPurchaseListPublishInput) {
  if (!input.organizationId.trim()) {
    throw new PurchaseListPublishValidationError("Organization is required.");
  }

  if (!input.templeId.trim()) {
    throw new PurchaseListPublishValidationError("Temple is required.");
  }

  if (!input.listId.trim()) {
    throw new PurchaseListPublishValidationError("Scheduled purchase list is required.");
  }

  if (input.publishedBy.type !== "user" || !input.publishedBy.userId?.trim()) {
    throw new PurchaseListPublishValidationError("A signed-in publisher is required.");
  }
}

export function createPurchaseListPublishService(
  repository: PurchaseListPublishRepository
): PurchaseListPublishService {
  return {
    listPurchaseLists(scope) {
      return repository.listPurchaseLists(scope);
    },

    publishApprovedPurchaseRequests(input) {
      assertValidPublishInput(input);

      return repository.publishApprovedPurchaseRequests({
        ...input,
        name: input.name.trim()
      });
    },

    publishScheduledPurchaseList(input) {
      assertValidScheduledPublishInput(input);

      return repository.publishScheduledPurchaseList(input);
    },

    scheduleApprovedPurchaseRequests(input) {
      assertValidScheduleInput(input);

      return repository.scheduleApprovedPurchaseRequests({
        ...input,
        name: input.name.trim(),
        scheduledPublishAt: new Date(input.scheduledPublishAt).toISOString()
      });
    }
  };
}
