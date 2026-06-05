import { useEffect, useState } from "react";

import { useInventoryCatalogQueries } from "@/domains/inventory";
import { useAuth } from "@/features/auth";

import type { TransferCatalogOptionsState } from "../types/transferWorkflowUiTypes";

const transferOptionLimit = 25;

export function useTransferCatalogOptions(searchText: string): TransferCatalogOptionsState {
  const auth = useAuth();
  const catalogQueries = useInventoryCatalogQueries();
  const organizationId = auth.currentOrganization?.id;
  const templeId = auth.currentTemple?.id;
  const [state, setState] = useState<TransferCatalogOptionsState>({
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
            limit: transferOptionLimit,
            organizationId: currentOrganizationId,
            ...(trimmedSearch ? { searchText: trimmedSearch } : {})
          }),
          catalogQueries.listActiveLocations({
            limit: transferOptionLimit,
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
          error: error instanceof Error ? error.message : "Transfer catalog failed to load.",
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
