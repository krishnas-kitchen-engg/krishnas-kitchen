import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@krishnas-kitchen/types";
import { describe, it, vi } from "vitest";

import { AuthContext } from "@/features/auth/providers/AuthContext";
import type { AuthContextValue } from "@/features/auth/providers/AuthContext";

import { MobileAppShell } from "./MobileAppShell";

function createAuthValue(): AuthContextValue {
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
    permissions: ["inventory.read"],
    profile: null,
    roles: ["volunteer"],
    selectTemple() {},
    session: null,
    signInWithEmail() {
      return Promise.resolve();
    },
    signOut() {
      return Promise.resolve();
    },
    startTemporaryVolunteerSession() {},
    status: "authenticated",
    temporaryVolunteerSession: null
  };
}

describe("MobileAppShell", () => {
  it("renders top bar, content, and bottom navigation", () => {
    vi.stubGlobal("window", {
      addEventListener() {},
      location: {
        pathname: "/"
      },
      removeEventListener() {}
    });

    const markup = renderToStaticMarkup(
      <AuthContext.Provider value={createAuthValue()}>
        <MobileAppShell>
          <p>Shell content</p>
        </MobileAppShell>
      </AuthContext.Provider>
    );

    assert.match(markup, /Krishna&#x27;s Kitchen/);
    assert.match(markup, /Main Temple/);
    assert.match(markup, /Shell content/);
    assert.match(markup, /Home/);
    assert.match(markup, /Inventory/);
  });
});
