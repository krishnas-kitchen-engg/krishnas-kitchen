import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@krishnas-kitchen/types";
import { describe, it } from "vitest";

import { AuthContext } from "@/features/auth/providers/AuthContext";
import type { AuthContextValue } from "@/features/auth/providers/AuthContext";

import { LocationManagementScreen } from "./LocationManagementScreen";

function createAuthValue(overrides: Partial<AuthContextValue> = {}): AuthContextValue {
  return {
    client: {} as SupabaseClient<Database>,
    currentOrganization: {
      id: "org-1",
      name: "Krishna's Kitchen"
    },
    currentTemple: {
      id: "temple-1",
      name: "Main Temple",
      organizationId: "org-1"
    },
    isAuthenticated: true,
    isConfigured: true,
    isLoading: false,
    isTemporaryVolunteer: false,
    permissions: ["inventory.read", "locations.create", "locations.edit"],
    profile: null,
    roles: ["inventory_manager"],
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

function renderScreen(auth: AuthContextValue) {
  return renderToStaticMarkup(
    <AuthContext.Provider value={auth}>
      <LocationManagementScreen />
    </AuthContext.Provider>
  );
}

describe("LocationManagementScreen", () => {
  it("blocks users without location management permission", () => {
    const markup = renderScreen(
      createAuthValue({
        permissions: ["inventory.read"]
      })
    );

    assert.match(markup, /Location management unavailable/);
    assert.doesNotMatch(markup, /Manage storage areas/);
  });

  it("renders create and search controls for authorized managers", () => {
    const markup = renderScreen(createAuthValue());

    assert.match(markup, /Manage storage areas/);
    assert.match(markup, /Create location/);
    assert.match(markup, /Search locations/);
  });
});
