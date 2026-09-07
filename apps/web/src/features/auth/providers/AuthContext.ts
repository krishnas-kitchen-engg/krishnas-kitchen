import { createContext } from "react";
import type {
  AppRole,
  AuthOrganization,
  AuthTemple,
  AuthUserProfile,
  Permission,
  TemporaryVolunteerSession
} from "@krishnas-kitchen/types";
import type { Session, SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@krishnas-kitchen/types";

export type AuthStatus = "loading" | "unauthenticated" | "authenticated" | "temporary";

export type StartTemporaryVolunteerInput = {
  displayName: string;
  joinCode: string;
};

export type SignUpWithEmailInput = {
  displayName: string;
  email: string;
  password: string;
  organizationId: string;
  templeId: string;
};

export type AuthContextValue = {
  client: SupabaseClient<Database> | null;
  currentOrganization: AuthOrganization | null;
  currentTemple: AuthTemple | null;
  isAuthenticated: boolean;
  isConfigured: boolean;
  isLoading: boolean;
  isTemporaryVolunteer: boolean;
  permissions: Permission[];
  profile: AuthUserProfile | null;
  roles: AppRole[];
  selectTemple: (templeId: string) => void;
  session: Session | null;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (input: SignUpWithEmailInput) => Promise<void>;
  signOut: () => Promise<void>;
  startTemporaryVolunteerSession: (input: StartTemporaryVolunteerInput) => Promise<void>;
  status: AuthStatus;
  temporaryVolunteerSession: TemporaryVolunteerSession | null;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
