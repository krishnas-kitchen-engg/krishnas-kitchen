import assert from "node:assert/strict";
import { describe, it } from "vitest";

import {
  createLocationManagementService,
  LocationManagementValidationError,
  type LocationManagementRepository,
  type ManagedInventoryLocation
} from "./locationManagementService";

function createRepository(seed: ManagedInventoryLocation[] = []): LocationManagementRepository & {
  locations: ManagedInventoryLocation[];
} {
  const locations = [...seed];

  return {
    locations,
    createLocation(input) {
      const location: ManagedInventoryLocation = {
        deletedAt: null,
        description: input.description ?? null,
        id: `location-${locations.length + 1}`,
        name: input.name,
        organizationId: input.organizationId,
        templeId: input.templeId
      };
      locations.push(location);

      return Promise.resolve(location);
    },
    listLocations(scope) {
      return Promise.resolve(
        locations.filter(
          (location) =>
            location.organizationId === scope.organizationId && location.templeId === scope.templeId
        )
      );
    },
    updateLocation(input) {
      const index = locations.findIndex(
        (location) => location.id === input.id && location.organizationId === input.organizationId
      );

      if (index < 0) {
        throw new Error("Not found");
      }

      const existingLocation = locations[index];

      if (!existingLocation) {
        throw new Error("Not found");
      }

      locations[index] = {
        ...existingLocation,
        description: input.description ?? null,
        name: input.name
      };

      return Promise.resolve(locations[index]);
    },
    updateLocationArchivedState(input) {
      const index = locations.findIndex(
        (location) => location.id === input.id && location.organizationId === input.organizationId
      );

      if (index < 0) {
        throw new Error("Not found");
      }

      const existingLocation = locations[index];

      if (!existingLocation) {
        throw new Error("Not found");
      }

      locations[index] = {
        ...existingLocation,
        deletedAt: input.deletedAt
      };

      return Promise.resolve(locations[index]);
    }
  };
}

const pantry: ManagedInventoryLocation = {
  deletedAt: null,
  description: "Main dry goods",
  id: "pantry",
  name: "Pantry",
  organizationId: "org-1",
  templeId: "temple-1"
};

describe("location management service", () => {
  it("creates active locations with normalized names", async () => {
    const repository = createRepository();
    const service = createLocationManagementService(repository);

    const location = await service.createLocation({
      description: " Daily dry storage ",
      name: "  Dry   Storage ",
      organizationId: "org-1",
      templeId: "temple-1"
    });

    assert.equal(location.name, "Dry Storage");
    assert.equal(location.description, "Daily dry storage");
    assert.equal(repository.locations.length, 1);
  });

  it("rejects duplicate active location names", async () => {
    const service = createLocationManagementService(createRepository([pantry]));

    await assert.rejects(
      () =>
        service.createLocation({
          name: " pantry ",
          organizationId: "org-1",
          templeId: "temple-1"
        }),
      LocationManagementValidationError
    );
  });

  it("archives and restores locations without deleting history references", async () => {
    const repository = createRepository([pantry]);
    const service = createLocationManagementService(repository, {
      now: () => new Date("2026-07-26T12:00:00.000Z")
    });

    const archived = await service.archiveLocation({
      id: "pantry",
      organizationId: "org-1",
      templeId: "temple-1"
    });
    const restored = await service.restoreLocation({
      id: "pantry",
      organizationId: "org-1",
      templeId: "temple-1"
    });

    assert.equal(archived.deletedAt, "2026-07-26T12:00:00.000Z");
    assert.equal(restored.deletedAt, null);
    assert.equal(repository.locations[0]?.id, "pantry");
  });

  it("prevents restoring when an active duplicate name exists", async () => {
    const service = createLocationManagementService(
      createRepository([
        pantry,
        {
          ...pantry,
          deletedAt: "2026-07-25T00:00:00.000Z",
          id: "archived-pantry"
        }
      ])
    );

    await assert.rejects(
      () =>
        service.restoreLocation({
          id: "archived-pantry",
          organizationId: "org-1",
          templeId: "temple-1"
        }),
      LocationManagementValidationError
    );
  });
});
