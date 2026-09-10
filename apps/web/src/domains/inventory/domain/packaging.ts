import type { ItemUnit } from "@krishnas-kitchen/types";

import type { InventoryCatalogItem } from "./catalog";

const singularUnitLabels: Record<ItemUnit, string> = {
  bag: "bag",
  bottle: "bottle",
  box: "box",
  bundle: "bundle",
  can: "can",
  case: "case",
  container: "container",
  cup: "cup",
  fl_oz: "fl oz",
  g: "g",
  gal: "gal",
  kg: "kg",
  l: "L",
  lb: "lb",
  ml: "mL",
  oz: "oz",
  pack: "pack",
  pt: "pt",
  qt: "qt",
  roll: "roll",
  tbsp: "tbsp",
  tsp: "tsp",
  unit: "unit"
};

const pluralUnitLabels: Partial<Record<ItemUnit, string>> = {
  bag: "bags",
  bottle: "bottles",
  box: "boxes",
  bundle: "bundles",
  can: "cans",
  case: "cases",
  container: "containers",
  cup: "cups",
  pack: "packs",
  roll: "rolls",
  unit: "units"
};

export function formatInventoryNumber(value: number): string {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 3 }).format(value);
}

export function formatInventoryUnit(unit: ItemUnit, quantity = 2): string {
  return quantity === 1
    ? singularUnitLabels[unit]
    : (pluralUnitLabels[unit] ?? singularUnitLabels[unit]);
}

export function formatInventoryQuantity(quantity: number, unit: ItemUnit): string {
  return `${formatInventoryNumber(quantity)} ${formatInventoryUnit(unit, quantity)}`;
}

export function getInventoryProductName(item: InventoryCatalogItem): string {
  return item.productName?.trim() || item.name;
}

export function getInventoryEntryUnits(
  item: InventoryCatalogItem,
  baseUnits: readonly ItemUnit[] = [item.defaultUnit]
): ItemUnit[] {
  return Array.from(new Set([...(item.handlingUnit ? [item.handlingUnit] : []), ...baseUnits]));
}

export function convertInventoryEntryToBase(
  quantity: number,
  unit: ItemUnit,
  item: InventoryCatalogItem
): { conversionFactor: number | null; quantity: number; unit: ItemUnit } {
  if (item.handlingUnit === unit && item.contentsQuantity && item.contentsUnit) {
    return {
      conversionFactor: item.contentsQuantity,
      quantity: quantity * item.contentsQuantity,
      unit: item.contentsUnit
    };
  }

  return { conversionFactor: null, quantity, unit };
}

export function convertInventoryBaseToEntry(
  quantity: number,
  unit: ItemUnit,
  item: InventoryCatalogItem,
  entryUnit: ItemUnit
): number | null {
  if (entryUnit === unit) {
    return quantity;
  }

  if (item.handlingUnit === entryUnit && item.contentsQuantity && item.contentsUnit === unit) {
    return quantity / item.contentsQuantity;
  }

  return null;
}

export function getPackageEquivalent(
  quantity: number,
  item: InventoryCatalogItem
): { label: string | null; quantity: number; unit: ItemUnit } | null {
  if (!item.contentsQuantity || !item.contentsUnit) {
    return null;
  }

  return {
    label: item.contentsLabel?.trim() || null,
    quantity: quantity * item.contentsQuantity,
    unit: item.contentsUnit
  };
}

export function formatPackageEquivalent(input: {
  label?: string | null;
  quantity: number;
  unit: ItemUnit;
}): string {
  if (input.label && input.unit === "unit") {
    return `${formatInventoryNumber(input.quantity)} ${input.label}`;
  }

  return formatInventoryQuantity(input.quantity, input.unit);
}

export function formatInventoryStock(
  quantity: number,
  unit: ItemUnit,
  item: InventoryCatalogItem
): { handlingQuantity: number | null; primary: string; secondary: string | null } {
  if (!item.handlingUnit || !item.contentsQuantity || item.contentsUnit !== unit) {
    return {
      handlingQuantity: item.handlingUnit === unit ? quantity : null,
      primary: formatInventoryQuantity(quantity, unit),
      secondary: null
    };
  }

  const rawHandlingQuantity = quantity / item.contentsQuantity;
  const roundedHandlingQuantity = Math.round(rawHandlingQuantity * 1000) / 1000;
  const fullHandlingUnits = Math.floor(rawHandlingQuantity + 0.0000001);
  const looseQuantity =
    Math.round((quantity - fullHandlingUnits * item.contentsQuantity) * 1000) / 1000;
  const exactPackages = Math.abs(looseQuantity) < 0.0001;
  const formatBaseQuantity = (value: number) =>
    formatPackageEquivalent({ label: item.contentsLabel ?? null, quantity: value, unit });
  const primary = exactPackages
    ? formatInventoryQuantity(fullHandlingUnits, item.handlingUnit)
    : fullHandlingUnits > 0
      ? `${formatInventoryQuantity(fullHandlingUnits, item.handlingUnit)} + ${formatBaseQuantity(looseQuantity)} loose`
      : `${formatBaseQuantity(quantity)} loose`;

  return {
    handlingQuantity: exactPackages ? roundedHandlingQuantity : null,
    primary,
    secondary: formatBaseQuantity(quantity)
  };
}

export function formatInventoryTransactionQuantity(input: {
  auditMetadata: {
    handlingQuantity?: number;
    handlingUnit?: ItemUnit;
  };
  quantity: number;
  unit: ItemUnit;
}): string {
  const baseQuantity = formatInventoryQuantity(input.quantity, input.unit);

  if (
    typeof input.auditMetadata.handlingQuantity !== "number" ||
    !input.auditMetadata.handlingUnit
  ) {
    return baseQuantity;
  }

  return `${formatInventoryQuantity(
    input.auditMetadata.handlingQuantity,
    input.auditMetadata.handlingUnit
  )} (${baseQuantity})`;
}

export function formatPackageDefinition(item: InventoryCatalogItem): string | null {
  if (item.packageDescription?.trim()) {
    return item.packageDescription.trim();
  }

  if (!item.contentsQuantity || !item.contentsUnit) {
    return null;
  }

  return `${formatPackageEquivalent({
    label: item.contentsLabel ?? null,
    quantity: item.contentsQuantity,
    unit: item.contentsUnit
  })} per ${formatInventoryUnit(item.handlingUnit ?? item.defaultUnit, 1)}`;
}
