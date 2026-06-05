import { navigateToInventoryItem, navigateToInventoryLocation } from "@/app/routes/router";

import { BarcodeResultRow } from "../components/BarcodeResultRow";
import { InventoryEmptyState } from "../components/InventoryEmptyState";
import { InventoryErrorState } from "../components/InventoryErrorState";
import { InventoryLoadingState } from "../components/InventoryLoadingState";
import { InventorySearchField } from "../components/InventorySearchField";
import { InventorySearchModeTabs } from "../components/InventorySearchModeTabs";
import { ItemResultRow } from "../components/ItemResultRow";
import { LocationResultRow } from "../components/LocationResultRow";
import { useInventoryLookup } from "../hooks/useInventoryLookup";

export function InventoryLookupScreen() {
  const lookup = useInventoryLookup();

  return (
    <section className="space-y-4">
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
    </section>
  );
}
