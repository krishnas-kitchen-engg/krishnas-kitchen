import assert from "node:assert/strict";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@krishnas-kitchen/types";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, it } from "vitest";

import { AuthContext } from "@/features/auth/providers/AuthContext";
import type { AuthContextValue } from "@/features/auth/providers/AuthContext";

import { ProcurementAdminSetupScreen } from "./ProcurementAdminSetupScreen";

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
    permissions: ["procurement.admin", "items.read"],
    profile: {
      authUserId: "auth-user-1",
      displayName: "Demo Manager",
      email: "demo.manager@krishnas-kitchen.test",
      id: "user-1",
      organization: {
        id: "org-1",
        name: "Krishna's Kitchen"
      },
      roles: ["inventory_manager"],
      temples: [
        {
          id: "temple-1",
          name: "Main Temple",
          organizationId: "org-1"
        }
      ]
    },
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
      <ProcurementAdminSetupScreen />
    </AuthContext.Provider>
  );
}

describe("ProcurementAdminSetupScreen", () => {
  it("blocks users without procurement administration permission", () => {
    const markup = renderScreen(
      createAuthValue({
        permissions: ["inventory.read"]
      })
    );

    assert.match(markup, /Procurement setup unavailable/);
    assert.doesNotMatch(markup, /Purchase setup/);
  });

  it("renders purchase location and item preference setup for authorized admins", () => {
    const markup = renderScreen(createAuthValue());

    assert.match(markup, /Purchase setup/);
    assert.match(markup, /Add store or supplier/);
    assert.match(markup, /Tag item to purchase source/);
    assert.match(markup, /Minimum order quantity/);
    assert.match(markup, /No purchase locations are configured yet/);
  });
});
