import { useContext } from "react";

import { InventoryAvailabilityContext, InventoryIntegrationContext } from "./inventoryContextValue";
import type { InventoryServiceBundle } from "./inventoryServiceFactory";
import type { InventoryAvailabilityContextValue } from "./inventoryContextValue";

export function useInventoryAvailability(): InventoryAvailabilityContextValue {
  return useContext(InventoryAvailabilityContext);
}

export function useInventoryServices(): InventoryServiceBundle {
  const context = useContext(InventoryIntegrationContext);

  if (!context) {
    throw new Error("useInventoryServices must be used inside InventoryIntegrationProvider.");
  }

  return context.services;
}
