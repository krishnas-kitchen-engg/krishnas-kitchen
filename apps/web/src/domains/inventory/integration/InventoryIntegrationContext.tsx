import type { PropsWithChildren } from "react";

import { InventoryIntegrationContext } from "./inventoryContextValue";
import type { InventoryIntegrationContextValue } from "./inventoryContextValue";

export function InventoryIntegrationProvider({
  children,
  services
}: PropsWithChildren<InventoryIntegrationContextValue>) {
  return (
    <InventoryIntegrationContext.Provider value={{ services }}>
      {children}
    </InventoryIntegrationContext.Provider>
  );
}
