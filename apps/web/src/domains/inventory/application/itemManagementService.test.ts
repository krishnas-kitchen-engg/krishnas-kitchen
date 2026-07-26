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
  restoredThresholds: Array<{ itemId: string; minimumQuantity: number; unit: ItemUnit }>;
} {
  const items = [...seed];
  const archivedThresholds: string[] = [];
  const restoredThresholds: Array<{ itemId: string; minimumQuantity: number; unit: ItemUnit }> = [];

  return {
    archivedThresholds,
    archiveItemThresholds(input) {
      archivedThresholds.push(input.itemId);

      return Promise.resolve();
    },
    createItem(input) {
      const item: ManagedInventoryItem = {
        category: input.category ?? null,
        defaultUnit: input.defaultUnit,
        deletedAt: null,
        description: input.description ?? null,
        id: `item-${items.length + 1}`,
        name: input.name,
        organizationId: input.organizationId,
        reorderThreshold: null
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
        defaultUnit: input.defaultUnit,
        description: input.description ?? null,
        name: input.name
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
  reorderThreshold: 20
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
      templeId: "temple-1"
    });

    assert.equal(item.name, "Basmati Rice");
    assert.equal(item.category, "Grains");
    assert.equal(item.description, "Daily rice");
    assert.equal(item.reorderThreshold, 25);
    assert.deepEqual(repository.restoredThresholds, [
      {
        itemId: "item-1",
        minimumQuantity: 25,
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
