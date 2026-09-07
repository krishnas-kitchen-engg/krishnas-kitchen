import { navigateToInventoryItem, navigateToInventoryLocation } from "@/app/routes/router";

import { BarcodeResultRow } from "../components/BarcodeResultRow";
import { InventoryEmptyState } from "../components/InventoryEmptyState";
import { InventoryErrorState } from "../components/InventoryErrorState";
import { InventoryLoadingState } from "../components/InventoryLoadingState";
import { InventorySearchField } from "../components/InventorySearchField";
import { InventorySearchModeTabs } from "../components/InventorySearchModeTabs";
import { InventoryOverview } from "../components/InventoryOverview";
import { ItemResultRow } from "../components/ItemResultRow";
import { LocationResultRow } from "../components/LocationResultRow";
import { useInventoryLookup } from "../hooks/useInventoryLookup";
import { useInventoryOverview } from "../hooks/useInventoryOverview";
import { useState } from "react";

export function InventoryLookupScreen() {
  const [view, setView] = useState<"overview" | "find">("overview");
  const [overviewSearch, setOverviewSearch] = useState("");
  const lookup = useInventoryLookup();
  const overview = useInventoryOverview(overviewSearch);

  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-stone-950">Inventory</h1>
        <p className="mt-1 text-sm leading-6 text-stone-600">
          See temple totals, then expand each item by pantry, freezer, container, or other storage
          location.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button
          className={`min-h-11 rounded-md border text-sm font-semibold ${view === "overview" ? "border-brand-900 bg-brand-900 text-white" : "border-stone-300 bg-white text-stone-700"}`}
          onClick={() => setView("overview")}
          type="button"
        >
          Stock overview
        </button>
        <button
          className={`min-h-11 rounded-md border text-sm font-semibold ${view === "find" ? "border-brand-900 bg-brand-900 text-white" : "border-stone-300 bg-white text-stone-700"}`}
          onClick={() => setView("find")}
          type="button"
        >
          Find records
        </button>
      </div>

      {view === "overview" ? (
        <>
          <label className="block text-sm font-medium text-stone-800">
            Search stock
            <input
              className="mt-1 min-h-11 w-full rounded-md border border-stone-300 bg-white px-3 text-base"
              onChange={(event) => setOverviewSearch(event.target.value)}
              placeholder="Item or storage location"
              value={overviewSearch}
            />
          </label>
          {overview.isLoading ? <InventoryLoadingState /> : null}
          {overview.error ? <InventoryErrorState message={overview.error} /> : null}
          {!overview.isLoading && !overview.error ? (
            <InventoryOverview rows={overview.rows} />
          ) : null}
        </>
      ) : (
        <>
          <InventorySearchField onChange={lookup.setSearchText} value={lookup.searchText} />
          <InventorySearchModeTabs mode={lookup.mode} onChange={lookup.setMode} />

          {lookup.isLoading ? <InventoryLoadingState /> : null}
          {lookup.error ? <InventoryErrorState message={lookup.error} /> : null}

          {!lookup.isLoading && !lookup.error && lookup.mode === "items" ? (
            <div className="space-y-2">
              {lookup.items.length > 0 ? (
                lookup.items.map((item) => (
                  <ItemResultRow item={item} key={item.id} onSelect={navigateToInventoryItem} />
                ))
              ) : (
                <InventoryEmptyState message="No active items found." />
              )}
            </div>
          ) : null}

          {!lookup.isLoading && !lookup.error && lookup.mode === "locations" ? (
            <div className="space-y-2">
              {lookup.locations.length > 0 ? (
                lookup.locations.map((location) => (
                  <LocationResultRow
                    key={location.id}
                    location={location}
                    onSelect={navigateToInventoryLocation}
                  />
                ))
              ) : (
                <InventoryEmptyState message="No active locations found." />
              )}
            </div>
          ) : null}

          {!lookup.isLoading && !lookup.error && lookup.mode === "barcodes" ? (
            <div className="space-y-2">
              {lookup.barcodes.length > 0 ? (
                lookup.barcodes.map((barcode) => (
                  <BarcodeResultRow
                    barcode={barcode}
                    key={`${barcode.format}:${barcode.value}:${barcode.itemId}`}
                    onSelect={navigateToInventoryItem}
                  />
                ))
              ) : (
                <InventoryEmptyState message="No active barcodes found." />
              )}
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}
