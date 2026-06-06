import { useCallback, useContext, useEffect, useState } from "react";

import type {
  InventoryTransaction,
  InventoryVisibilityService,
  UnknownBarcodeManagementService
} from "@/domains/inventory";
import { InventoryAvailabilityContext } from "@/domains/inventory/integration/inventoryContextValue";
import { InventoryIntegrationContext } from "@/domains/inventory/integration/inventoryContextValue";
import { useInventoryPermissions } from "@/domains/inventory";
import { useAuth } from "@/features/auth";

import type {
  VolunteerHomeActivityItem,
  VolunteerHomeSectionState,
  VolunteerHomeSummaryState
} from "../types/volunteerHomeTypes";

const summaryLimit = 5;

function emptySection<T>(): VolunteerHomeSectionState<T> {
  return {
    error: null,
    items: [],
    status: "loaded"
  };
}

export const initialVolunteerHomeSummaryState: VolunteerHomeSummaryState = {
  isLoading: false,
  lowStock: emptySection(),
  pendingUnknownBarcodes: emptySection(),
  recentActivity: emptySection()
};

function formatLocationPair(transaction: InventoryTransaction): string {
  if (transaction.sourceLocationId && transaction.destinationLocationId) {
    return `${transaction.sourceLocationId} -> ${transaction.destinationLocationId}`;
  }

  if (transaction.destinationLocationId) {
    return transaction.destinationLocationId;
  }

  if (transaction.sourceLocationId) {
    return transaction.sourceLocationId;
  }

  return "inventory";
}

export function formatHomeActivity(transaction: InventoryTransaction): VolunteerHomeActivityItem {
  const quantity = `${transaction.quantity} ${transaction.unit}`;

  if (transaction.transactionType === "received") {
    return {
      description: `${transaction.itemId} received (+${quantity})`,
      id: transaction.id,
      timestamp: transaction.createdAt
    };
  }

  if (transaction.transactionType === "transfer") {
    return {
      description: `${transaction.itemId} transferred (${formatLocationPair(transaction)})`,
      id: transaction.id,
      timestamp: transaction.createdAt
    };
  }

  if (transaction.transactionType === "returned") {
    return {
      description: `${transaction.itemId} returned (${formatLocationPair(transaction)})`,
      id: transaction.id,
      timestamp: transaction.createdAt
    };
  }

  if (transaction.transactionType === "reversal") {
    return {
      description: `${transaction.itemId} reversal recorded`,
      id: transaction.id,
      timestamp: transaction.createdAt
    };
  }

  return {
    description: `${transaction.itemId} inventory event (${quantity})`,
    id: transaction.id,
    timestamp: transaction.createdAt
  };
}

function toUnavailableSection<T>(error: unknown): VolunteerHomeSectionState<T> {
  return {
    error:
      typeof error === "string"
        ? error
        : error instanceof Error
          ? error.message
          : "Summary is unavailable.",
    items: [],
    status: "unavailable"
  };
}

function toLoadedSection<T>(items: readonly T[]): VolunteerHomeSectionState<T> {
  return {
    error: null,
    items,
    status: "loaded"
  };
}

export async function loadVolunteerHomeSummary(input: {
  organizationId: string;
  templeId: string;
  unknownBarcodes: UnknownBarcodeManagementService;
  visibility: InventoryVisibilityService;
}): Promise<Omit<VolunteerHomeSummaryState, "isLoading">> {
  const [recentActivityResult, lowStockResult, unknownBarcodeResult] = await Promise.allSettled([
    input.visibility.getTransactionHistory({
      limit: summaryLimit,
      organizationId: input.organizationId,
      templeId: input.templeId
    }),
    input.visibility.getLowStockAlerts({
      organizationId: input.organizationId,
      templeId: input.templeId
    }),
    input.unknownBarcodes.listPendingUnknownBarcodes({
      limit: summaryLimit,
      organizationId: input.organizationId,
      templeId: input.templeId
    })
  ]);

  return {
    lowStock:
      lowStockResult.status === "fulfilled"
        ? toLoadedSection(lowStockResult.value.slice(0, summaryLimit))
        : toUnavailableSection(lowStockResult.reason),
    pendingUnknownBarcodes:
      unknownBarcodeResult.status === "fulfilled"
        ? toLoadedSection(unknownBarcodeResult.value.slice(0, summaryLimit))
        : toUnavailableSection(unknownBarcodeResult.reason),
    recentActivity:
      recentActivityResult.status === "fulfilled"
        ? toLoadedSection(recentActivityResult.value.map(formatHomeActivity))
        : toUnavailableSection(recentActivityResult.reason)
  };
}

export function useVolunteerHomeSummary(): VolunteerHomeSummaryState & {
  refresh: () => void;
} {
  const auth = useAuth();
  const permissions = useInventoryPermissions();
  const availability = useContext(InventoryAvailabilityContext);
  const integration = useContext(InventoryIntegrationContext);
  const organizationId = auth.currentOrganization?.id;
  const templeId = auth.currentTemple?.id;
  const [state, setState] = useState<VolunteerHomeSummaryState>(initialVolunteerHomeSummaryState);
  const [refreshIndex, setRefreshIndex] = useState(0);

  const refresh = useCallback(() => {
    setRefreshIndex((currentIndex) => currentIndex + 1);
  }, []);

  useEffect(() => {
    if (!permissions.canReadInventory || !organizationId || !templeId) {
      setState(initialVolunteerHomeSummaryState);
      return;
    }

    if (availability.status !== "ready" || !integration?.services) {
      setState({
        isLoading: false,
        lowStock: toUnavailableSection("Inventory services are unavailable."),
        pendingUnknownBarcodes: toUnavailableSection("Inventory services are unavailable."),
        recentActivity: toUnavailableSection("Inventory services are unavailable.")
      });
      return;
    }

    let isActive = true;
    const { unknownBarcodes, visibility } = integration.services;
    const currentOrganizationId = organizationId;
    const currentTempleId = templeId;

    async function load() {
      setState((currentState) => ({
        ...currentState,
        isLoading: true
      }));

      const summary = await loadVolunteerHomeSummary({
        organizationId: currentOrganizationId,
        templeId: currentTempleId,
        unknownBarcodes,
        visibility
      });

      if (!isActive) {
        return;
      }

      setState({
        isLoading: false,
        ...summary
      });
    }

    void load();

    return () => {
      isActive = false;
    };
  }, [
    availability.status,
    integration?.services,
    organizationId,
    permissions.canReadInventory,
    refreshIndex,
    templeId
  ]);

  return {
    ...state,
    refresh
  };
}
