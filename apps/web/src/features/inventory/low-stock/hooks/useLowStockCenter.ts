import { useContext, useEffect, useMemo, useState } from "react";

import {
  useInventoryCatalogQueries,
  useInventoryPermissions,
  useInventoryVisibility
} from "@/domains/inventory";
import { InventoryAvailabilityContext } from "@/domains/inventory/integration/inventoryContextValue";
import { useAuth } from "@/features/auth";

import type {
  LowStockCenterFilters,
  LowStockCenterItem,
  LowStockCenterLoaderInput,
  LowStockCenterState,
  LowStockCenterStatusFilter
} from "../types/lowStockCenterTypes";

const initialFilters: LowStockCenterFilters = {
  locationId: "",
  searchText: "",
  status: "all"
};

export const initialLowStockCenterState: LowStockCenterState = {
  error: null,
  filters: initialFilters,
  isLoading: false,
  items: [],
  locations: []
};

function matchesSearch(item: LowStockCenterItem, searchText: string): boolean {
  const normalizedSearch = searchText.trim().toLocaleLowerCase();

  return (
    !normalizedSearch ||
    item.itemId.toLocaleLowerCase().includes(normalizedSearch) ||
    item.itemName.toLocaleLowerCase().includes(normalizedSearch)
  );
}

function getStatus(alert: { currentQuantity: number }): LowStockCenterItem["status"] {
  return alert.currentQuantity <= 0 ? "out" : "low";
}

export function buildLowStockCenterItems(input: LowStockCenterLoaderInput): LowStockCenterItem[] {
  const activeItems = new Map(input.items.map((item) => [item.id, item]));
  const activeLocations = new Map(input.locations.map((location) => [location.id, location]));

  return input.alerts
    .flatMap((alert): LowStockCenterItem[] => {
      const item = activeItems.get(alert.itemId);
      const location = alert.locationId ? activeLocations.get(alert.locationId) : null;

      if (!item || (alert.locationId && !location)) {
        return [];
      }

      const status = getStatus(alert);
      const lowStockItem: LowStockCenterItem = {
        ...alert,
        itemName: item.name,
        locationName: location?.name ?? "All locations",
        status
      };

      if (input.filters.status !== "all" && lowStockItem.status !== input.filters.status) {
        return [];
      }

      if (input.filters.locationId && lowStockItem.locationId !== input.filters.locationId) {
        return [];
      }

      return matchesSearch(lowStockItem, input.filters.searchText) ? [lowStockItem] : [];
    })
    .sort(
      (left, right) =>
        (left.status === "out" ? 0 : 1) - (right.status === "out" ? 0 : 1) ||
        right.shortageQuantity - left.shortageQuantity ||
        left.itemName.localeCompare(right.itemName)
    );
}

export function useLowStockCenter(): LowStockCenterState & {
  canViewLowStockCenter: boolean;
  outOfStockCount: number;
  refresh: () => void;
  setLocationId: (locationId: string) => void;
  setSearchText: (searchText: string) => void;
  setStatus: (status: LowStockCenterStatusFilter) => void;
} {
  const auth = useAuth();
  const permissions = useInventoryPermissions();
  const availability = useContext(InventoryAvailabilityContext);
  const catalogQueries = useInventoryCatalogQueries();
  const visibility = useInventoryVisibility();
  const organizationId = auth.currentOrganization?.id;
  const templeId = auth.currentTemple?.id;
  const canViewLowStockCenter = permissions.canAdjustInventory;
  const [filters, setFilters] = useState(initialFilters);
  const [refreshIndex, setRefreshIndex] = useState(0);
  const [state, setState] = useState<LowStockCenterState>(initialLowStockCenterState);
  const outOfStockCount = useMemo(
    () => state.items.filter((item) => item.status === "out").length,
    [state.items]
  );

  useEffect(() => {
    if (!canViewLowStockCenter || !organizationId || !templeId) {
      setState({
        ...initialLowStockCenterState,
        filters
      });
      return;
    }

    if (availability.status !== "ready") {
      setState({
        ...initialLowStockCenterState,
        error: "Inventory services are unavailable.",
        filters
      });
      return;
    }

    let isActive = true;
    const currentOrganizationId = organizationId;
    const currentTempleId = templeId;

    async function load() {
      setState((currentState) => ({
        ...currentState,
        error: null,
        filters,
        isLoading: true
      }));

      try {
        const [alerts, items, locations] = await Promise.all([
          visibility.getLowStockAlerts({
            organizationId: currentOrganizationId,
            templeId: currentTempleId
          }),
          catalogQueries.searchItems({
            organizationId: currentOrganizationId
          }),
          catalogQueries.listActiveLocations({
            organizationId: currentOrganizationId,
            templeId: currentTempleId
          })
        ]);

        if (!isActive) {
          return;
        }

        setState({
          error: null,
          filters,
          isLoading: false,
          items: buildLowStockCenterItems({
            alerts,
            filters,
            items,
            locations
          }),
          locations
        });
      } catch (error) {
        if (isActive) {
          setState({
            ...initialLowStockCenterState,
            error: error instanceof Error ? error.message : "Low stock center failed to load.",
            filters
          });
        }
      }
    }

    void load();

    return () => {
      isActive = false;
    };
  }, [
    availability.status,
    canViewLowStockCenter,
    catalogQueries,
    filters,
    organizationId,
    refreshIndex,
    templeId,
    visibility
  ]);

  return {
    ...state,
    canViewLowStockCenter,
    outOfStockCount,
    refresh() {
      setRefreshIndex((currentIndex) => currentIndex + 1);
    },
    setLocationId(locationId: string) {
      setFilters((currentFilters) => ({
        ...currentFilters,
        locationId
      }));
    },
    setSearchText(searchText: string) {
      setFilters((currentFilters) => ({
        ...currentFilters,
        searchText
      }));
    },
    setStatus(status: LowStockCenterStatusFilter) {
      setFilters((currentFilters) => ({
        ...currentFilters,
        status
      }));
    }
  };
}
