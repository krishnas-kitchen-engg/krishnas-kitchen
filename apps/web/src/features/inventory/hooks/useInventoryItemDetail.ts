import { useEffect, useState } from "react";

import { useInventoryCatalogQueries, useInventoryVisibility } from "@/domains/inventory";
import { useAuth } from "@/features/auth";

import type { InventoryItemDetailState } from "../types/inventoryLookupTypes";

const transactionHistoryLimit = 25;

export function useInventoryItemDetail(itemId: string) {
  const auth = useAuth();
  const catalogQueries = useInventoryCatalogQueries();
  const visibility = useInventoryVisibility();
  const [state, setState] = useState<InventoryItemDetailState>({
    balances: [],
    error: null,
    isLoading: true,
    item: null,
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
        item: null,
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
        const [item, balances, transactions] = await Promise.all([
          catalogQueries.findItemById(currentOrganizationId, itemId),
          visibility.getVisibleBalances({
            itemId,
            organizationId: currentOrganizationId,
            templeId: currentTempleId
          }),
          visibility.getTransactionHistory({
            itemId,
            limit: transactionHistoryLimit,
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
          item,
          transactions
        });
      } catch (error) {
        if (!isActive) {
          return;
        }

        setState({
          balances: [],
          error: error instanceof Error ? error.message : "Item detail failed to load.",
          isLoading: false,
          item: null,
          transactions: []
        });
      }
    }

    void load();

    return () => {
      isActive = false;
    };
  }, [catalogQueries, itemId, organizationId, refreshIndex, templeId, visibility]);

  return {
    ...state,
    reload() {
      setRefreshIndex((currentIndex) => currentIndex + 1);
    }
  };
}
