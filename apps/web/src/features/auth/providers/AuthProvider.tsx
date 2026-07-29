import { useCallback, useEffect, useMemo, useState } from "react";
import type { PropsWithChildren } from "react";
import type { TemporaryVolunteerSession } from "@krishnas-kitchen/types";

import {
  getTemporaryVolunteerSessionTimeRemaining,
  isTemporaryVolunteerSessionExpired
} from "@/features/auth/lib/temporaryVolunteerSession";
import {
  completeVolunteerLogout,
  restoreVolunteerSession,
  validateVolunteerLogin
} from "@/features/auth/application/volunteerSessionAuth";
import { getAuthProfileFromUser } from "@/features/auth/lib/authMetadata";
import {
  getPermissionsForRoles,
  getTemporaryVolunteerPermissions
} from "@/features/auth/lib/permissions";
import {
  clearStoredVolunteerSession,
  createStoredVolunteerSessionValidationInput,
  loadStoredVolunteerSession,
  saveStoredVolunteerSession
} from "@/features/auth/lib/volunteerSessionStorage";
import { createSupabaseVolunteerSessionRepository } from "@/features/auth/infrastructure/supabase/supabaseVolunteerSessionRepository";
import { useSupabaseAuth } from "@/shared/integrations/supabase";
import { createUuid } from "@/shared/lib/uuid";

import { AuthContext } from "./AuthContext";
import type { AuthStatus, StartTemporaryVolunteerInput } from "./AuthContext";

export function AuthProvider({ children }: PropsWithChildren) {
  const supabaseAuth = useSupabaseAuth();
  const [selectedTempleId, setSelectedTempleId] = useState<string | null>(null);
  const [temporaryVolunteerSession, setTemporaryVolunteerSession] =
    useState<TemporaryVolunteerSession | null>(null);
  const [isRestoringTemporarySession, setIsRestoringTemporarySession] = useState(false);

  const volunteerSessionRepository = useMemo(
    () =>
      supabaseAuth.client ? createSupabaseVolunteerSessionRepository(supabaseAuth.client) : null,
    [supabaseAuth.client]
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
      clearStoredVolunteerSession();
      setTemporaryVolunteerSession(null);
    }
  }, [supabaseAuth.session, temporaryVolunteerSession]);

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      supabaseAuth.isLoading ||
      supabaseAuth.session ||
      temporaryVolunteerSession ||
      !volunteerSessionRepository
    ) {
      return undefined;
    }

    const storedSession = loadStoredVolunteerSession();

    if (!storedSession) {
      return undefined;
    }

    let cancelled = false;
    setIsRestoringTemporarySession(true);

    void volunteerSessionRepository;
    restoreVolunteerSession(
      volunteerSessionRepository,
      createStoredVolunteerSessionValidationInput(storedSession, new Date().toISOString())
    )
      .then((authSession) => {
        if (cancelled) {
          return;
        }

        if (!authSession) {
          clearStoredVolunteerSession();
          setTemporaryVolunteerSession(null);
          return;
        }

        saveStoredVolunteerSession(authSession.storedReference);
        setTemporaryVolunteerSession(authSession.temporarySession);
        setSelectedTempleId(authSession.temporarySession.templeId);
      })
      .catch(() => {
        if (!cancelled) {
          clearStoredVolunteerSession();
          setTemporaryVolunteerSession(null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsRestoringTemporarySession(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [
    supabaseAuth.isLoading,
    supabaseAuth.session,
    temporaryVolunteerSession,
    volunteerSessionRepository
  ]);

  useEffect(() => {
    if (!temporaryVolunteerSession) {
      return undefined;
    }

    if (isTemporaryVolunteerSessionExpired(temporaryVolunteerSession)) {
      clearStoredVolunteerSession();
      setTemporaryVolunteerSession(null);
      setSelectedTempleId(null);
      return undefined;
    }

    const timeout = window.setTimeout(() => {
      clearStoredVolunteerSession();
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

  const signUpWithEmail = useCallback(
    async (input: { displayName: string; email: string; password: string }) => {
      if (!supabaseAuth.client) {
        throw new Error("Supabase is not configured.");
      }

      const displayName = input.displayName.trim();
      const email = input.email.trim();

      if (!displayName) {
        throw new Error("Display name is required.");
      }

      if (!email) {
        throw new Error("Email is required.");
      }

      if (input.password.length < 8) {
        throw new Error("Password must be at least 8 characters.");
      }

      const { error } = await supabaseAuth.client.auth.signUp({
        email,
        password: input.password,
        options: {
          data: {
            display_name: displayName
          }
        }
      });

      if (error) {
        throw error;
      }
    },
    [supabaseAuth.client]
  );

  const signOut = useCallback(async () => {
    const signOutAuthenticatedUser =
      supabaseAuth.client && supabaseAuth.session
        ? () => supabaseAuth.client!.auth.signOut().then(() => undefined)
        : null;
    const storedVolunteerSession =
      typeof window === "undefined" ? null : loadStoredVolunteerSession();

    await completeVolunteerLogout({
      clearStoredSession: clearStoredVolunteerSession,
      clearTemporarySession() {
        setTemporaryVolunteerSession(null);
      },
      repository: volunteerSessionRepository,
      ...(signOutAuthenticatedUser ? { signOutAuthenticatedUser } : {}),
      storedSession: storedVolunteerSession,
      temporarySession: temporaryVolunteerSession
    });
  }, [
    supabaseAuth.client,
    supabaseAuth.session,
    temporaryVolunteerSession,
    volunteerSessionRepository
  ]);

  const startTemporaryVolunteerSession = useCallback(
    async (input: StartTemporaryVolunteerInput) => {
      if (!volunteerSessionRepository) {
        throw new Error("Supabase is not configured.");
      }

      const clientSessionId = createUuid();
      const authSession = await validateVolunteerLogin(volunteerSessionRepository, {
        clientSessionId,
        displayName: input.displayName,
        joinCode: input.joinCode,
        now: new Date().toISOString()
      });

      if (!authSession) {
        clearStoredVolunteerSession();
        setTemporaryVolunteerSession(null);
        throw new Error("Invalid or expired volunteer join code.");
      }

      saveStoredVolunteerSession(authSession.storedReference);
      setTemporaryVolunteerSession(authSession.temporarySession);
      setSelectedTempleId(authSession.temporarySession.templeId);
    },
    [volunteerSessionRepository]
  );

  const selectTemple = useCallback((templeId: string) => {
    setSelectedTempleId(templeId);
  }, []);

  const status = useMemo<AuthStatus>(() => {
    if (supabaseAuth.isLoading) {
      return "loading";
    }

    if (isRestoringTemporarySession) {
      return "loading";
    }

    if (supabaseAuth.session) {
      return "authenticated";
    }

    if (temporaryVolunteerSession) {
      return "temporary";
    }

    return "unauthenticated";
  }, [
    isRestoringTemporarySession,
    supabaseAuth.isLoading,
    supabaseAuth.session,
    temporaryVolunteerSession
  ]);

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
      signUpWithEmail,
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
      signUpWithEmail,
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
