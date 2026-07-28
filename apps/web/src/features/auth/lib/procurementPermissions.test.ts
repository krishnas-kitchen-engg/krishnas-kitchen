import { describe, expect, it } from "vitest";

import { getPermissionsForRoles } from "./permissions";

describe("procurement permissions", () => {
  it("allows temple staff roles to create purchase requests without admin permissions", () => {
    const volunteerPermissions = getPermissionsForRoles(["volunteer"]);

    expect(volunteerPermissions).toContain("procurement.requests.create");
    expect(volunteerPermissions).toContain("procurement.requests.read_own");
    expect(volunteerPermissions).not.toContain("procurement.admin");
    expect(volunteerPermissions).not.toContain("procurement.lists.publish");
  });

  it("allows senior cooks to approve and publish procurement lists", () => {
    const seniorCookPermissions = getPermissionsForRoles(["senior_cook"]);

    expect(seniorCookPermissions).toContain("procurement.requests.review");
    expect(seniorCookPermissions).toContain("procurement.lists.manage");
    expect(seniorCookPermissions).toContain("procurement.lists.publish");
  });

  it("allows inventory managers and admins to manage procurement setup and audit", () => {
    const managerPermissions = getPermissionsForRoles(["inventory_manager"]);
    const adminPermissions = getPermissionsForRoles(["temple_admin"]);

    expect(managerPermissions).toContain("procurement.admin");
    expect(managerPermissions).toContain("procurement.audit.read");
    expect(adminPermissions).toContain("procurement.admin");
    expect(adminPermissions).toContain("procurement.audit.read");
  });
});
