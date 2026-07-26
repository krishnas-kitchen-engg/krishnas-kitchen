import type { EntityId } from "@krishnas-kitchen/types";
import { isNonEmptyString } from "@krishnas-kitchen/utils";

export type ManagedInventoryLocation = {
  deletedAt: string | null;
  description: string | null;
  id: EntityId;
  name: string;
  organizationId: EntityId;
  templeId: EntityId;
};

export type LocationManagementScope = {
  organizationId: EntityId;
  templeId: EntityId;
};

export type CreateManagedLocationInput = LocationManagementScope & {
  description?: string | null;
  name: string;
};

export type UpdateManagedLocationInput = {
  description?: string | null;
  id: EntityId;
  name: string;
  organizationId: EntityId;
  templeId: EntityId;
};

export type LocationManagementRepository = {
  createLocation: (input: CreateManagedLocationInput) => Promise<ManagedInventoryLocation>;
  listLocations: (scope: LocationManagementScope) => Promise<ManagedInventoryLocation[]>;
  updateLocation: (
    input: Pick<UpdateManagedLocationInput, "description" | "id" | "name" | "organizationId">
  ) => Promise<ManagedInventoryLocation>;
  updateLocationArchivedState: (input: {
    deletedAt: string | null;
    id: EntityId;
    organizationId: EntityId;
  }) => Promise<ManagedInventoryLocation>;
};

export type LocationManagementService = {
  archiveLocation: (
    input: Pick<UpdateManagedLocationInput, "id" | "organizationId" | "templeId">
  ) => Promise<ManagedInventoryLocation>;
  createLocation: (input: CreateManagedLocationInput) => Promise<ManagedInventoryLocation>;
  listLocations: (scope: LocationManagementScope) => Promise<ManagedInventoryLocation[]>;
  restoreLocation: (
    input: Pick<UpdateManagedLocationInput, "id" | "organizationId" | "templeId">
  ) => Promise<ManagedInventoryLocation>;
  updateLocation: (input: UpdateManagedLocationInput) => Promise<ManagedInventoryLocation>;
};

export class LocationManagementValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LocationManagementValidationError";
  }
}

function normalizeName(name: string): string {
  return name.trim().replace(/\s+/g, " ");
}

function normalizeDescription(description: string | null | undefined): string | null {
  const trimmedDescription = description?.trim();

  return trimmedDescription ? trimmedDescription : null;
}

function assertValidName(name: string): string {
  const normalizedName = normalizeName(name);

  if (!isNonEmptyString(normalizedName)) {
    throw new LocationManagementValidationError("Location name is required.");
  }

  if (normalizedName.length > 120) {
    throw new LocationManagementValidationError("Location name must be 120 characters or less.");
  }

  return normalizedName;
}

function assertValidDescription(description: string | null | undefined): string | null {
  const normalizedDescription = normalizeDescription(description);

  if (normalizedDescription && normalizedDescription.length > 500) {
    throw new LocationManagementValidationError(
      "Location description must be 500 characters or less."
    );
  }

  return normalizedDescription;
}

function findDuplicateActiveLocation(
  locations: readonly ManagedInventoryLocation[],
  input: { id?: EntityId; name: string }
): ManagedInventoryLocation | null {
  const normalizedName = input.name.toLocaleLowerCase();

  return (
    locations.find(
      (location) =>
        !location.deletedAt &&
        location.id !== input.id &&
        location.name.trim().toLocaleLowerCase() === normalizedName
    ) ?? null
  );
}

export function createLocationManagementService(
  repository: LocationManagementRepository,
  options: {
    now?: () => Date;
  } = {}
): LocationManagementService {
  const now = options.now ?? (() => new Date());

  async function assertNoDuplicateActiveName(input: {
    id?: EntityId;
    name: string;
    organizationId: EntityId;
    templeId: EntityId;
  }) {
    const locations = await repository.listLocations({
      organizationId: input.organizationId,
      templeId: input.templeId
    });
    const duplicate = findDuplicateActiveLocation(locations, input);

    if (duplicate) {
      throw new LocationManagementValidationError(
        "An active location with this name already exists."
      );
    }
  }

  return {
    async archiveLocation(input) {
      return repository.updateLocationArchivedState({
        deletedAt: now().toISOString(),
        id: input.id,
        organizationId: input.organizationId
      });
    },

    async createLocation(input) {
      const name = assertValidName(input.name);
      const description = assertValidDescription(input.description);
      await assertNoDuplicateActiveName({
        name,
        organizationId: input.organizationId,
        templeId: input.templeId
      });

      return repository.createLocation({
        description,
        name,
        organizationId: input.organizationId,
        templeId: input.templeId
      });
    },

    listLocations(scope) {
      return repository.listLocations(scope);
    },

    async restoreLocation(input) {
      const locations = await repository.listLocations({
        organizationId: input.organizationId,
        templeId: input.templeId
      });
      const location = locations.find((candidate) => candidate.id === input.id);

      if (!location) {
        throw new LocationManagementValidationError("Location was not found.");
      }

      await assertNoDuplicateActiveName({
        id: location.id,
        name: location.name,
        organizationId: input.organizationId,
        templeId: input.templeId
      });

      return repository.updateLocationArchivedState({
        deletedAt: null,
        id: input.id,
        organizationId: input.organizationId
      });
    },

    async updateLocation(input) {
      const name = assertValidName(input.name);
      const description = assertValidDescription(input.description);
      await assertNoDuplicateActiveName({
        id: input.id,
        name,
        organizationId: input.organizationId,
        templeId: input.templeId
      });

      return repository.updateLocation({
        description,
        id: input.id,
        name,
        organizationId: input.organizationId
      });
    }
  };
}
