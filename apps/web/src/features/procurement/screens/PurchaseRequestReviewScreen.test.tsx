import assert from "node:assert/strict";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@krishnas-kitchen/types";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, it } from "vitest";

import { AuthContext } from "@/features/auth/providers/AuthContext";
import type { AuthContextValue } from "@/features/auth/providers/AuthContext";

import { PurchaseRequestReviewScreen } from "./PurchaseRequestReviewScreen";

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
    permissions: ["procurement.requests.review"],
    profile: {
      authUserId: "auth-user-1",
      displayName: "Approver User",
      email: "approver@krishnas-kitchen.test",
      id: "user-1",
      organization: {
        id: "org-1",
        name: "Krishna's Kitchen"
      },
      roles: ["senior_cook"],
      temples: [
        {
          id: "temple-1",
          name: "Main Temple",
          organizationId: "org-1"
        }
      ]
    },
    roles: ["senior_cook"],
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
      <PurchaseRequestReviewScreen />
    </AuthContext.Provider>
  );
}

describe("PurchaseRequestReviewScreen", () => {
  it("blocks users without review permission", () => {
    const markup = renderScreen(
      createAuthValue({
        permissions: ["procurement.requests.create"]
      })
    );

    assert.match(markup, /Request review unavailable/);
    assert.doesNotMatch(markup, /Review purchase requests/);
  });

  it("renders review workflow for authorized users", () => {
    const markup = renderScreen(createAuthValue());

    assert.match(markup, /Review purchase requests/);
    assert.match(markup, /Approver view/);
    assert.match(markup, /Add to queue/);
    assert.match(markup, /Add approved request/);
    assert.match(markup, /Manual/);
    assert.match(markup, /Scheduled/);
    assert.match(markup, /No purchase requests are waiting for review/);
  });
});
