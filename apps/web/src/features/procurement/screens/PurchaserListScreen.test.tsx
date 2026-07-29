import assert from "node:assert/strict";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@krishnas-kitchen/types";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, it } from "vitest";

import { AuthContext } from "@/features/auth/providers/AuthContext";
import type { AuthContextValue } from "@/features/auth/providers/AuthContext";

import { PurchaserListScreen } from "./PurchaserListScreen";

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
    permissions: ["procurement.purchases.read_assigned", "procurement.purchases.update_assigned"],
    profile: {
      authUserId: "auth-user-1",
      displayName: "Purchaser User",
      email: "purchaser@krishnas-kitchen.test",
      id: "user-1",
      organization: {
        id: "org-1",
        name: "Krishna's Kitchen"
      },
      roles: ["cook"],
      temples: [
        {
          id: "temple-1",
          name: "Main Temple",
          organizationId: "org-1"
        }
      ]
    },
    roles: ["cook"],
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
      <PurchaserListScreen />
    </AuthContext.Provider>
  );
}

describe("PurchaserListScreen", () => {
  it("blocks users without purchaser list permission", () => {
    const markup = renderScreen(
      createAuthValue({
        permissions: ["procurement.requests.create"]
      })
    );

    assert.match(markup, /Purchaser list unavailable/);
    assert.doesNotMatch(markup, /My purchase list/);
  });

  it("renders the purchaser workflow for assigned purchasers", () => {
    const markup = renderScreen(createAuthValue());

    assert.match(markup, /My purchase list/);
    assert.match(markup, /Purchaser view/);
    assert.match(markup, /No purchases are assigned to you yet/);
  });
});
