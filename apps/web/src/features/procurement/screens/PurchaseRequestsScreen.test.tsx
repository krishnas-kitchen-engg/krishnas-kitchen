import assert from "node:assert/strict";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@krishnas-kitchen/types";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, it } from "vitest";

import { AuthContext } from "@/features/auth/providers/AuthContext";
import type { AuthContextValue } from "@/features/auth/providers/AuthContext";

import { PurchaseRequestsScreen } from "./PurchaseRequestsScreen";

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
    permissions: ["procurement.requests.create", "procurement.requests.read_own"],
    profile: {
      authUserId: "auth-user-1",
      displayName: "Staff User",
      email: "staff@krishnas-kitchen.test",
      id: "user-1",
      organization: {
        id: "org-1",
        name: "Krishna's Kitchen"
      },
      roles: ["volunteer"],
      temples: [
        {
          id: "temple-1",
          name: "Main Temple",
          organizationId: "org-1"
        }
      ]
    },
    roles: ["volunteer"],
    selectTemple() {},
    session: null,
    signInWithEmail() {
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
      <PurchaseRequestsScreen />
    </AuthContext.Provider>
  );
}

describe("PurchaseRequestsScreen", () => {
  it("blocks users without purchase request permission", () => {
    const markup = renderScreen(
      createAuthValue({
        permissions: ["inventory.read"]
      })
    );

    assert.match(markup, /Purchase requests unavailable/);
    assert.doesNotMatch(markup, /Request items to buy/);
  });

  it("renders existing-item and new-item request options for authorized users", () => {
    const markup = renderScreen(createAuthValue());

    assert.match(markup, /Request items to buy/);
    assert.match(markup, /Existing item/);
    assert.match(markup, /Suggest new/);
    assert.match(markup, /My requests/);
  });
});
