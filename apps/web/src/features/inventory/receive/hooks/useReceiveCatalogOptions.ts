import { useEffect, useState } from "react";

import { useInventoryCatalogQueries } from "@/domains/inventory";
import { useAuth } from "@/features/auth";

import type { ReceiveCatalogOptionsState } from "../types/receiveWorkflowUiTypes";

const receiveOptionLimit = 25;

export function useReceiveCatalogOptions(searchText: string): ReceiveCatalogOptionsState {
  const auth = useAuth();
  const catalogQueries = useInventoryCatalogQueries();
  const organizationId = auth.currentOrganization?.id;
  const templeId = auth.currentTemple?.id;
  const [state, setState] = useState<ReceiveCatalogOptionsState>({
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
            limit: receiveOptionLimit,
            organizationId: currentOrganizationId,
            ...(trimmedSearch ? { searchText: trimmedSearch } : {})
          }),
          catalogQueries.listActiveLocations({
            limit: receiveOptionLimit,
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
          error: error instanceof Error ? error.message : "Receive catalog failed to load.",
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
