import { useEffect, useMemo, useState } from "react";
import type { ItemUnit } from "@krishnas-kitchen/types";
import type {
  InventoryBalance,
  InventoryCatalogItem,
  InventoryCatalogLocation
} from "@/domains/inventory";
import { useInventoryCatalogQueries, useInventoryVisibility } from "@/domains/inventory";
import { getInventoryProductName } from "@/domains/inventory";
import { useAuth } from "@/features/auth";

export type InventoryOverviewPackageRow = {
  contentsQuantity: number | null;
  contentsUnit: ItemUnit | null;
  contentsLabel: string | null;
  handlingUnit: ItemUnit | null;
  itemId: string;
  itemName: string;
  packageDescription: string | null;
  locations: Array<{
    locationId: string;
    locationName: string;
    quantity: number;
  }>;
  quantity: number;
  unit: ItemUnit;
};

export type InventoryOverviewRow = {
  packages: InventoryOverviewPackageRow[];
  productName: string;
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
    const packages = new Map<string, InventoryOverviewPackageRow>();

    for (const balance of balances) {
      const key = `${balance.itemId}:${balance.unit}`;
      const existing = packages.get(key);
      const item = itemsById.get(balance.itemId);
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
        packages.set(key, {
          contentsQuantity: item?.contentsQuantity ?? null,
          contentsUnit: item?.contentsUnit ?? null,
          contentsLabel: item?.contentsLabel ?? null,
          handlingUnit: item?.handlingUnit ?? null,
          itemId: balance.itemId,
          itemName: item?.name ?? "Unknown item",
          packageDescription: item?.packageDescription ?? null,
          locations: [locationBalance],
          quantity: balance.quantity,
          unit: balance.unit
        });
      }
    }

    const query = searchText.trim().toLocaleLowerCase();
    const productGroups = new Map<string, InventoryOverviewPackageRow[]>();

    for (const packageRow of packages.values()) {
      const item = itemsById.get(packageRow.itemId);
      const productName = item ? getInventoryProductName(item) : packageRow.itemName;
      const existing = productGroups.get(productName) ?? [];
      productGroups.set(productName, [...existing, packageRow]);
    }

    return Array.from(productGroups.entries())
      .map(([productName, packageRows]): InventoryOverviewRow => {
        return {
          packages: packageRows.sort(
            (left, right) =>
              left.itemName.localeCompare(right.itemName) || left.unit.localeCompare(right.unit)
          ),
          productName
        };
      })
      .filter(
        (row) =>
          !query ||
          row.productName.toLocaleLowerCase().includes(query) ||
          row.packages.some(
            (packageRow) =>
              packageRow.itemName.toLocaleLowerCase().includes(query) ||
              packageRow.locations.some((location) =>
                location.locationName.toLocaleLowerCase().includes(query)
              )
          )
      )
      .map((row) => ({
        ...row,
        packages: row.packages.map((packageRow) => ({
          ...packageRow,
          locations: packageRow.locations.sort((left, right) =>
            left.locationName.localeCompare(right.locationName)
          )
        }))
      }))
      .sort((left, right) => left.productName.localeCompare(right.productName));
  }, [balances, items, locations, searchText]);

  return { error, isLoading, rows };
}
