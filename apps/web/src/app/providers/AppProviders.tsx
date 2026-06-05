import type { PropsWithChildren } from "react";

import { InventoryProviderBridge } from "@/domains/inventory";
import { AuthProvider } from "@/features/auth";
import { SupabaseAuthProvider } from "@/shared/integrations/supabase";

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <SupabaseAuthProvider>
      <AuthProvider>
        <InventoryProviderBridge>{children}</InventoryProviderBridge>
      </AuthProvider>
    </SupabaseAuthProvider>
  );
}
