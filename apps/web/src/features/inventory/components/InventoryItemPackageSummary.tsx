import type { InventoryCatalogItem } from "@/domains/inventory";
import {
  formatInventoryUnit,
  formatPackageDefinition,
  getInventoryProductName
} from "@/domains/inventory";

export function InventoryItemPackageSummary({
  item,
  showProductName = false
}: {
  item: InventoryCatalogItem;
  showProductName?: boolean;
}) {
  const packageDefinition = formatPackageDefinition(item);
  const productName = getInventoryProductName(item);

  return (
    <div className="text-sm text-stone-600">
      {showProductName && productName !== item.name ? <p>Product: {productName}</p> : null}
      <p>
        Count or move in {formatInventoryUnit(item.handlingUnit ?? item.defaultUnit)}
        {item.handlingUnit && item.handlingUnit !== item.defaultUnit
          ? `; stored in ${formatInventoryUnit(item.defaultUnit)}`
          : ""}
      </p>
      {packageDefinition ? <p className="mt-1">Each: {packageDefinition}</p> : null}
    </div>
  );
}
