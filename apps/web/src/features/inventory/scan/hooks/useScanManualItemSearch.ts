import { useEffect, useState } from "react";

import { useInventoryCatalogQueries, type InventoryCatalogItem } from "@/domains/inventory";
import { useAuth } from "@/features/auth";

const manualSearchLimit = 25;

export function useScanManualItemSearch(searchText: string) {
  const auth = useAuth();
  const catalogQueries = useInventoryCatalogQueries();
  const organizationId = auth.currentOrganization?.id;
  const [state, setState] = useState<{
    error: string | null;
    isLoading: boolean;
    items: readonly InventoryCatalogItem[];
  }>({
    error: null,
    isLoading: true,
    items: []
  });

  useEffect(() => {
    if (!organizationId) {
      setState({
        error: "Organization context is required.",
        isLoading: false,
        items: []
      });
      return;
    }

    const currentOrganizationId = organizationId;
    let isActive = true;

    async function load() {
      setState((currentState) => ({
        ...currentState,
        error: null,
        isLoading: true
      }));

      try {
        const trimmedSearch = searchText.trim();
        const items = await catalogQueries.searchItems({
          limit: manualSearchLimit,
          organizationId: currentOrganizationId,
          ...(trimmedSearch ? { searchText: trimmedSearch } : {})
        });

        if (!isActive) {
          return;
        }

        setState({
          error: null,
          isLoading: false,
          items
        });
      } catch (error) {
        if (!isActive) {
          return;
        }

        setState({
          error: error instanceof Error ? error.message : "Manual item search failed.",
          isLoading: false,
          items: []
        });
      }
    }

    void load();

    return () => {
      isActive = false;
    };
  }, [catalogQueries, organizationId, searchText]);

  return state;
}
