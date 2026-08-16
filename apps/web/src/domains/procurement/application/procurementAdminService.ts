import type { EntityId } from "@krishnas-kitchen/types";
import { isNonEmptyString } from "@krishnas-kitchen/utils";

import type { ItemPurchasePreferenceRecord, PurchaseLocationRecord } from "./procurementRepository";
import type {
  ItemPurchasePreferenceInput,
  ProcurementActor,
  ProcurementScope,
  PurchaseLocationInput
} from "../domain/types";

export type UpdatePurchaseLocationInput = ProcurementScope & {
  defaultPurchaserUserId?: EntityId | null;
  description?: string | null;
  id: EntityId;
  name: string;
  notes?: string | null;
  updatedBy: ProcurementActor;
};

export type PurchaseLocationArchiveInput = ProcurementScope & {
  archived: boolean;
  archivedBy: ProcurementActor;
  id: EntityId;
};

export type ProcurementAdminRepository = {
  createItemPurchasePreference: (
    input: ItemPurchasePreferenceInput
  ) => Promise<ItemPurchasePreferenceRecord>;
  createPurchaseLocation: (input: PurchaseLocationInput) => Promise<PurchaseLocationRecord>;
  listItemPurchasePreferences: (
    scope: ProcurementScope
  ) => Promise<readonly ItemPurchasePreferenceRecord[]>;
  listPurchaseLocations: (scope: ProcurementScope) => Promise<readonly PurchaseLocationRecord[]>;
  listPurchaserCandidates: (
    scope: ProcurementScope
  ) => Promise<readonly ProcurementPurchaserCandidate[]>;
  updatePurchaseLocation: (input: UpdatePurchaseLocationInput) => Promise<PurchaseLocationRecord>;
  updatePurchaseLocationArchivedState: (
    input: PurchaseLocationArchiveInput & { archivedAt: string | null }
  ) => Promise<PurchaseLocationRecord>;
};

export type ProcurementPurchaserCandidate = {
  deletedAt?: string | null;
  email: string;
  fullName: string;
  id: EntityId;
};

export type ProcurementAdminService = {
  archivePurchaseLocation: (
    input: Omit<PurchaseLocationArchiveInput, "archived">
  ) => Promise<PurchaseLocationRecord>;
  createItemPurchasePreference: (
    input: ItemPurchasePreferenceInput
  ) => Promise<ItemPurchasePreferenceRecord>;
  createPurchaseLocation: (input: PurchaseLocationInput) => Promise<PurchaseLocationRecord>;
  listItemPurchasePreferences: (
    scope: ProcurementScope
  ) => Promise<readonly ItemPurchasePreferenceRecord[]>;
  listPurchaseLocations: (scope: ProcurementScope) => Promise<readonly PurchaseLocationRecord[]>;
  listPurchaserCandidates: (
    scope: ProcurementScope
  ) => Promise<readonly ProcurementPurchaserCandidate[]>;
  restorePurchaseLocation: (
    input: Omit<PurchaseLocationArchiveInput, "archived">
  ) => Promise<PurchaseLocationRecord>;
  updatePurchaseLocation: (input: UpdatePurchaseLocationInput) => Promise<PurchaseLocationRecord>;
};

export class ProcurementAdminValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProcurementAdminValidationError";
  }
}

function normalizeText(value: string | null | undefined): string | null {
  const normalized = value?.trim().replace(/\s+/g, " ");

  return normalized ? normalized : null;
}

function assertValidId(value: string, label: string): EntityId {
  if (!isNonEmptyString(value)) {
    throw new ProcurementAdminValidationError(`${label} is required.`);
  }

  return value;
}

function assertValidActor(actor: ProcurementActor, label: string): ProcurementActor {
  if (actor.type === "system") {
    return actor;
  }

  if (actor.type === "user" && isNonEmptyString(actor.userId) && !actor.tempSessionId) {
    return actor;
  }

  if (
    actor.type === "temporary_volunteer" &&
    isNonEmptyString(actor.tempSessionId) &&
    !actor.userId
  ) {
    return actor;
  }

  throw new ProcurementAdminValidationError(`${label} is required.`);
}

function assertValidName(value: string, label: string): string {
  const normalized = normalizeText(value);

  if (!normalized) {
    throw new ProcurementAdminValidationError(`${label} is required.`);
  }

  if (normalized.length > 120) {
    throw new ProcurementAdminValidationError(`${label} must be 120 characters or less.`);
  }

  return normalized;
}

function assertValidOptionalText(
  value: string | null | undefined,
  label: string,
  maxLength: number
): string | null {
  const normalized = normalizeText(value);

  if (normalized && normalized.length > maxLength) {
    throw new ProcurementAdminValidationError(`${label} must be ${maxLength} characters or less.`);
  }

  return normalized;
}

function assertValidOptionalPositiveNumber(
  value: number | null | undefined,
  label: string
): number | null {
  if (value === null || typeof value === "undefined") {
    return null;
  }

  if (!Number.isFinite(value) || value <= 0) {
    throw new ProcurementAdminValidationError(`${label} must be greater than zero.`);
  }

  return value;
}

function assertValidOptionalNonNegativeNumber(
  value: number | null | undefined,
  label: string
): number | null {
  if (value === null || typeof value === "undefined") {
    return null;
  }

  if (!Number.isFinite(value) || value < 0) {
    throw new ProcurementAdminValidationError(`${label} must be zero or greater.`);
  }

  return value;
}

function findDuplicateActivePurchaseLocation(
  locations: readonly PurchaseLocationRecord[],
  input: { id?: EntityId; name: string }
): PurchaseLocationRecord | null {
  const normalizedName = input.name.toLocaleLowerCase();

  return (
    locations.find(
      (location) =>
        !location.archivedAt &&
        location.id !== input.id &&
        location.name.trim().toLocaleLowerCase() === normalizedName
    ) ?? null
  );
}

async function assertNoDuplicatePurchaseLocation(input: {
  id?: EntityId;
  name: string;
  repository: ProcurementAdminRepository;
  scope: ProcurementScope;
}) {
  const locations = await input.repository.listPurchaseLocations(input.scope);
  const duplicate = findDuplicateActivePurchaseLocation(locations, input);

  if (duplicate) {
    throw new ProcurementAdminValidationError(
      "An active purchase location with this name already exists."
    );
  }
}

export function createProcurementAdminService(
  repository: ProcurementAdminRepository,
  options: {
    now?: () => Date;
  } = {}
): ProcurementAdminService {
  const now = options.now ?? (() => new Date());

  return {
    async archivePurchaseLocation(input) {
      assertValidId(input.organizationId, "Organization");
      assertValidId(input.templeId, "Temple");
      assertValidId(input.id, "Purchase location");
      assertValidActor(input.archivedBy, "Archive actor");

      return repository.updatePurchaseLocationArchivedState({
        ...input,
        archived: true,
        archivedAt: now().toISOString()
      });
    },

    async createItemPurchasePreference(input) {
      assertValidId(input.organizationId, "Organization");
      assertValidId(input.templeId, "Temple");
      assertValidId(input.itemId, "Item");
      assertValidId(input.preferredPurchaseLocationId, "Preferred purchase location");
      assertValidActor(input.createdBy, "Creator");

      return repository.createItemPurchasePreference({
        ...input,
        estimatedUnitCost: assertValidOptionalNonNegativeNumber(
          input.estimatedUnitCost,
          "Estimated unit cost"
        ),
        minimumOrderQuantity: assertValidOptionalPositiveNumber(
          input.minimumOrderQuantity,
          "Minimum order quantity"
        ),
        notes: assertValidOptionalText(input.notes, "Preference notes", 500),
        packSize: assertValidOptionalPositiveNumber(input.packSize, "Pack size"),
        preferredPurchaseUnit: input.preferredPurchaseUnit ?? null
      });
    },

    listPurchaserCandidates(scope) {
      return repository.listPurchaserCandidates(scope);
    },

    async createPurchaseLocation(input) {
      assertValidId(input.organizationId, "Organization");
      assertValidId(input.templeId, "Temple");
      assertValidActor(input.createdBy, "Creator");
      const name = assertValidName(input.name, "Purchase location name");
      await assertNoDuplicatePurchaseLocation({
        name,
        repository,
        scope: input
      });

      return repository.createPurchaseLocation({
        ...input,
        description: assertValidOptionalText(
          input.description,
          "Purchase location description",
          500
        ),
        name,
        notes: assertValidOptionalText(input.notes, "Purchase location notes", 500)
      });
    },

    listItemPurchasePreferences(scope) {
      assertValidId(scope.organizationId, "Organization");
      assertValidId(scope.templeId, "Temple");

      return repository.listItemPurchasePreferences(scope);
    },

    listPurchaseLocations(scope) {
      assertValidId(scope.organizationId, "Organization");
      assertValidId(scope.templeId, "Temple");

      return repository.listPurchaseLocations(scope);
    },

    async restorePurchaseLocation(input) {
      assertValidId(input.organizationId, "Organization");
      assertValidId(input.templeId, "Temple");
      assertValidId(input.id, "Purchase location");
      assertValidActor(input.archivedBy, "Restore actor");
      const locations = await repository.listPurchaseLocations(input);
      const location = locations.find((candidate) => candidate.id === input.id);

      if (!location) {
        throw new ProcurementAdminValidationError("Purchase location was not found.");
      }

      await assertNoDuplicatePurchaseLocation({
        id: location.id,
        name: location.name,
        repository,
        scope: input
      });

      return repository.updatePurchaseLocationArchivedState({
        ...input,
        archived: false,
        archivedAt: null
      });
    },

    async updatePurchaseLocation(input) {
      assertValidId(input.organizationId, "Organization");
      assertValidId(input.templeId, "Temple");
      assertValidId(input.id, "Purchase location");
      assertValidActor(input.updatedBy, "Update actor");
      const name = assertValidName(input.name, "Purchase location name");
      await assertNoDuplicatePurchaseLocation({
        id: input.id,
        name,
        repository,
        scope: input
      });

      return repository.updatePurchaseLocation({
        ...input,
        description: assertValidOptionalText(
          input.description,
          "Purchase location description",
          500
        ),
        name,
        notes: assertValidOptionalText(input.notes, "Purchase location notes", 500)
      });
    }
  };
}
