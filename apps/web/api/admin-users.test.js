import { describe, expect, it } from "vitest";

import { getExistingAuthUserOrganizationConflict } from "./admin-users.js";

describe("existing Auth user organization safety", () => {
  it("allows an unassigned legacy registration to be linked", () => {
    expect(
      getExistingAuthUserOrganizationConflict(
        { app_metadata: {}, user_metadata: { display_name: "Legacy User" } },
        "org-1"
      )
    ).toBeNull();
  });

  it("allows a pending registration for the same organization", () => {
    expect(
      getExistingAuthUserOrganizationConflict(
        { app_metadata: {}, user_metadata: { requested_organization_id: "org-1" } },
        "org-1"
      )
    ).toBeNull();
  });

  it("rejects an Auth account assigned to another organization", () => {
    expect(
      getExistingAuthUserOrganizationConflict(
        { app_metadata: { organization_id: "org-2" }, user_metadata: {} },
        "org-1"
      )
    ).toMatch(/another organization/i);
  });

  it("rejects a request routed to another organization", () => {
    expect(
      getExistingAuthUserOrganizationConflict(
        { app_metadata: {}, user_metadata: { requested_organization_id: "org-2" } },
        "org-1"
      )
    ).toMatch(/another organization/i);
  });
});
