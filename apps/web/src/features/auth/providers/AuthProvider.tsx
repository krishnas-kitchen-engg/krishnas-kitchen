import { useCallback, useEffect, useMemo, useState } from "react";
import type { PropsWithChildren } from "react";

import {
  clearTemporaryVolunteerSession,
  createTemporaryVolunteerSession,
  getTemporaryVolunteerSessionTimeRemaining,
  isTemporaryVolunteerSessionExpired,
  loadTemporaryVolunteerSession,
  saveTemporaryVolunteerSession
} from "@/features/auth/lib/temporaryVolunteerSession";
import { getAuthProfileFromUser } from "@/features/auth/lib/authMetadata";
import {
  getPermissionsForRoles,
  getTemporaryVolunteerPermissions
} from "@/features/auth/lib/permissions";
import { useSupabaseAuth } from "@/shared/integrations/supabase";

import { AuthContext } from "./AuthContext";
import type { AuthStatus, StartTemporaryVolunteerInput } from "./AuthContext";

export function AuthProvider({ children }: PropsWithChildren) {
  const supabaseAuth = useSupabaseAuth();
  const [selectedTempleId, setSelectedTempleId] = useState<string | null>(null);
  const [temporaryVolunteerSession, setTemporaryVolunteerSession] = useState(() =>
    typeof window === "undefined" ? null : loadTemporaryVolunteerSession()
  );

  const profile = useMemo(
    () => (supabaseAuth.user ? getAuthProfileFromUser(supabaseAuth.user) : null),
    [supabaseAuth.user]
  );

  useEffect(() => {
    if (!profile) {
      setSelectedTempleId(null);
      return;
    }

    const hasSelectedTemple = profile.temples.some((temple) => temple.id === selectedTempleId);

    if (!hasSelectedTemple) {
      setSelectedTempleId(profile.temples[0]?.id ?? null);
    }
  }, [profile, selectedTempleId]);

  useEffect(() => {
    if (supabaseAuth.session && temporaryVolunteerSession) {
      clearTemporaryVolunteerSession();
      setTemporaryVolunteerSession(null);
    }
  }, [supabaseAuth.session, temporaryVolunteerSession]);

  useEffect(() => {
    if (!temporaryVolunteerSession) {
      return undefined;
    }

    if (isTemporaryVolunteerSessionExpired(temporaryVolunteerSession)) {
      clearTemporaryVolunteerSession();
      setTemporaryVolunteerSession(null);
      setSelectedTempleId(null);
      return undefined;
    }

    const timeout = window.setTimeout(() => {
      clearTemporaryVolunteerSession();
      setTemporaryVolunteerSession(null);
      setSelectedTempleId(null);
    }, getTemporaryVolunteerSessionTimeRemaining(temporaryVolunteerSession));

    return () => {
      window.clearTimeout(timeout);
    };
  }, [temporaryVolunteerSession]);

  const currentTemple = useMemo(() => {
    if (temporaryVolunteerSession) {
      return {
        id: temporaryVolunteerSession.templeId,
        name: "Selected temple",
        organizationId: temporaryVolunteerSession.organizationId
      };
    }

    return profile?.temples.find((temple) => temple.id === selectedTempleId) ?? null;
  }, [profile, selectedTempleId, temporaryVolunteerSession]);

  const currentOrganization = useMemo(() => {
    if (temporaryVolunteerSession) {
      return {
        id: temporaryVolunteerSession.organizationId,
        name: "Temporary volunteer organization"
      };
    }

    return profile?.organization ?? null;
  }, [profile, temporaryVolunteerSession]);

  const roles = useMemo(
    () => (temporaryVolunteerSession ? [] : (profile?.roles ?? [])),
    [profile?.roles, temporaryVolunteerSession]
  );

  const permissions = useMemo(
    () =>
      temporaryVolunteerSession
        ? getTemporaryVolunteerPermissions()
        : getPermissionsForRoles(roles),
    [roles, temporaryVolunteerSession]
  );

  const signInWithEmail = useCallback(
    async (email: string, password: string) => {
      if (!supabaseAuth.client) {
        throw new Error("Supabase is not configured.");
      }

      const { error } = await supabaseAuth.client.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw error;
      }
    },
    [supabaseAuth.client]
  );

  const signOut = useCallback(async () => {
    clearTemporaryVolunteerSession();
    setTemporaryVolunteerSession(null);

    if (supabaseAuth.client && supabaseAuth.session) {
      await supabaseAuth.client.auth.signOut();
    }
  }, [supabaseAuth.client, supabaseAuth.session]);

  const startTemporaryVolunteerSession = useCallback((input: StartTemporaryVolunteerInput) => {
    const session = createTemporaryVolunteerSession(input);

    saveTemporaryVolunteerSession(session);
    setTemporaryVolunteerSession(session);
    setSelectedTempleId(session.templeId);
  }, []);

  const selectTemple = useCallback((templeId: string) => {
    setSelectedTempleId(templeId);
  }, []);

  const status = useMemo<AuthStatus>(() => {
    if (supabaseAuth.isLoading) {
      return "loading";
    }

    if (supabaseAuth.session) {
      return "authenticated";
    }

    if (temporaryVolunteerSession) {
      return "temporary";
    }

    return "unauthenticated";
  }, [supabaseAuth.isLoading, supabaseAuth.session, temporaryVolunteerSession]);

  const value = useMemo(
    () => ({
      client: supabaseAuth.client,
      currentOrganization,
      currentTemple,
      isAuthenticated: status === "authenticated" || status === "temporary",
      isConfigured: supabaseAuth.isConfigured,
      isLoading: status === "loading",
      isTemporaryVolunteer: status === "temporary",
      permissions,
      profile,
      roles,
      selectTemple,
      session: supabaseAuth.session,
      signInWithEmail,
      signOut,
      startTemporaryVolunteerSession,
      status,
      temporaryVolunteerSession
    }),
    [
      currentOrganization,
      currentTemple,
      permissions,
      profile,
      roles,
      selectTemple,
      signInWithEmail,
      signOut,
      startTemporaryVolunteerSession,
      status,
      supabaseAuth.client,
      supabaseAuth.isConfigured,
      supabaseAuth.session,
      temporaryVolunteerSession
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
