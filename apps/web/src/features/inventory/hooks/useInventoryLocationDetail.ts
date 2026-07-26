import { useEffect, useState } from "react";

import { useInventoryCatalogQueries, useInventoryVisibility } from "@/domains/inventory";
import { useAuth } from "@/features/auth";

import type { InventoryLocationDetailState } from "../types/inventoryLookupTypes";

const transactionHistoryLimit = 25;

export function useInventoryLocationDetail(locationId: string) {
  const auth = useAuth();
  const catalogQueries = useInventoryCatalogQueries();
  const visibility = useInventoryVisibility();
  const [state, setState] = useState<InventoryLocationDetailState>({
    balances: [],
    error: null,
    isLoading: true,
    location: null,
    transactions: []
  });
  const [refreshIndex, setRefreshIndex] = useState(0);
  const organizationId = auth.currentOrganization?.id;
  const templeId = auth.currentTemple?.id;

  useEffect(() => {
    if (!organizationId || !templeId) {
      setState({
        balances: [],
        error: "Organization and temple context are required.",
        isLoading: false,
        location: null,
        transactions: []
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
        const [location, balances, transactions] = await Promise.all([
          catalogQueries.findLocationById(currentOrganizationId, currentTempleId, locationId),
          visibility.getVisibleBalances({
            locationId,
            organizationId: currentOrganizationId,
            templeId: currentTempleId
          }),
          visibility.getTransactionHistory({
            limit: transactionHistoryLimit,
            locationId,
            organizationId: currentOrganizationId,
            templeId: currentTempleId
          })
        ]);

        if (!isActive) {
          return;
        }

        setState({
          balances,
          error: null,
          isLoading: false,
          location,
          transactions
        });
      } catch (error) {
        if (!isActive) {
          return;
        }

        setState({
          balances: [],
          error: error instanceof Error ? error.message : "Location detail failed to load.",
          isLoading: false,
          location: null,
          transactions: []
        });
      }
    }

    void load();

    return () => {
      isActive = false;
    };
  }, [catalogQueries, locationId, organizationId, refreshIndex, templeId, visibility]);

  return {
    ...state,
    reload() {
      setRefreshIndex((currentIndex) => currentIndex + 1);
    }
  };
}
