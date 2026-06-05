import { createContext } from "react";

import type { InventoryServiceBundle } from "./inventoryServiceFactory";

export type InventoryIntegrationContextValue = {
  services: InventoryServiceBundle;
};

export type InventoryProviderStatus = "loading" | "ready" | "unavailable";

export type InventoryAvailabilityContextValue = {
  status: InventoryProviderStatus;
};

export const InventoryIntegrationContext = createContext<
  InventoryIntegrationContextValue | undefined
>(undefined);

export const InventoryAvailabilityContext = createContext<InventoryAvailabilityContextValue>({
  status: "unavailable"
});
