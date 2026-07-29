import assert from "node:assert/strict";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@krishnas-kitchen/types";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, it, vi } from "vitest";

import { AuthContext } from "@/features/auth/providers/AuthContext";
import type { AuthContextValue } from "@/features/auth/providers/AuthContext";

import { TempleSelectionScreen } from "./TempleSelectionScreen";

function createAuthValue(overrides: Partial<AuthContextValue> = {}): AuthContextValue {
  return {
    client: {} as SupabaseClient<Database>,
    currentOrganization: null,
    currentTemple: null,
    isAuthenticated: true,
    isConfigured: true,
    isLoading: false,
    isTemporaryVolunteer: false,
    permissions: [],
    profile: {
      authUserId: "auth-user-1",
      displayName: "Pending User",
      email: "pending@krishnas-kitchen.test",
      id: "auth-user-1",
      organization: null,
      roles: [],
      temples: []
    },
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
    status: "authenticated",
    temporaryVolunteerSession: null,
    ...overrides
  };
}

describe("TempleSelectionScreen", () => {
  it("shows approval-pending guidance for authenticated users without assignments", () => {
    vi.stubGlobal("window", {
      location: {
        pathname: "/select-temple"
      }
    });

    const markup = renderToStaticMarkup(
      <AuthContext.Provider value={createAuthValue()}>
        <TempleSelectionScreen />
      </AuthContext.Provider>
    );

    assert.match(markup, /Approval pending/);
    assert.match(markup, /admin still needs to assign temple access and roles/);
    assert.match(markup, /No temple assignments were found/);
  });
});
