import { useContext } from "react";

import { InventoryIntegrationContext } from "./inventoryContextValue";
import type { InventoryServiceBundle } from "./inventoryServiceFactory";

export function useInventoryServices(): InventoryServiceBundle {
  const context = useContext(InventoryIntegrationContext);

  if (!context) {
    throw new Error("useInventoryServices must be used inside InventoryIntegrationProvider.");
  }

  return context.services;
}
