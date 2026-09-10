import type { ItemUnit } from "@krishnas-kitchen/types";

export const ITEM_UNITS = [
  "g",
  "kg",
  "lb",
  "oz",
  "ml",
  "l",
  "fl_oz",
  "cup",
  "pt",
  "qt",
  "gal",
  "tsp",
  "tbsp",
  "unit",
  "case",
  "box",
  "bag",
  "bottle",
  "can",
  "container",
  "pack",
  "bundle",
  "roll"
] as const satisfies readonly ItemUnit[];
