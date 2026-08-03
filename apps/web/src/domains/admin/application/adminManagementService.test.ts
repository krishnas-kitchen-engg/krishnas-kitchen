import assert from "node:assert/strict";
import { describe, it } from "vitest";

import {
  createAdminManagementService,
  type AdminManagementRepository
} from "./adminManagementService";

function createRepository(): AdminManagementRepository {
  return {
    assignRole(input) {
      return Promise.resolve({
        createdAt: "2026-08-02T00:00:00.000Z",
        id: "role-1",
        organizationId: input.organizationId,
        role: input.role,
        templeId: input.templeId,
        userId: input.userId
      });
    },
    createTemple(input) {
      return Promise.resolve({
        createdAt: "2026-08-02T00:00:00.000Z",
        deletedAt: null,
        id: "temple-1",
        name: input.name,
        organizationId: input.organizationId,
        updatedAt: "2026-08-02T00:00:00.000Z"
      });
    },
    listState() {
      return Promise.resolve({
        roles: [],
        temples: [],
        users: []
      });
    },
    refreshOrganizationAppMetadata() {
      return Promise.resolve();
    },
    refreshUserAppMetadata() {
      return Promise.resolve();
    },
    removeRole() {
      return Promise.resolve();
    },
    setTempleArchived(input) {
      return Promise.resolve({
        createdAt: "2026-08-02T00:00:00.000Z",
        deletedAt: input.archivedAt,
        id: input.id,
        name: "Main Temple",
        organizationId: input.organizationId,
        updatedAt: "2026-08-02T00:00:00.000Z"
      });
    },
    setUserArchived(input) {
      return Promise.resolve({
        createdAt: "2026-08-02T00:00:00.000Z",
        deletedAt: input.archivedAt,
        email: "user@example.com",
        fullName: "Demo User",
        id: input.userId,
        organizationId: input.organizationId,
        updatedAt: "2026-08-02T00:00:00.000Z"
      });
    },
    updateTemple(input) {
      return Promise.resolve({
        createdAt: "2026-08-02T00:00:00.000Z",
        deletedAt: null,
        id: input.id,
        name: input.name,
        organizationId: input.organizationId,
        updatedAt: "2026-08-02T00:00:00.000Z"
      });
    },
    upsertUser(input) {
      return Promise.resolve({
        createdAt: "2026-08-02T00:00:00.000Z",
        deletedAt: null,
        email: input.email,
        fullName: input.fullName,
        id: input.userId,
        organizationId: input.organizationId,
        updatedAt: "2026-08-02T00:00:00.000Z"
      });
    }
  };
}

const scope = {
  actorUserId: "admin-user-1",
  organizationId: "org-1"
};

describe("adminManagementService", () => {
  it("normalizes temple names before persistence", async () => {
    const service = createAdminManagementService(createRepository());

    const temple = await service.createTemple({
      ...scope,
      name: "  ISKCON   Sammamish  "
    });

    assert.equal(temple.name, "ISKCON Sammamish");
  });

  it("normalizes user profile fields and refreshes auth metadata", async () => {
    const events: string[] = [];
    const repository = createRepository();
    repository.upsertUser = (input) => {
      events.push(`upsert:${input.email}:${input.fullName}`);

      return Promise.resolve({
        createdAt: "2026-08-02T00:00:00.000Z",
        deletedAt: null,
        email: input.email,
        fullName: input.fullName,
        id: input.userId,
        organizationId: input.organizationId,
        updatedAt: "2026-08-02T00:00:00.000Z"
      });
    };
    repository.refreshUserAppMetadata = () => {
      events.push("refresh");
      return Promise.resolve();
    };
    const service = createAdminManagementService(repository);

    await service.upsertUser({
      ...scope,
      email: "  USER@EXAMPLE.COM ",
      fullName: "  Demo   User ",
      userId: "user-1"
    });

    assert.deepEqual(events, ["upsert:user@example.com:Demo User", "refresh"]);
  });

  it("requires super admin roles to be organization-scoped", () => {
    const service = createAdminManagementService(createRepository());

    assert.throws(
      () =>
        service.assignRole({
          ...scope,
          role: "super_admin",
          templeId: "temple-1",
          userId: "user-1"
        }),
      /Super admin must be assigned at the organization level/
    );
  });

  it("prevents archiving the current admin profile", () => {
    const service = createAdminManagementService(createRepository());

    assert.throws(
      () =>
        service.setUserArchived({
          ...scope,
          archivedAt: "2026-08-02T00:00:00.000Z",
          userId: scope.actorUserId
        }),
      /cannot archive your own admin profile/i
    );
  });
});
