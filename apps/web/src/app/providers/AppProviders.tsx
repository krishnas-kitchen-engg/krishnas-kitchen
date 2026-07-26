import type { PropsWithChildren } from "react";

import { InventoryProviderBridge } from "@/domains/inventory";
import { RecipeProviderBridge } from "@/domains/recipes";
import { AuthProvider } from "@/features/auth";
import { SupabaseAuthProvider } from "@/shared/integrations/supabase";

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <SupabaseAuthProvider>
      <AuthProvider>
        <InventoryProviderBridge>
          <RecipeProviderBridge>{children}</RecipeProviderBridge>
        </InventoryProviderBridge>
      </AuthProvider>
    </SupabaseAuthProvider>
  );
}
