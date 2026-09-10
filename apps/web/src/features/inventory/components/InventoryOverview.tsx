import { navigateToInventoryItem, navigateToInventoryLocation } from "@/app/routes/router";
import {
  formatInventoryStock,
  formatPackageDefinition,
  formatPackageEquivalent
} from "@/domains/inventory";
import type { InventoryOverviewRow } from "../hooks/useInventoryOverview";

function formatProductTotal(row: InventoryOverviewRow): string {
  const totals = new Map<
    string,
    { label: string | null; quantity: number; unit: (typeof row.packages)[number]["unit"] }
  >();

  for (const packageRow of row.packages) {
    const key = `${packageRow.unit}:${packageRow.contentsLabel ?? ""}`;
    const existing = totals.get(key);
    totals.set(key, {
      label: packageRow.contentsLabel,
      quantity: (existing?.quantity ?? 0) + packageRow.quantity,
      unit: packageRow.unit
    });
  }

  return Array.from(totals.values())
    .map((total) => formatPackageEquivalent(total))
    .join(" + ");
}

export function InventoryOverview({ rows }: { rows: readonly InventoryOverviewRow[] }) {
  if (rows.length === 0) {
    return (
      <p className="rounded-md border border-stone-200 bg-white p-4 text-sm text-stone-600">
        No current stock matches this search.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {rows.map((row) => (
        <article className="rounded-md border border-stone-200 bg-white p-4" key={row.productName}>
          <h2 className="text-base font-semibold text-stone-950">
            {row.productName} — {formatProductTotal(row)} total
          </h2>
          <div className="mt-3 space-y-3 border-t border-stone-100 pt-3">
            {row.packages.map((packageRow) => {
              const item = {
                barcodes: [],
                contentsLabel: packageRow.contentsLabel,
                contentsQuantity: packageRow.contentsQuantity,
                contentsUnit: packageRow.contentsUnit,
                defaultUnit: packageRow.unit,
                deletedAt: null,
                handlingUnit: packageRow.handlingUnit,
                id: packageRow.itemId,
                name: packageRow.itemName,
                organizationId: "",
                packageDescription: packageRow.packageDescription
              } as const;
              const packageDefinition = formatPackageDefinition(item);
              const stock = formatInventoryStock(packageRow.quantity, packageRow.unit, item);
              const hasMultiplePackages = row.packages.length > 1;

              return (
                <section className="rounded-md bg-stone-50 p-3" key={packageRow.itemId}>
                  <button
                    className="w-full text-left"
                    onClick={() => navigateToInventoryItem(packageRow.itemId)}
                    type="button"
                  >
                    {hasMultiplePackages && packageRow.itemName !== row.productName ? (
                      <span className="mt-1 block text-sm text-stone-700">
                        {packageRow.itemName}
                      </span>
                    ) : null}
                    <span className="block font-semibold text-stone-950">
                      {stock.secondary
                        ? `${stock.secondary}${hasMultiplePackages ? ` = ${stock.primary}` : ""}`
                        : stock.primary}
                    </span>
                    {!stock.secondary && packageDefinition ? (
                      <span className="mt-1 block text-sm text-stone-600">
                        Package: {packageDefinition}
                      </span>
                    ) : null}
                  </button>
                  <div className="mt-2 border-t border-stone-200 pt-2">
                    {packageRow.locations.map((location) => {
                      const locationStock = formatInventoryStock(
                        location.quantity,
                        packageRow.unit,
                        item
                      );
                      return (
                        <button
                          className="flex min-h-10 w-full items-center justify-between gap-3 rounded px-1 text-left text-sm hover:bg-white"
                          key={location.locationId}
                          onClick={() => navigateToInventoryLocation(location.locationId)}
                          type="button"
                        >
                          <span className="text-stone-700">{location.locationName}</span>
                          <span className="text-right font-semibold text-stone-950">
                            {locationStock.secondary
                              ? `${locationStock.secondary} = ${locationStock.primary}`
                              : locationStock.primary}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        </article>
      ))}
    </div>
  );
}
