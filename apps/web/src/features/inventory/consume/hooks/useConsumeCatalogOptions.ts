import { useEffect, useState } from "react";

import { useInventoryCatalogQueries } from "@/domains/inventory";
import { useAuth } from "@/features/auth";

import type { ConsumeCatalogOptionsState } from "../types/consumeWorkflowUiTypes";

const consumeOptionLimit = 25;

export function useConsumeCatalogOptions(searchText: string): ConsumeCatalogOptionsState {
  const auth = useAuth();
  const catalogQueries = useInventoryCatalogQueries();
  const organizationId = auth.currentOrganization?.id;
  const templeId = auth.currentTemple?.id;
  const [state, setState] = useState<ConsumeCatalogOptionsState>({
    error: null,
    isLoading: true,
    items: [],
    locations: []
  });

  useEffect(() => {
    if (!organizationId || !templeId) {
      setState({
        error: "Organization and temple context are required.",
        isLoading: false,
        items: [],
        locations: []
      });
      return;
    }

    const currentOrganizationId = organizationId;
    const currentTempleId = templeId;
    let isActive = true;

    async function load() {
      setState((currentState) => ({
        ...currentState,
        error: null,
        isLoading: true
      }));

      try {
        const trimmedSearch = searchText.trim();
        const [items, locations] = await Promise.all([
          catalogQueries.searchItems({
            limit: consumeOptionLimit,
            organizationId: currentOrganizationId,
            ...(trimmedSearch ? { searchText: trimmedSearch } : {})
          }),
          catalogQueries.listActiveLocations({
            limit: consumeOptionLimit,
            organizationId: currentOrganizationId,
            templeId: currentTempleId
          })
        ]);

        if (!isActive) {
          return;
        }

        setState({
          error: null,
          isLoading: false,
          items,
          locations
        });
      } catch (error) {
        if (!isActive) {
          return;
        }

        setState({
          error: error instanceof Error ? error.message : "Consumption catalog failed to load.",
          isLoading: false,
          items: [],
          locations: []
        });
      }
    }

    void load();

    return () => {
      isActive = false;
    };
  }, [catalogQueries, organizationId, searchText, templeId]);

  return state;
}
