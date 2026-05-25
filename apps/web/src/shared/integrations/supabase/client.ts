import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@krishnas-kitchen/types";

import { env } from "@/shared/config/env";

let browserClient: SupabaseClient<Database> | undefined;

export function createSupabaseBrowserClient(): SupabaseClient<Database> {
  if (!env.supabaseUrl || !env.supabaseAnonKey) {
    throw new Error("Supabase environment variables are not configured.");
  }

  return createClient<Database>(env.supabaseUrl, env.supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      detectSessionInUrl: true,
      persistSession: true
    }
  });
}

export function getSupabaseBrowserClient(): SupabaseClient<Database> | null {
  if (!env.isSupabaseConfigured) {
    return null;
  }

  browserClient ??= createSupabaseBrowserClient();

  return browserClient;
}
