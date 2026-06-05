import { useEffect, useState } from "react";

import { useInventoryCatalogQueries } from "@/domains/inventory";
import { useAuth } from "@/features/auth";

import type { InventoryLookupMode, InventoryLookupState } from "../types/inventoryLookupTypes";

const lookupLimit = 25;

export function useInventoryLookup(initialMode: InventoryLookupMode = "items") {
  const auth = useAuth();
  const catalogQueries = useInventoryCatalogQueries();
  const [mode, setMode] = useState<InventoryLookupMode>(initialMode);
  const [searchText, setSearchText] = useState("");
  const [state, setState] = useState<InventoryLookupState>({
    barcodes: [],
    error: null,
    isLoading: true,
    items: [],
    locations: [],
    mode: initialMode,
    searchText: ""
  });
  const organizationId = auth.currentOrganization?.id;
  const templeId = auth.currentTemple?.id;

  useEffect(() => {
    if (!organizationId) {
      setState((currentState) => ({
        ...currentState,
        error: "Organization context is required.",
        isLoading: false
      }));
      return;
    }

    const currentOrganizationId = organizationId;
    let isActive = true;

    async function load() {
      setState((currentState) => ({
        ...currentState,
        error: null,
        isLoading: true,
        mode,
        searchText
      }));

      try {
        const query = {
          limit: lookupLimit,
          organizationId: currentOrganizationId,
          ...(searchText ? { searchText } : {})
        };
        const [items, locations, barcodes] = await Promise.all([
          mode === "items" ? catalogQueries.searchItems(query) : Promise.resolve([]),
          mode === "locations"
            ? catalogQueries.searchLocations({
                ...query,
                ...(templeId ? { templeId } : {})
              })
            : Promise.resolve([]),
          mode === "barcodes" ? catalogQueries.searchBarcodes(query) : Promise.resolve([])
        ]);

        if (!isActive) {
          return;
        }

        setState({
          barcodes,
          error: null,
          isLoading: false,
          items,
          locations,
          mode,
          searchText
        });
      } catch (error) {
        if (!isActive) {
          return;
        }

        setState({
          barcodes: [],
          error: error instanceof Error ? error.message : "Inventory lookup failed.",
          isLoading: false,
          items: [],
          locations: [],
          mode,
          searchText
        });
      }
    }

    void load();

    return () => {
      isActive = false;
    };
  }, [catalogQueries, mode, organizationId, searchText, templeId]);

  return {
    ...state,
    setMode,
    setSearchText
  };
}
