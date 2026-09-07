import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@krishnas-kitchen/types";
import { describe, it, vi } from "vitest";

import { AuthContext } from "@/features/auth/providers/AuthContext";
import type { AuthContextValue } from "@/features/auth/providers/AuthContext";

import { LoginScreen } from "./LoginScreen";

function createAuthValue(overrides: Partial<AuthContextValue> = {}): AuthContextValue {
  return {
    client: {} as SupabaseClient<Database>,
    currentOrganization: null,
    currentTemple: null,
    isAuthenticated: false,
    isConfigured: true,
    isLoading: false,
    isTemporaryVolunteer: false,
    permissions: [],
    profile: null,
    roles: [],
    selectTemple() {},
    session: null,
    signInWithEmail() {
      return Promise.resolve();
    },
    signUpWithEmail() {
      return Promise.resolve();
    },
    signOut() {
      return Promise.resolve();
    },
    startTemporaryVolunteerSession() {
      return Promise.resolve();
    },
    status: "unauthenticated",
    temporaryVolunteerSession: null,
    ...overrides
  };
}

describe("LoginScreen", () => {
  it("renders simplified account access modes and password recovery", () => {
    vi.stubGlobal("window", {
      location: {
        pathname: "/"
      }
    });

    const markup = renderToStaticMarkup(
      <AuthContext.Provider value={createAuthValue()}>
        <LoginScreen />
      </AuthContext.Provider>
    );

    assert.match(markup, /Account access/);
    assert.match(markup, /Request access/);
    assert.match(markup, /Volunteer/);
    assert.match(markup, /Forgot password/);
    assert.match(markup, /Show password/);
    assert.doesNotMatch(markup, /Organization ID/);
    assert.doesNotMatch(markup, /Temple ID/);
  });
});
