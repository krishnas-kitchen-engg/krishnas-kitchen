import assert from "node:assert/strict";
import type { ItemUnit } from "@krishnas-kitchen/types";
import { describe, it } from "vitest";

import type { InventoryActor } from "../domain/types";
import {
  createItemManagementService,
  ItemManagementValidationError,
  type ItemManagementRepository,
  type ManagedInventoryItem
} from "./itemManagementService";

const actor: InventoryActor = {
  type: "user",
  userId: "manager-1"
};

function createRepository(seed: ManagedInventoryItem[] = []): ItemManagementRepository & {
  archivedThresholds: string[];
  items: ManagedInventoryItem[];
  restoredThresholds: Array<{
    itemId: string;
    minimumQuantity: number;
    targetQuantity: number | null;
    unit: ItemUnit;
  }>;
} {
  const items = [...seed];
  const archivedThresholds: string[] = [];
  const restoredThresholds: Array<{
    itemId: string;
    minimumQuantity: number;
    targetQuantity: number | null;
    unit: ItemUnit;
  }> = [];

  return {
    archivedThresholds,
    archiveItemThresholds(input) {
      archivedThresholds.push(input.itemId);

      return Promise.resolve();
    },
    createItem(input) {
      const item: ManagedInventoryItem = {
        category: input.category ?? null,
        contentsLabel: input.contentsLabel ?? null,
        contentsQuantity: input.contentsQuantity ?? null,
        contentsUnit: input.contentsUnit ?? null,
        defaultUnit: input.defaultUnit,
        deletedAt: null,
        description: input.description ?? null,
        handlingUnit: input.handlingUnit ?? null,
        id: `item-${items.length + 1}`,
        name: input.name,
        organizationId: input.organizationId,
        packageDescription: input.packageDescription ?? null,
        productName: input.productName ?? null,
        reorderThreshold: null,
        targetStockLevel: null
      };
      items.push(item);

      return Promise.resolve(item);
    },
    items,
    listItems(scope) {
      return Promise.resolve(items.filter((item) => item.organizationId === scope.organizationId));
    },
    restoreItemThreshold(input) {
      restoredThresholds.push({
        itemId: input.itemId,
        minimumQuantity: input.minimumQuantity,
        targetQuantity: input.targetQuantity,
        unit: input.unit
      });

      return Promise.resolve();
    },
    restoredThresholds,
    updateItem(input) {
      const index = items.findIndex(
        (item) => item.id === input.id && item.organizationId === input.organizationId
      );

      if (index < 0) {
        throw new Error("Not found");
      }

      const existingItem = items[index];

      if (!existingItem) {
        throw new Error("Not found");
      }

      items[index] = {
        ...existingItem,
        category: input.category ?? null,
        contentsLabel: input.contentsLabel ?? null,
        contentsQuantity: input.contentsQuantity ?? null,
        contentsUnit: input.contentsUnit ?? null,
        defaultUnit: input.defaultUnit,
        description: input.description ?? null,
        handlingUnit: input.handlingUnit ?? null,
        name: input.name,
        packageDescription: input.packageDescription ?? null,
        productName: input.productName ?? null
      };

      return Promise.resolve(items[index]);
    },
    updateItemArchivedState(input) {
      const index = items.findIndex(
        (item) => item.id === input.id && item.organizationId === input.organizationId
      );

      if (index < 0) {
        throw new Error("Not found");
      }

      const existingItem = items[index];

      if (!existingItem) {
        throw new Error("Not found");
      }

      items[index] = {
        ...existingItem,
        deletedAt: input.deletedAt
      };

      return Promise.resolve(items[index]);
    }
  };
}

const rice: ManagedInventoryItem = {
  category: "Grains",
  defaultUnit: "kg",
  deletedAt: null,
  description: "Long grain rice",
  id: "rice",
  name: "Basmati Rice",
  organizationId: "org-1",
  reorderThreshold: 20,
  targetStockLevel: 40
};

describe("item management service", () => {
  it("creates active items with normalized fields and threshold metadata", async () => {
    const repository = createRepository();
    const service = createItemManagementService(repository);

    const item = await service.createItem({
      actor,
      category: " Grains ",
      defaultUnit: "kg",
      description: " Daily rice ",
      name: "  Basmati   Rice ",
      organizationId: "org-1",
      reorderThreshold: 25,
      targetStockLevel: 50,
      templeId: "temple-1"
    });

    assert.equal(item.name, "Basmati Rice");
    assert.equal(item.category, "Grains");
    assert.equal(item.description, "Daily rice");
    assert.equal(item.reorderThreshold, 25);
    assert.equal(item.targetStockLevel, 50);
    assert.deepEqual(repository.restoredThresholds, [
      {
        itemId: "item-1",
        minimumQuantity: 25,
        targetQuantity: 50,
        unit: "kg"
      }
    ]);
  });

  it("rejects duplicate active item names while allowing archived duplicates", async () => {
    const service = createItemManagementService(
      createRepository([
        rice,
        {
          ...rice,
          deletedAt: "2026-07-25T00:00:00.000Z",
          id: "archived-rice"
        }
      ])
    );

    await assert.rejects(
      () =>
        service.createItem({
          actor,
          defaultUnit: "kg",
          name: " basmati rice ",
          organizationId: "org-1",
          templeId: "temple-1"
        }),
      ItemManagementValidationError
    );
  });

  it("rejects invalid catalog fields", async () => {
    const service = createItemManagementService(createRepository());

    await assert.rejects(
      () =>
        service.createItem({
          actor,
          defaultUnit: "kg",
          name: " ",
          organizationId: "org-1",
          templeId: "temple-1"
        }),
      ItemManagementValidationError
    );

    await assert.rejects(
      () =>
        service.createItem({
          actor,
          defaultUnit: "invalid" as ItemUnit,
          name: "Ghee",
          organizationId: "org-1",
          templeId: "temple-1"
        }),
      ItemManagementValidationError
    );

    await assert.rejects(
      () =>
        service.createItem({
          actor,
          defaultUnit: "kg",
          name: "Ghee",
          organizationId: "org-1",
          reorderThreshold: -1,
          templeId: "temple-1"
        }),
      ItemManagementValidationError
    );

    await assert.rejects(
      () =>
        service.createItem({
          actor,
          defaultUnit: "kg",
          name: "Ghee",
          organizationId: "org-1",
          reorderThreshold: 10,
          targetStockLevel: 10,
          templeId: "temple-1"
        }),
      /Target stock level must be greater than the minimum stock level/
    );

    await assert.rejects(
      () =>
        service.createItem({
          actor,
          contentsQuantity: 50,
          defaultUnit: "bag",
          name: "Pinto Beans — 50 lb Bag",
          organizationId: "org-1",
          templeId: "temple-1"
        }),
      /Contents quantity and contents unit must be provided together/
    );
  });

  it("normalizes package metadata for a handling-unit SKU", async () => {
    const repository = createRepository();
    const service = createItemManagementService(repository);

    const item = await service.createItem({
      actor,
      contentsQuantity: 50,
      contentsUnit: "lb",
      defaultUnit: "lb",
      handlingUnit: "bag",
      name: " Pinto Beans — 50 lb Bag ",
      organizationId: "org-1",
      packageDescription: " 50 lb per bag ",
      productName: " Pinto Beans ",
      templeId: "temple-1"
    });

    assert.equal(item.contentsQuantity, 50);
    assert.equal(item.contentsUnit, "lb");
    assert.equal(item.defaultUnit, "lb");
    assert.equal(item.handlingUnit, "bag");
    assert.equal(item.packageDescription, "50 lb per bag");
    assert.equal(item.productName, "Pinto Beans");
  });

  it("updates and removes an optional minimum stock level", async () => {
    const repository = createRepository([rice]);
    const service = createItemManagementService(repository);

    const updated = await service.updateItem({
      actor,
      category: rice.category,
      defaultUnit: rice.defaultUnit,
      description: rice.description,
      id: rice.id,
      name: rice.name,
      organizationId: rice.organizationId,
      reorderThreshold: 35,
      targetStockLevel: 60,
      templeId: "temple-1"
    });

    assert.equal(updated.reorderThreshold, 35);
    assert.equal(updated.targetStockLevel, 60);
    assert.deepEqual(repository.restoredThresholds, [
      {
        itemId: rice.id,
        minimumQuantity: 35,
        targetQuantity: 60,
        unit: rice.defaultUnit
      }
    ]);

    const withoutLevel = await service.updateItem({
      actor,
      category: rice.category,
      defaultUnit: rice.defaultUnit,
      description: rice.description,
      id: rice.id,
      name: rice.name,
      organizationId: rice.organizationId,
      reorderThreshold: null,
      targetStockLevel: null,
      templeId: "temple-1"
    });

    assert.equal(withoutLevel.reorderThreshold, null);
    assert.deepEqual(repository.archivedThresholds, [rice.id]);
  });

  it("archives and restores items without deleting historical references", async () => {
    const repository = createRepository([rice]);
    const service = createItemManagementService(repository, {
      now: () => new Date("2026-07-26T12:00:00.000Z")
    });

    const archived = await service.archiveItem({
      actor,
      id: "rice",
      organizationId: "org-1",
      templeId: "temple-1"
    });
    const restored = await service.restoreItem({
      actor,
      id: "rice",
      organizationId: "org-1",
      templeId: "temple-1"
    });

    assert.equal(archived.deletedAt, "2026-07-26T12:00:00.000Z");
    assert.equal(restored.deletedAt, null);
    assert.deepEqual(repository.archivedThresholds, ["rice"]);
    assert.equal(repository.items[0]?.id, "rice");
  });

  it("prevents restoring when an active duplicate name exists", async () => {
    const service = createItemManagementService(
      createRepository([
        rice,
        {
          ...rice,
          deletedAt: "2026-07-25T00:00:00.000Z",
          id: "archived-rice"
        }
      ])
    );

    await assert.rejects(
      () =>
        service.restoreItem({
          actor,
          id: "archived-rice",
          organizationId: "org-1",
          templeId: "temple-1"
        }),
      ItemManagementValidationError
    );
  });
});
