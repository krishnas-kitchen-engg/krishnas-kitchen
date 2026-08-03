import assert from "node:assert/strict";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@krishnas-kitchen/types";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, it } from "vitest";

import { AuthContext } from "@/features/auth/providers/AuthContext";
import type { AuthContextValue } from "@/features/auth/providers/AuthContext";

import { AdminManagementScreen } from "./AdminManagementScreen";

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
    permissions: ["users.manage", "temple.manage", "roles.manage"],
    profile: {
      authUserId: "admin-user-1",
      displayName: "Admin User",
      email: "admin@example.com",
      id: "admin-user-1",
      organization: {
        id: "org-1",
        name: "Krishna's Kitchen"
      },
      roles: ["super_admin"],
      temples: [
        {
          id: "temple-1",
          name: "Main Temple",
          organizationId: "org-1"
        }
      ]
    },
    roles: ["super_admin"],
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
      <AdminManagementScreen />
    </AuthContext.Provider>
  );
}

describe("AdminManagementScreen", () => {
  it("blocks users without administration permissions", () => {
    const markup = renderScreen(
      createAuthValue({
        permissions: ["inventory.read"],
        roles: ["volunteer"]
      })
    );

    assert.match(markup, /Admin unavailable/);
    assert.doesNotMatch(markup, /Users and temples/);
  });

  it("renders temple, user, and role administration for authorized admins", () => {
    const markup = renderScreen(createAuthValue());

    assert.match(markup, /Users and temples/);
    assert.match(markup, /Create temple/);
    assert.match(markup, /Create login account/);
    assert.match(markup, /Grant access/);
    assert.match(markup, /Temporary password/);
    assert.doesNotMatch(markup, /Supabase Auth User UID/);
  });

  it("offers every app role for admin assignment", () => {
    const markup = renderScreen(createAuthValue());

    for (const roleLabel of [
      "Volunteer",
      "Cook",
      "Senior Cook",
      "Inventory Manager",
      "Temple Admin",
      "Super Admin"
    ]) {
      assert.match(markup, new RegExp(roleLabel));
    }
  });
});
