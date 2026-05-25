import { useEffect, useMemo, useState } from "react";
import type { PropsWithChildren } from "react";
import type { Session } from "@supabase/supabase-js";

import { getSupabaseBrowserClient } from "@/shared/integrations/supabase/client";

import { SupabaseAuthContext } from "./SupabaseAuthContext";

export function SupabaseAuthProvider({ children }: PropsWithChildren) {
  const client = useMemo(() => getSupabaseBrowserClient(), []);
  const [isLoading, setIsLoading] = useState(Boolean(client));
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    if (!client) {
      return undefined;
    }

    let isMounted = true;

    void client.auth.getSession().then(({ data }) => {
      if (isMounted) {
        setSession(data.session);
        setIsLoading(false);
      }
    });

    const {
      data: { subscription }
    } = client.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [client]);

  const value = useMemo(
    () => ({
      client,
      isConfigured: Boolean(client),
      isLoading,
      session,
      user: session?.user ?? null
    }),
    [client, isLoading, session]
  );

  return <SupabaseAuthContext.Provider value={value}>{children}</SupabaseAuthContext.Provider>;
}
