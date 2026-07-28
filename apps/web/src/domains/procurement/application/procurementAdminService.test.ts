import { describe, expect, it } from "vitest";

import {
  createProcurementAdminService,
  ProcurementAdminValidationError
} from "./procurementAdminService";
import type { ProcurementAdminRepository } from "./procurementAdminService";
import type { ItemPurchasePreferenceRecord, PurchaseLocationRecord } from "./procurementRepository";

const actor = {
  type: "user",
  userId: "user-1"
} as const;

const scope = {
  organizationId: "org-1",
  templeId: "temple-1"
};

function createPurchaseLocation(
  overrides: Partial<PurchaseLocationRecord> = {}
): PurchaseLocationRecord {
  return {
    archivedAt: null,
    createdAt: "2026-07-28T00:00:00.000Z",
    createdBy: actor,
    defaultPurchaserUserId: null,
    description: null,
    id: "purchase-location-1",
    name: "Costco",
    notes: null,
    organizationId: scope.organizationId,
    templeId: scope.templeId,
    updatedAt: "2026-07-28T00:00:00.000Z",
    ...overrides
  };
}

function createRepository(
  overrides: Partial<ProcurementAdminRepository> = {}
): ProcurementAdminRepository & {
  locations: PurchaseLocationRecord[];
  preferences: ItemPurchasePreferenceRecord[];
} {
  const locations: PurchaseLocationRecord[] = [];
  const preferences: ItemPurchasePreferenceRecord[] = [];

  return {
    locations,
    preferences,
    createItemPurchasePreference(input) {
      const preference: ItemPurchasePreferenceRecord = {
        archivedAt: null,
        backupPurchaseLocationId: input.backupPurchaseLocationId ?? null,
        createdAt: "2026-07-28T00:00:00.000Z",
        createdBy: input.createdBy,
        estimatedUnitCost: input.estimatedUnitCost ?? null,
        id: `preference-${preferences.length + 1}`,
        itemId: input.itemId,
        notes: input.notes ?? null,
        organizationId: input.organizationId,
        packSize: input.packSize ?? null,
        preferredPurchaseLocationId: input.preferredPurchaseLocationId,
        preferredPurchaseUnit: input.preferredPurchaseUnit ?? null,
        purchaserUserId: input.purchaserUserId ?? null,
        templeId: input.templeId,
        updatedAt: "2026-07-28T00:00:00.000Z"
      };
      preferences.push(preference);
      return Promise.resolve(preference);
    },
    createPurchaseLocation(input) {
      const location = createPurchaseLocation({
        createdBy: input.createdBy,
        defaultPurchaserUserId: input.defaultPurchaserUserId ?? null,
        description: input.description ?? null,
        id: `purchase-location-${locations.length + 1}`,
        name: input.name,
        notes: input.notes ?? null,
        organizationId: input.organizationId,
        templeId: input.templeId
      });
      locations.push(location);
      return Promise.resolve(location);
    },
    listItemPurchasePreferences() {
      return Promise.resolve(preferences);
    },
    listPurchaseLocations() {
      return Promise.resolve(locations);
    },
    updatePurchaseLocation(input) {
      const index = locations.findIndex((location) => location.id === input.id);
      const nextLocation = {
        ...locations[index],
        defaultPurchaserUserId: input.defaultPurchaserUserId ?? null,
        description: input.description ?? null,
        name: input.name,
        notes: input.notes ?? null
      } as PurchaseLocationRecord;
      locations[index] = nextLocation;
      return Promise.resolve(nextLocation);
    },
    updatePurchaseLocationArchivedState(input) {
      const index = locations.findIndex((location) => location.id === input.id);
      const nextLocation = {
        ...locations[index],
        archivedAt: input.archivedAt
      } as PurchaseLocationRecord;
      locations[index] = nextLocation;
      return Promise.resolve(nextLocation);
    },
    ...overrides
  };
}

describe("procurement admin service", () => {
  it("creates normalized purchase locations and rejects duplicate active names", async () => {
    const repository = createRepository();
    const service = createProcurementAdminService(repository);

    const created = await service.createPurchaseLocation({
      ...scope,
      createdBy: actor,
      description: " Bulk   warehouse ",
      name: " Costco ",
      notes: " Primary   warehouse "
    });

    expect(created).toMatchObject({
      description: "Bulk warehouse",
      name: "Costco",
      notes: "Primary warehouse"
    });

    await expect(
      service.createPurchaseLocation({
        ...scope,
        createdBy: actor,
        name: "costco"
      })
    ).rejects.toThrow(ProcurementAdminValidationError);
  });

  it("allows a location name to be reused after the previous location is archived", async () => {
    const repository = createRepository();
    repository.locations.push(createPurchaseLocation({ archivedAt: "2026-07-28T00:00:00.000Z" }));
    const service = createProcurementAdminService(repository);

    await expect(
      service.createPurchaseLocation({
        ...scope,
        createdBy: actor,
        name: "Costco"
      })
    ).resolves.toMatchObject({
      name: "Costco"
    });
  });

  it("archives and restores purchase locations with deterministic timestamps", async () => {
    const repository = createRepository();
    repository.locations.push(createPurchaseLocation());
    const service = createProcurementAdminService(repository, {
      now: () => new Date("2026-07-28T12:00:00.000Z")
    });

    await expect(
      service.archivePurchaseLocation({
        ...scope,
        archivedBy: actor,
        id: "purchase-location-1"
      })
    ).resolves.toMatchObject({
      archivedAt: "2026-07-28T12:00:00.000Z"
    });

    await expect(
      service.restorePurchaseLocation({
        ...scope,
        archivedBy: actor,
        id: "purchase-location-1"
      })
    ).resolves.toMatchObject({
      archivedAt: null
    });
  });

  it("rejects invalid item purchase preference setup values", async () => {
    const repository = createRepository();
    const service = createProcurementAdminService(repository);

    await expect(
      service.createItemPurchasePreference({
        ...scope,
        createdBy: actor,
        estimatedUnitCost: -1,
        itemId: "item-1",
        packSize: 0,
        preferredPurchaseLocationId: "purchase-location-1",
        preferredPurchaseUnit: "kg"
      })
    ).rejects.toThrow(ProcurementAdminValidationError);
  });

  it("creates item purchase preferences with audit actor and optional purchasing details", async () => {
    const repository = createRepository();
    const service = createProcurementAdminService(repository);

    await expect(
      service.createItemPurchasePreference({
        ...scope,
        createdBy: actor,
        estimatedUnitCost: 12.5,
        itemId: "item-1",
        notes: "Best for bulk rice",
        packSize: 25,
        preferredPurchaseLocationId: "purchase-location-1",
        preferredPurchaseUnit: "kg",
        purchaserUserId: "purchaser-1"
      })
    ).resolves.toMatchObject({
      createdBy: actor,
      estimatedUnitCost: 12.5,
      itemId: "item-1",
      packSize: 25,
      preferredPurchaseLocationId: "purchase-location-1",
      purchaserUserId: "purchaser-1"
    });
  });
});
