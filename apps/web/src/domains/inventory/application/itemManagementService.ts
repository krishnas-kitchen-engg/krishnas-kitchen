import type { EntityId, ItemUnit } from "@krishnas-kitchen/types";

import { ITEM_UNITS } from "@/shared/domain/itemUnits";

import type { InventoryActor } from "../domain/types";

export const ITEM_MANAGEMENT_UNITS = ITEM_UNITS;

export type ManagedInventoryItem = {
  category: string | null;
  contentsLabel?: string | null;
  contentsQuantity?: number | null;
  contentsUnit?: ItemUnit | null;
  defaultUnit: ItemUnit;
  deletedAt: string | null;
  description: string | null;
  handlingUnit?: ItemUnit | null;
  id: EntityId;
  name: string;
  organizationId: EntityId;
  packageDescription?: string | null;
  productName?: string | null;
  reorderThreshold: number | null;
  targetStockLevel: number | null;
};

export type ItemManagementScope = {
  organizationId: EntityId;
  templeId: EntityId;
};

export type CreateManagedItemInput = ItemManagementScope & {
  actor: InventoryActor;
  category?: string | null;
  contentsLabel?: string | null;
  contentsQuantity?: number | null;
  contentsUnit?: ItemUnit | null;
  defaultUnit: ItemUnit;
  description?: string | null;
  handlingUnit?: ItemUnit | null;
  name: string;
  packageDescription?: string | null;
  productName?: string | null;
  reorderThreshold?: number | null;
  targetStockLevel?: number | null;
};

export type UpdateManagedItemInput = CreateManagedItemInput & {
  id: EntityId;
};

export type ItemManagementRepository = {
  archiveItemThresholds: (input: {
    actor: InventoryActor;
    itemId: EntityId;
    organizationId: EntityId;
    templeId: EntityId;
  }) => Promise<void>;
  createItem: (
    input: Omit<
      CreateManagedItemInput,
      "actor" | "reorderThreshold" | "targetStockLevel" | "templeId"
    >
  ) => Promise<ManagedInventoryItem>;
  listItems: (scope: ItemManagementScope) => Promise<ManagedInventoryItem[]>;
  restoreItemThreshold: (input: {
    actor: InventoryActor;
    itemId: EntityId;
    minimumQuantity: number;
    organizationId: EntityId;
    templeId: EntityId;
    targetQuantity: number | null;
    unit: ItemUnit;
  }) => Promise<void>;
  updateItem: (
    input: Omit<
      UpdateManagedItemInput,
      "actor" | "reorderThreshold" | "targetStockLevel" | "templeId"
    >
  ) => Promise<ManagedInventoryItem>;
  updateItemArchivedState: (input: {
    deletedAt: string | null;
    id: EntityId;
    organizationId: EntityId;
  }) => Promise<ManagedInventoryItem>;
};

export type ItemManagementService = {
  archiveItem: (
    input: Pick<UpdateManagedItemInput, "actor" | "id" | "organizationId" | "templeId">
  ) => Promise<ManagedInventoryItem>;
  createItem: (input: CreateManagedItemInput) => Promise<ManagedInventoryItem>;
  listItems: (scope: ItemManagementScope) => Promise<ManagedInventoryItem[]>;
  restoreItem: (
    input: Pick<UpdateManagedItemInput, "actor" | "id" | "organizationId" | "templeId">
  ) => Promise<ManagedInventoryItem>;
  updateItem: (input: UpdateManagedItemInput) => Promise<ManagedInventoryItem>;
};

export class ItemManagementValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ItemManagementValidationError";
  }
}

function normalizeText(value: string | null | undefined): string | null {
  const trimmedValue = value?.trim().replace(/\s+/g, " ");

  return trimmedValue ? trimmedValue : null;
}

function assertValidName(name: string): string {
  const normalizedName = normalizeText(name);

  if (!normalizedName) {
    throw new ItemManagementValidationError("Item name is required.");
  }

  if (normalizedName.length > 120) {
    throw new ItemManagementValidationError("Item name must be 120 characters or less.");
  }

  return normalizedName;
}

function assertValidOptionalText(
  value: string | null | undefined,
  label: string,
  maxLength: number
): string | null {
  const normalizedValue = normalizeText(value);

  if (normalizedValue && normalizedValue.length > maxLength) {
    throw new ItemManagementValidationError(`${label} must be ${maxLength} characters or less.`);
  }

  return normalizedValue;
}

function assertValidUnit(unit: ItemUnit): ItemUnit {
  if (!ITEM_MANAGEMENT_UNITS.includes(unit)) {
    throw new ItemManagementValidationError("Default unit is invalid.");
  }

  return unit;
}

function assertValidContents(input: {
  quantity: number | null | undefined;
  unit: ItemUnit | null | undefined;
}): { quantity: number | null; unit: ItemUnit | null } {
  const quantity = input.quantity ?? null;
  const unit = input.unit ?? null;

  if (quantity === null && unit === null) {
    return { quantity: null, unit: null };
  }

  if (quantity === null || unit === null) {
    throw new ItemManagementValidationError(
      "Contents quantity and contents unit must be provided together."
    );
  }

  if (!Number.isFinite(quantity) || quantity <= 0 || quantity > 1_000_000_000) {
    throw new ItemManagementValidationError(
      "Contents quantity must be greater than zero and no more than 1000000000."
    );
  }

  return { quantity, unit: assertValidUnit(unit) };
}

function assertValidReorderThreshold(value: number | null | undefined): number | null {
  if (value === null || typeof value === "undefined") {
    return null;
  }

  if (!Number.isFinite(value) || value < 0) {
    throw new ItemManagementValidationError("Reorder threshold must be zero or greater.");
  }

  if (value > 1_000_000) {
    throw new ItemManagementValidationError("Reorder threshold must be 1000000 or less.");
  }

  return value;
}

function assertValidTargetStockLevel(
  value: number | null | undefined,
  reorderThreshold: number | null
): number | null {
  if (value === null || typeof value === "undefined") {
    return null;
  }

  if (!Number.isFinite(value) || value <= 0) {
    throw new ItemManagementValidationError("Target stock level must be greater than zero.");
  }

  if (value > 1_000_000) {
    throw new ItemManagementValidationError("Target stock level must be 1000000 or less.");
  }

  if (reorderThreshold === null) {
    throw new ItemManagementValidationError(
      "Set a minimum stock level before setting a target stock level."
    );
  }

  if (value <= reorderThreshold) {
    throw new ItemManagementValidationError(
      "Target stock level must be greater than the minimum stock level."
    );
  }

  return value;
}

function findDuplicateActiveItem(
  items: readonly ManagedInventoryItem[],
  input: { id?: EntityId; name: string }
): ManagedInventoryItem | null {
  const normalizedName = input.name.toLocaleLowerCase();

  return (
    items.find(
      (item) =>
        !item.deletedAt &&
        item.id !== input.id &&
        item.name.trim().toLocaleLowerCase() === normalizedName
    ) ?? null
  );
}

export function createItemManagementService(
  repository: ItemManagementRepository,
  options: {
    now?: () => Date;
  } = {}
): ItemManagementService {
  const now = options.now ?? (() => new Date());

  async function assertNoDuplicateActiveName(input: {
    id?: EntityId;
    name: string;
    organizationId: EntityId;
    templeId: EntityId;
  }) {
    const items = await repository.listItems({
      organizationId: input.organizationId,
      templeId: input.templeId
    });
    const duplicate = findDuplicateActiveItem(items, input);

    if (duplicate) {
      throw new ItemManagementValidationError("An active item with this name already exists.");
    }
  }

  async function saveThreshold(input: {
    actor: InventoryActor;
    itemId: EntityId;
    organizationId: EntityId;
    reorderThreshold: number | null;
    targetStockLevel: number | null;
    templeId: EntityId;
    unit: ItemUnit;
  }) {
    if (input.reorderThreshold === null) {
      await repository.archiveItemThresholds(input);
      return;
    }

    await repository.restoreItemThreshold({
      actor: input.actor,
      itemId: input.itemId,
      minimumQuantity: input.reorderThreshold,
      organizationId: input.organizationId,
      templeId: input.templeId,
      targetQuantity: input.targetStockLevel,
      unit: input.unit
    });
  }

  return {
    async archiveItem(input) {
      await repository.archiveItemThresholds({
        actor: input.actor,
        itemId: input.id,
        organizationId: input.organizationId,
        templeId: input.templeId
      });

      return repository.updateItemArchivedState({
        deletedAt: now().toISOString(),
        id: input.id,
        organizationId: input.organizationId
      });
    },

    async createItem(input) {
      const name = assertValidName(input.name);
      const description = assertValidOptionalText(input.description, "Item description", 500);
      const category = assertValidOptionalText(input.category, "Item category", 120);
      const productName = assertValidOptionalText(input.productName, "Product name", 120);
      const contentsLabel = assertValidOptionalText(input.contentsLabel, "Contents label", 60);
      const packageDescription = assertValidOptionalText(
        input.packageDescription,
        "Package description",
        240
      );
      const contents = assertValidContents({
        quantity: input.contentsQuantity,
        unit: input.contentsUnit
      });
      if (contentsLabel && contents.quantity === null) {
        throw new ItemManagementValidationError(
          "Contents label requires a contents quantity and unit."
        );
      }
      const defaultUnit = assertValidUnit(input.defaultUnit);
      const handlingUnit = input.handlingUnit ? assertValidUnit(input.handlingUnit) : null;
      if (contents.quantity !== null && !handlingUnit) {
        throw new ItemManagementValidationError(
          "Select a handling unit when contents conversion is provided."
        );
      }
      if (contents.unit && defaultUnit !== contents.unit) {
        throw new ItemManagementValidationError(
          "Base inventory unit must match the package contents unit."
        );
      }
      const reorderThreshold = assertValidReorderThreshold(input.reorderThreshold);
      const targetStockLevel = assertValidTargetStockLevel(
        input.targetStockLevel,
        reorderThreshold
      );
      await assertNoDuplicateActiveName({
        name,
        organizationId: input.organizationId,
        templeId: input.templeId
      });

      const item = await repository.createItem({
        category,
        contentsLabel,
        contentsQuantity: contents.quantity,
        contentsUnit: contents.unit,
        defaultUnit,
        description,
        handlingUnit,
        name,
        organizationId: input.organizationId,
        packageDescription,
        productName
      });
      await saveThreshold({
        actor: input.actor,
        itemId: item.id,
        organizationId: input.organizationId,
        reorderThreshold,
        targetStockLevel,
        templeId: input.templeId,
        unit: defaultUnit
      });

      return {
        ...item,
        reorderThreshold,
        targetStockLevel
      };
    },

    listItems(scope) {
      return repository.listItems(scope);
    },

    async restoreItem(input) {
      const items = await repository.listItems({
        organizationId: input.organizationId,
        templeId: input.templeId
      });
      const item = items.find((candidate) => candidate.id === input.id);

      if (!item) {
        throw new ItemManagementValidationError("Item was not found.");
      }

      await assertNoDuplicateActiveName({
        id: item.id,
        name: item.name,
        organizationId: input.organizationId,
        templeId: input.templeId
      });

      return repository.updateItemArchivedState({
        deletedAt: null,
        id: input.id,
        organizationId: input.organizationId
      });
    },

    async updateItem(input) {
      const name = assertValidName(input.name);
      const description = assertValidOptionalText(input.description, "Item description", 500);
      const category = assertValidOptionalText(input.category, "Item category", 120);
      const productName = assertValidOptionalText(input.productName, "Product name", 120);
      const contentsLabel = assertValidOptionalText(input.contentsLabel, "Contents label", 60);
      const packageDescription = assertValidOptionalText(
        input.packageDescription,
        "Package description",
        240
      );
      const contents = assertValidContents({
        quantity: input.contentsQuantity,
        unit: input.contentsUnit
      });
      if (contentsLabel && contents.quantity === null) {
        throw new ItemManagementValidationError(
          "Contents label requires a contents quantity and unit."
        );
      }
      const defaultUnit = assertValidUnit(input.defaultUnit);
      const handlingUnit = input.handlingUnit ? assertValidUnit(input.handlingUnit) : null;
      if (contents.quantity !== null && !handlingUnit) {
        throw new ItemManagementValidationError(
          "Select a handling unit when contents conversion is provided."
        );
      }
      if (contents.unit && defaultUnit !== contents.unit) {
        throw new ItemManagementValidationError(
          "Base inventory unit must match the package contents unit."
        );
      }
      const reorderThreshold = assertValidReorderThreshold(input.reorderThreshold);
      const targetStockLevel = assertValidTargetStockLevel(
        input.targetStockLevel,
        reorderThreshold
      );
      await assertNoDuplicateActiveName({
        id: input.id,
        name,
        organizationId: input.organizationId,
        templeId: input.templeId
      });
      const item = await repository.updateItem({
        category,
        contentsLabel,
        contentsQuantity: contents.quantity,
        contentsUnit: contents.unit,
        defaultUnit,
        description,
        handlingUnit,
        id: input.id,
        name,
        organizationId: input.organizationId,
        packageDescription,
        productName
      });
      await saveThreshold({
        actor: input.actor,
        itemId: item.id,
        organizationId: input.organizationId,
        reorderThreshold,
        targetStockLevel,
        templeId: input.templeId,
        unit: defaultUnit
      });

      return {
        ...item,
        reorderThreshold,
        targetStockLevel
      };
    }
  };
}
