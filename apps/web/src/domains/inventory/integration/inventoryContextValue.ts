import { createContext } from "react";

import type { InventoryServiceBundle } from "./inventoryServiceFactory";

export type InventoryIntegrationContextValue = {
  services: InventoryServiceBundle;
};

export const InventoryIntegrationContext = createContext<
  InventoryIntegrationContextValue | undefined
>(undefined);
