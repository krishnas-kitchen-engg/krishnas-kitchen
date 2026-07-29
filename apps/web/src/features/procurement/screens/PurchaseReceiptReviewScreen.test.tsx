import assert from "node:assert/strict";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@krishnas-kitchen/types";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, it } from "vitest";

import { AuthContext } from "@/features/auth/providers/AuthContext";
import type { AuthContextValue } from "@/features/auth/providers/AuthContext";

import { PurchaseReceiptReviewScreen } from "./PurchaseReceiptReviewScreen";

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
    permissions: ["procurement.receipts.review"],
    profile: {
      authUserId: "auth-user-1",
      displayName: "Finance Reviewer",
      email: "finance@krishnas-kitchen.test",
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
      <PurchaseReceiptReviewScreen />
    </AuthContext.Provider>
  );
}

describe("PurchaseReceiptReviewScreen", () => {
  it("blocks users without receipt review permission", () => {
    const markup = renderScreen(
      createAuthValue({
        permissions: ["procurement.purchases.read_assigned"]
      })
    );

    assert.match(markup, /Receipt review unavailable/);
    assert.doesNotMatch(markup, /Finance review/);
  });

  it("renders the finance receipt review workflow for authorized users", () => {
    const markup = renderScreen(createAuthValue());

    assert.match(markup, /Finance review/);
    assert.match(markup, /Receipt review/);
    assert.match(markup, /Finance export/);
    assert.match(markup, /Export CSV/);
    assert.match(markup, /No purchase receipts have been uploaded yet/);
  });
});
