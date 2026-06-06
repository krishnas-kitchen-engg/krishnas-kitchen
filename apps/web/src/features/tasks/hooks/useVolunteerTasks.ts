import { useContext, useEffect, useMemo, useState } from "react";

import type {
  InventoryLowStockAlert,
  InventoryVisibilityService,
  UnknownBarcodeManagementService,
  UnknownBarcodeRecord
} from "@/domains/inventory";
import { useInventoryPermissions } from "@/domains/inventory";
import {
  InventoryAvailabilityContext,
  InventoryIntegrationContext
} from "@/domains/inventory/integration/inventoryContextValue";
import { useAuth } from "@/features/auth";

import type {
  LowStockReviewTask,
  UnknownBarcodeReviewTask,
  VolunteerTask,
  VolunteerTaskCategory,
  VolunteerTaskSection,
  VolunteerTasksState
} from "../types/taskTypes";

const taskLimit = 25;

function emptySection<T extends VolunteerTask>(): VolunteerTaskSection<T> {
  return {
    error: null,
    items: [],
    status: "loaded"
  };
}

export const initialVolunteerTasksState: VolunteerTasksState = {
  isLoading: false,
  lowStock: emptySection(),
  selectedCategory: "all",
  unknownBarcodes: emptySection()
};

function toLoadedSection<T extends VolunteerTask>(items: readonly T[]): VolunteerTaskSection<T> {
  return {
    error: null,
    items,
    status: "loaded"
  };
}

function toUnavailableSection<T extends VolunteerTask>(error: unknown): VolunteerTaskSection<T> {
  return {
    error:
      typeof error === "string"
        ? error
        : error instanceof Error
          ? error.message
          : "Tasks are unavailable.",
    items: [],
    status: "unavailable"
  };
}

export function projectUnknownBarcodeTasks(
  records: readonly UnknownBarcodeRecord[]
): UnknownBarcodeReviewTask[] {
  return records.map((record) => ({
    barcodeLabel: `${record.barcode.format}: ${record.barcode.value}`,
    category: "unknown_barcode",
    description: `Seen ${record.scanCount} time${record.scanCount === 1 ? "" : "s"}. Review and link when the item is known.`,
    id: `unknown-barcode:${record.id}`,
    priority: "attention",
    scanCount: record.scanCount,
    ...(record.templeId ? { templeId: record.templeId } : {}),
    title: "Review unknown barcode",
    unknownBarcodeId: record.id
  }));
}

export function projectLowStockTasks(
  alerts: readonly InventoryLowStockAlert[]
): LowStockReviewTask[] {
  return alerts.map((alert) => ({
    category: "low_stock",
    currentQuantity: alert.currentQuantity,
    description: `${alert.currentQuantity} ${alert.unit} available; minimum is ${alert.minimumQuantity} ${alert.unit}.`,
    id: `low-stock:${alert.itemId}:${alert.locationId ?? "temple"}:${alert.unit}`,
    itemId: alert.itemId,
    ...(alert.locationId ? { locationId: alert.locationId } : {}),
    minimumQuantity: alert.minimumQuantity,
    priority: "attention",
    ...(alert.templeId ? { templeId: alert.templeId } : {}),
    title: "Review low stock",
    unit: alert.unit
  }));
}

export async function loadVolunteerTasks(input: {
  organizationId: string;
  templeId: string;
  unknownBarcodes: UnknownBarcodeManagementService;
  visibility: InventoryVisibilityService;
}): Promise<Pick<VolunteerTasksState, "lowStock" | "unknownBarcodes">> {
  const [unknownBarcodeResult, lowStockResult] = await Promise.allSettled([
    input.unknownBarcodes.listPendingUnknownBarcodes({
      limit: taskLimit,
      organizationId: input.organizationId,
      templeId: input.templeId
    }),
    input.visibility.getLowStockAlerts(
      {
        organizationId: input.organizationId,
        templeId: input.templeId
      },
      []
    )
  ]);

  return {
    lowStock:
      lowStockResult.status === "fulfilled"
        ? toLoadedSection(projectLowStockTasks(lowStockResult.value))
        : toUnavailableSection(lowStockResult.reason),
    unknownBarcodes:
      unknownBarcodeResult.status === "fulfilled"
        ? toLoadedSection(projectUnknownBarcodeTasks(unknownBarcodeResult.value))
        : toUnavailableSection(unknownBarcodeResult.reason)
  };
}

function filterTasks(
  tasks: readonly VolunteerTask[],
  selectedCategory: VolunteerTaskCategory
): VolunteerTask[] {
  if (selectedCategory === "all") {
    return [...tasks];
  }

  return tasks.filter((task) => task.category === selectedCategory);
}

export function useVolunteerTasks(): VolunteerTasksState & {
  allTasks: readonly VolunteerTask[];
  canReadTasks: boolean;
  filteredTasks: readonly VolunteerTask[];
  setSelectedCategory: (category: VolunteerTaskCategory) => void;
} {
  const auth = useAuth();
  const permissions = useInventoryPermissions();
  const availability = useContext(InventoryAvailabilityContext);
  const integration = useContext(InventoryIntegrationContext);
  const organizationId = auth.currentOrganization?.id;
  const templeId = auth.currentTemple?.id;
  const [state, setState] = useState<VolunteerTasksState>(initialVolunteerTasksState);

  useEffect(() => {
    if (!permissions.canReadInventory || !organizationId || !templeId) {
      setState(initialVolunteerTasksState);
      return;
    }

    if (availability.status !== "ready" || !integration?.services) {
      setState((currentState) => ({
        ...currentState,
        isLoading: false,
        lowStock: toUnavailableSection("Inventory services are unavailable."),
        unknownBarcodes: toUnavailableSection("Inventory services are unavailable.")
      }));
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

      const tasks = await loadVolunteerTasks({
        organizationId: currentOrganizationId,
        templeId: currentTempleId,
        unknownBarcodes,
        visibility
      });

      if (!isActive) {
        return;
      }

      setState((currentState) => ({
        ...currentState,
        isLoading: false,
        ...tasks
      }));
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
    templeId
  ]);

  const allTasks = useMemo(
    () => [...state.unknownBarcodes.items, ...state.lowStock.items],
    [state.lowStock.items, state.unknownBarcodes.items]
  );
  const filteredTasks = useMemo(
    () => filterTasks(allTasks, state.selectedCategory),
    [allTasks, state.selectedCategory]
  );

  return {
    ...state,
    allTasks,
    canReadTasks: permissions.canReadInventory,
    filteredTasks,
    setSelectedCategory(category) {
      setState((currentState) => ({
        ...currentState,
        selectedCategory: category
      }));
    }
  };
}
