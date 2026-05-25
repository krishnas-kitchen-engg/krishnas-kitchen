import { createContext } from "react";
import type { Session, SupabaseClient, User } from "@supabase/supabase-js";
import type { Database } from "@krishnas-kitchen/types";

export type SupabaseAuthState = {
  client: SupabaseClient<Database> | null;
  isConfigured: boolean;
  isLoading: boolean;
  session: Session | null;
  user: User | null;
};

export const SupabaseAuthContext = createContext<SupabaseAuthState | undefined>(undefined);
