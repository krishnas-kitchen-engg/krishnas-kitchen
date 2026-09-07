import { useEffect, useMemo, useState } from "react";
import type {
  InventoryBalance,
  InventoryCatalogItem,
  InventoryCatalogLocation
} from "@/domains/inventory";
import { useInventoryCatalogQueries, useInventoryVisibility } from "@/domains/inventory";
import { useAuth } from "@/features/auth";

export type InventoryOverviewRow = {
  itemId: string;
  itemName: string;
  locations: Array<{
    locationId: string;
    locationName: string;
    quantity: number;
  }>;
  quantity: number;
  unit: string;
};

export function useInventoryOverview(searchText = "") {
  const auth = useAuth();
  const catalog = useInventoryCatalogQueries();
  const visibility = useInventoryVisibility();
  const [balances, setBalances] = useState<readonly InventoryBalance[]>([]);
  const [items, setItems] = useState<readonly InventoryCatalogItem[]>([]);
  const [locations, setLocations] = useState<readonly InventoryCatalogLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const organizationId = auth.currentOrganization?.id;
  const templeId = auth.currentTemple?.id;

  useEffect(() => {
    if (!organizationId || !templeId) {
      setError("Organization and temple context are required.");
      setIsLoading(false);
      return;
    }

    let active = true;
    setIsLoading(true);
    setError(null);

    void Promise.all([
      catalog.searchItems({ organizationId }),
      catalog.listActiveLocations({ organizationId, templeId }),
      visibility.getVisibleBalances({ organizationId, templeId })
    ])
      .then(([nextItems, nextLocations, nextBalances]) => {
        if (!active) return;
        setItems(nextItems);
        setLocations(nextLocations);
        setBalances(nextBalances.filter((balance) => balance.quantity !== 0));
      })
      .catch((caughtError: unknown) => {
        if (!active) return;
        setError(
          caughtError instanceof Error ? caughtError.message : "Inventory overview failed to load."
        );
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [catalog, organizationId, templeId, visibility]);

  const rows = useMemo(() => {
    const itemsById = new Map(items.map((item) => [item.id, item]));
    const locationsById = new Map(locations.map((location) => [location.id, location]));
    const groups = new Map<string, InventoryOverviewRow>();

    for (const balance of balances) {
      const key = `${balance.itemId}:${balance.unit}`;
      const existing = groups.get(key);
      const location = locationsById.get(balance.locationId);
      const locationBalance = {
        locationId: balance.locationId,
        locationName: location?.name ?? "Unknown location",
        quantity: balance.quantity
      };

      if (existing) {
        existing.quantity += balance.quantity;
        existing.locations.push(locationBalance);
      } else {
        groups.set(key, {
          itemId: balance.itemId,
          itemName: itemsById.get(balance.itemId)?.name ?? "Unknown item",
          locations: [locationBalance],
          quantity: balance.quantity,
          unit: balance.unit
        });
      }
    }

    const query = searchText.trim().toLocaleLowerCase();
    return Array.from(groups.values())
      .filter(
        (row) =>
          !query ||
          row.itemName.toLocaleLowerCase().includes(query) ||
          row.locations.some((location) =>
            location.locationName.toLocaleLowerCase().includes(query)
          )
      )
      .map((row) => ({
        ...row,
        locations: row.locations.sort((left, right) =>
          left.locationName.localeCompare(right.locationName)
        )
      }))
      .sort(
        (left, right) =>
          left.itemName.localeCompare(right.itemName) || left.unit.localeCompare(right.unit)
      );
  }, [balances, items, locations, searchText]);

  return { error, isLoading, rows };
}
