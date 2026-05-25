import type { PropsWithChildren } from "react";

import { SupabaseAuthProvider } from "@/shared/integrations/supabase";

export function AppProviders({ children }: PropsWithChildren) {
  return <SupabaseAuthProvider>{children}</SupabaseAuthProvider>;
}
