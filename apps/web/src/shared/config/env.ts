import type { AppEnvironment } from "@krishnas-kitchen/types";

type ClientEnv = {
  appEnv: AppEnvironment;
  appName: string;
  appUrl: string;
  isSupabaseConfigured: boolean;
  supabaseAnonKey: string | undefined;
  supabaseUrl: string | undefined;
};

function readClientEnv(key: string): string | undefined {
  const value = (import.meta.env as Record<string, unknown>)[key];

  return typeof value === "string" && value.length > 0 ? value : undefined;
}

const rawAppEnv = readClientEnv("VITE_APP_ENV");
const supabaseAnonKey = readClientEnv("VITE_SUPABASE_ANON_KEY");
const supabaseUrl = readClientEnv("VITE_SUPABASE_URL");

export const env: ClientEnv = {
  appEnv: rawAppEnv === "production" || rawAppEnv === "staging" ? rawAppEnv : "development",
  appName: readClientEnv("VITE_APP_NAME") ?? "Krishna's Kitchen",
  appUrl: readClientEnv("VITE_APP_URL") ?? "http://localhost:5173",
  isSupabaseConfigured: Boolean(supabaseUrl && supabaseAnonKey),
  supabaseAnonKey,
  supabaseUrl
};
