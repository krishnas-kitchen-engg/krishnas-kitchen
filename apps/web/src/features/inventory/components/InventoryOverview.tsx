import { navigateToInventoryItem, navigateToInventoryLocation } from "@/app/routes/router";
import type { InventoryOverviewRow } from "../hooks/useInventoryOverview";

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
        <article
          className="rounded-md border border-stone-200 bg-white p-4"
          key={`${row.itemId}:${row.unit}`}
        >
          <button
            className="w-full text-left"
            onClick={() => navigateToInventoryItem(row.itemId)}
            type="button"
          >
            <span className="block text-base font-semibold text-stone-950">{row.itemName}</span>
            <span className="mt-1 block text-2xl font-semibold text-brand-900">
              {row.quantity} {row.unit} total
            </span>
          </button>
          <div className="mt-3 border-t border-stone-100 pt-2">
            {row.locations.map((location) => (
              <button
                className="flex min-h-10 w-full items-center justify-between gap-3 rounded px-1 text-left text-sm hover:bg-stone-50"
                key={location.locationId}
                onClick={() => navigateToInventoryLocation(location.locationId)}
                type="button"
              >
                <span className="text-stone-700">{location.locationName}</span>
                <span className="font-semibold text-stone-950">
                  {location.quantity} {row.unit}
                </span>
              </button>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}
