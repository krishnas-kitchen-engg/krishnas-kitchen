import { useState } from "react";
import type { AppRole } from "@krishnas-kitchen/types";

import { navigateTo, type AppPath } from "@/app/routes/router";
import type { AdminTempleRecord, AdminUserRecord, AdminUserRoleRecord } from "@/domains/admin";

import { useAdminManagement } from "../hooks/useAdminManagement";
import { RegistrationRequestQueue } from "../components/RegistrationRequestQueue";

type AdminSection = "audit" | "people" | "requests" | "roles" | "setup" | "temples";

const adminSections = [
  {
    description: "Approve or reject new user requests for your temples.",
    label: "Requests",
    value: "requests"
  },
  {
    description: "Create accounts, search users, and archive or restore access.",
    label: "People",
    value: "people"
  },
  {
    description: "Grant role access across the organization or a specific temple.",
    label: "Roles",
    value: "roles"
  },
  {
    description: "Create, edit, archive, and restore temple records.",
    label: "Temples",
    value: "temples"
  },
  {
    description: "Manage inventory catalog, storage areas, and purchase setup.",
    label: "Setup",
    value: "setup"
  },
  {
    description: "Review purchase approvals, receipt evidence, and finance support.",
    label: "Audit",
    value: "audit"
  }
] satisfies Array<{
  description: string;
  label: string;
  value: AdminSection;
}>;

function StatusBadge({ archivedAt }: { archivedAt?: string | null }) {
  const isArchived = Boolean(archivedAt);

  return (
    <span
      className={`rounded-md border px-2 py-1 text-xs font-semibold ${
        isArchived
          ? "border-stone-300 bg-stone-100 text-stone-700"
          : "border-green-200 bg-green-50 text-green-800"
      }`}
    >
      {isArchived ? "Archived" : "Active"}
    </span>
  );
}

function formatRole(role: AppRole): string {
  return role
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function AdminSectionTabs({
  selectedSection,
  onSelect
}: {
  onSelect: (section: AdminSection) => void;
  selectedSection: AdminSection;
}) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {adminSections.map((section) => {
          const isSelected = selectedSection === section.value;

          return (
            <button
              aria-pressed={isSelected}
              className={[
                "min-h-11 rounded-md border px-3 text-sm font-semibold",
                isSelected
                  ? "border-brand-900 bg-brand-900 text-white"
                  : "border-stone-300 bg-white text-stone-800"
              ].join(" ")}
              key={section.value}
              onClick={() => onSelect(section.value)}
              type="button"
            >
              {section.label}
            </button>
          );
        })}
      </div>
      <p className="rounded-md border border-stone-200 bg-white p-3 text-sm leading-6 text-stone-700">
        {adminSections.find((section) => section.value === selectedSection)?.description}
      </p>
    </div>
  );
}

function AdminShortcut({
  description,
  label,
  path
}: {
  description: string;
  label: string;
  path: AppPath;
}) {
  return (
    <button
      className="rounded-md border border-stone-200 bg-white p-4 text-left hover:border-brand-700"
      onClick={() => navigateTo(path)}
      type="button"
    >
      <span className="block text-base font-semibold text-stone-950">{label}</span>
      <span className="mt-1 block text-sm leading-6 text-stone-600">{description}</span>
    </button>
  );
}

type UserCardProps = {
  isSubmitting: boolean;
  onRemoveRole: (role: AdminUserRoleRecord) => void;
  onSetArchived: (user: AdminUserRecord, shouldArchive: boolean) => void;
  onSetTemporaryPassword: (userId: string, password: string) => void;
  roles: AdminUserRoleRecord[];
  templesById: Map<string, AdminTempleRecord>;
  user: AdminUserRecord;
};

function UserCard({
  isSubmitting,
  onRemoveRole,
  onSetArchived,
  onSetTemporaryPassword,
  roles,
  templesById,
  user
}: UserCardProps) {
  const [temporaryPassword, setTemporaryPassword] = useState("");

  return (
    <article className="space-y-3 rounded-md border border-stone-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold text-stone-950">{user.fullName}</h3>
          <p className="mt-1 break-all text-sm text-stone-600">{user.email}</p>
          <p className="mt-1 break-all text-xs text-stone-500">{user.id}</p>
        </div>
        <StatusBadge archivedAt={user.deletedAt} />
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase text-stone-500">Roles</p>
        {roles.length > 0 ? (
          roles.map((role) => (
            <div
              className="flex items-center justify-between gap-3 rounded-md border border-stone-200 bg-stone-50 p-2"
              key={role.id}
            >
              <div>
                <p className="text-sm font-semibold text-stone-900">{formatRole(role.role)}</p>
                <p className="text-xs text-stone-600">
                  {role.templeId
                    ? (templesById.get(role.templeId)?.name ?? "Unknown temple")
                    : "All active temples"}
                </p>
              </div>
              <button
                className="min-h-9 rounded-md border border-stone-300 px-3 text-xs font-semibold text-stone-800 disabled:text-stone-400"
                disabled={isSubmitting}
                onClick={() => onRemoveRole(role)}
                type="button"
              >
                Remove
              </button>
            </div>
          ))
        ) : (
          <p className="rounded-md border border-yellow-200 bg-yellow-50 p-2 text-sm text-yellow-900">
            No app roles assigned yet.
          </p>
        )}
      </div>

      <button
        className="min-h-10 w-full rounded-md bg-stone-900 px-3 text-sm font-semibold text-white disabled:bg-stone-300"
        disabled={isSubmitting}
        onClick={() => onSetArchived(user, !user.deletedAt)}
        type="button"
      >
        {user.deletedAt ? "Restore user" : "Archive user"}
      </button>
      {!user.deletedAt ? (
        <details className="rounded-md border border-stone-200 p-3">
          <summary className="cursor-pointer text-sm font-semibold text-stone-800">
            Set temporary password
          </summary>
          <div className="mt-3 space-y-2">
            <input
              autoComplete="new-password"
              className="min-h-11 w-full rounded-md border border-stone-300 px-3"
              minLength={8}
              onChange={(event) => setTemporaryPassword(event.target.value)}
              placeholder="At least 8 characters"
              type="password"
              value={temporaryPassword}
            />
            <button
              className="min-h-10 w-full rounded-md bg-brand-900 px-3 text-sm font-semibold text-white disabled:opacity-50"
              disabled={isSubmitting || temporaryPassword.length < 8}
              onClick={() => {
                onSetTemporaryPassword(user.id, temporaryPassword);
                setTemporaryPassword("");
              }}
              type="button"
            >
              Save temporary password
            </button>
          </div>
        </details>
      ) : null}
    </article>
  );
}

export function AdminManagementScreen() {
  const admin = useAdminManagement();
  const [selectedSection, setSelectedSection] = useState<AdminSection>("requests");
  const canSaveTemple = Boolean(admin.templeName.trim()) && !admin.isSubmitting;
  const canSaveUser =
    Boolean(admin.userForm.fullName.trim()) &&
    Boolean(admin.userForm.email.trim()) &&
    Boolean(admin.userForm.password.trim()) &&
    (admin.userForm.scope === "organization" || Boolean(admin.userForm.templeId)) &&
    !admin.isSubmitting;
  const canAssignRole =
    Boolean(admin.roleForm.userId) &&
    (admin.roleForm.scope === "organization" || Boolean(admin.roleForm.templeId)) &&
    !admin.isSubmitting;

  if (!admin.canManageAdmin) {
    return (
      <section className="rounded-md border border-stone-200 bg-white p-4">
        <h2 className="text-lg font-semibold text-stone-950">Admin unavailable</h2>
        <p className="mt-2 text-sm leading-6 text-stone-600">
          Your current session does not include user, role, or temple administration permission.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase text-brand-800">Administration</p>
          <h1 className="mt-1 text-2xl font-semibold text-stone-950">Users and temples</h1>
          <p className="mt-2 text-sm leading-6 text-stone-600">
            Onboard Supabase Auth users, assign app roles, and manage temple access for this
            organization.
          </p>
        </div>
        <button
          className="min-h-10 rounded-md border border-stone-300 px-3 text-sm font-semibold text-stone-800 disabled:text-stone-400"
          disabled={admin.isLoading}
          onClick={() => {
            void admin.refresh();
          }}
          type="button"
        >
          {admin.isLoading ? "Refreshing" : "Refresh"}
        </button>
      </div>

      {admin.error ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-800">
          {admin.error}
        </div>
      ) : null}

      {admin.success ? (
        <div className="rounded-md border border-green-200 bg-green-50 p-3 text-sm font-medium text-green-800">
          {admin.success}
        </div>
      ) : null}

      <AdminSectionTabs selectedSection={selectedSection} onSelect={setSelectedSection} />

      {selectedSection === "requests" ? (
        <RegistrationRequestQueue templesById={admin.templesById} />
      ) : null}

      {selectedSection === "temples" ? (
        <>
          <section className="space-y-4 rounded-md border border-stone-200 bg-white p-4">
            <div>
              <p className="text-xs font-semibold uppercase text-stone-500">Temple setup</p>
              <h2 className="mt-1 text-lg font-semibold text-stone-950">
                {admin.editingTempleId ? "Edit temple" : "Create temple"}
              </h2>
            </div>
            <label className="block text-sm font-medium text-stone-800">
              Temple name
              <input
                className="mt-2 min-h-11 w-full rounded-md border border-stone-300 px-3 text-base text-stone-950"
                onChange={(event) => admin.setTempleName(event.target.value)}
                placeholder="ISKCON Sammamish"
                value={admin.templeName}
              />
            </label>
            <button
              className="min-h-11 w-full rounded-md bg-brand-900 px-4 text-sm font-semibold text-white disabled:bg-stone-300"
              disabled={!canSaveTemple}
              onClick={() => {
                void admin.submitTemple();
              }}
              type="button"
            >
              {admin.isSubmitting
                ? "Saving..."
                : admin.editingTempleId
                  ? "Update temple"
                  : "Create temple"}
            </button>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-stone-950">Temples</h2>
            {admin.state.temples.length > 0 ? (
              admin.state.temples.map((temple) => (
                <article
                  className="space-y-3 rounded-md border border-stone-200 bg-white p-4"
                  key={temple.id}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-base font-semibold text-stone-950">{temple.name}</h3>
                      <p className="mt-1 break-all text-xs text-stone-500">{temple.id}</p>
                    </div>
                    <StatusBadge archivedAt={temple.deletedAt} />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      className="min-h-10 rounded-md border border-stone-300 px-3 text-sm font-semibold text-stone-800 disabled:text-stone-400"
                      disabled={admin.isSubmitting}
                      onClick={() => admin.editTemple(temple)}
                      type="button"
                    >
                      Edit
                    </button>
                    <button
                      className="min-h-10 rounded-md bg-stone-900 px-3 text-sm font-semibold text-white disabled:bg-stone-300"
                      disabled={admin.isSubmitting}
                      onClick={() => {
                        void admin.setTempleArchived(temple, !temple.deletedAt);
                      }}
                      type="button"
                    >
                      {temple.deletedAt ? "Restore" : "Archive"}
                    </button>
                  </div>
                </article>
              ))
            ) : (
              <p className="rounded-md border border-stone-200 bg-white p-4 text-sm text-stone-600">
                No temples are configured yet.
              </p>
            )}
          </section>
        </>
      ) : null}

      {selectedSection === "people" ? (
        <>
          <section className="space-y-4 rounded-md border border-stone-200 bg-white p-4">
            <div>
              <p className="text-xs font-semibold uppercase text-stone-500">User onboarding</p>
              <h2 className="mt-1 text-lg font-semibold text-stone-950">Create login account</h2>
              <p className="mt-2 text-sm leading-6 text-stone-600">
                Create a Supabase login, app profile, and initial role in one step. Share the
                temporary password directly with the user.
              </p>
            </div>
            <label className="block text-sm font-medium text-stone-800">
              Full name
              <input
                className="mt-2 min-h-11 w-full rounded-md border border-stone-300 px-3 text-base text-stone-950"
                onChange={(event) =>
                  admin.setUserForm({ ...admin.userForm, fullName: event.target.value })
                }
                placeholder="Volunteer name"
                value={admin.userForm.fullName}
              />
            </label>
            <label className="block text-sm font-medium text-stone-800">
              Email
              <input
                className="mt-2 min-h-11 w-full rounded-md border border-stone-300 px-3 text-base text-stone-950"
                onChange={(event) =>
                  admin.setUserForm({ ...admin.userForm, email: event.target.value })
                }
                placeholder="volunteer@example.com"
                type="email"
                value={admin.userForm.email}
              />
            </label>
            <label className="block text-sm font-medium text-stone-800">
              Temporary password
              <input
                autoComplete="new-password"
                className="mt-2 min-h-11 w-full rounded-md border border-stone-300 px-3 text-base text-stone-950"
                minLength={8}
                onChange={(event) =>
                  admin.setUserForm({ ...admin.userForm, password: event.target.value })
                }
                placeholder="At least 8 characters"
                type="password"
                value={admin.userForm.password}
              />
            </label>
            <label className="block text-sm font-medium text-stone-800">
              Initial role
              <select
                className="mt-2 min-h-11 w-full rounded-md border border-stone-300 bg-white px-3 text-base text-stone-950"
                onChange={(event) =>
                  admin.setUserForm({ ...admin.userForm, role: event.target.value as AppRole })
                }
                value={admin.userForm.role}
              >
                {admin.manageableRoles.map((role) => (
                  <option key={role} value={role}>
                    {formatRole(role)}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-medium text-stone-800">
              Initial access scope
              <select
                className="mt-2 min-h-11 w-full rounded-md border border-stone-300 bg-white px-3 text-base text-stone-950"
                onChange={(event) =>
                  admin.setUserForm({
                    ...admin.userForm,
                    scope: event.target.value as "organization" | "temple"
                  })
                }
                value={admin.userForm.scope}
              >
                <option value="temple">Specific temple</option>
                <option value="organization">All active temples</option>
              </select>
            </label>
            {admin.userForm.scope === "temple" ? (
              <label className="block text-sm font-medium text-stone-800">
                Initial temple
                <select
                  className="mt-2 min-h-11 w-full rounded-md border border-stone-300 bg-white px-3 text-base text-stone-950"
                  onChange={(event) =>
                    admin.setUserForm({ ...admin.userForm, templeId: event.target.value })
                  }
                  value={admin.userForm.templeId}
                >
                  <option value="">Choose active temple</option>
                  {admin.activeTemples.map((temple) => (
                    <option key={temple.id} value={temple.id}>
                      {temple.name}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
            <button
              className="min-h-11 w-full rounded-md bg-brand-900 px-4 text-sm font-semibold text-white disabled:bg-stone-300"
              disabled={!canSaveUser}
              onClick={() => {
                void admin.createUser();
              }}
              type="button"
            >
              {admin.isSubmitting ? "Creating..." : "Create user"}
            </button>
          </section>

          <section className="space-y-3">
            <div>
              <h2 className="text-lg font-semibold text-stone-950">Users</h2>
              <label className="mt-3 block text-sm font-medium text-stone-800">
                Search
                <input
                  className="mt-2 min-h-11 w-full rounded-md border border-stone-300 px-3 text-base text-stone-950"
                  onChange={(event) => admin.setUserSearch(event.target.value)}
                  placeholder="Search by name, email, or user ID"
                  value={admin.userSearch}
                />
              </label>
            </div>
            {admin.filteredUsers.length > 0 ? (
              admin.filteredUsers.map((user) => (
                <UserCard
                  isSubmitting={admin.isSubmitting}
                  key={user.id}
                  onRemoveRole={(role) => {
                    void admin.removeRole(role);
                  }}
                  onSetArchived={(selectedUser, shouldArchive) => {
                    void admin.setUserArchived(selectedUser, shouldArchive);
                  }}
                  onSetTemporaryPassword={(userId, password) => {
                    void admin.setTemporaryPassword(userId, password);
                  }}
                  roles={admin.rolesByUserId.get(user.id) ?? []}
                  templesById={admin.templesById}
                  user={user}
                />
              ))
            ) : (
              <p className="rounded-md border border-stone-200 bg-white p-4 text-sm text-stone-600">
                No users match this search.
              </p>
            )}
          </section>
        </>
      ) : null}

      {selectedSection === "roles" ? (
        <section className="space-y-4 rounded-md border border-stone-200 bg-white p-4">
          <div>
            <p className="text-xs font-semibold uppercase text-stone-500">Role assignment</p>
            <h2 className="mt-1 text-lg font-semibold text-stone-950">Grant access</h2>
          </div>
          <label className="block text-sm font-medium text-stone-800">
            User
            <select
              className="mt-2 min-h-11 w-full rounded-md border border-stone-300 bg-white px-3 text-base text-stone-950"
              onChange={(event) =>
                admin.setRoleForm({ ...admin.roleForm, userId: event.target.value })
              }
              value={admin.roleForm.userId}
            >
              <option value="">Choose user</option>
              {admin.state.users
                .filter((user) => !user.deletedAt)
                .map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.fullName} ({user.email})
                  </option>
                ))}
            </select>
          </label>
          <label className="block text-sm font-medium text-stone-800">
            Role
            <select
              className="mt-2 min-h-11 w-full rounded-md border border-stone-300 bg-white px-3 text-base text-stone-950"
              onChange={(event) =>
                admin.setRoleForm({ ...admin.roleForm, role: event.target.value as AppRole })
              }
              value={admin.roleForm.role}
            >
              {admin.manageableRoles.map((role) => (
                <option key={role} value={role}>
                  {formatRole(role)}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium text-stone-800">
            Scope
            <select
              className="mt-2 min-h-11 w-full rounded-md border border-stone-300 bg-white px-3 text-base text-stone-950"
              onChange={(event) =>
                admin.setRoleForm({
                  ...admin.roleForm,
                  scope: event.target.value as "organization" | "temple"
                })
              }
              value={admin.roleForm.scope}
            >
              <option value="temple">Specific temple</option>
              <option value="organization">All active temples</option>
            </select>
          </label>
          {admin.roleForm.scope === "temple" ? (
            <label className="block text-sm font-medium text-stone-800">
              Temple
              <select
                className="mt-2 min-h-11 w-full rounded-md border border-stone-300 bg-white px-3 text-base text-stone-950"
                onChange={(event) =>
                  admin.setRoleForm({ ...admin.roleForm, templeId: event.target.value })
                }
                value={admin.roleForm.templeId}
              >
                <option value="">Choose active temple</option>
                {admin.activeTemples.map((temple) => (
                  <option key={temple.id} value={temple.id}>
                    {temple.name}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          <button
            className="min-h-11 w-full rounded-md bg-brand-900 px-4 text-sm font-semibold text-white disabled:bg-stone-300"
            disabled={!canAssignRole}
            onClick={() => {
              void admin.assignRole();
            }}
            type="button"
          >
            {admin.isSubmitting ? "Assigning..." : "Assign role"}
          </button>
        </section>
      ) : null}

      {selectedSection === "setup" ? (
        <section className="space-y-3">
          <AdminShortcut
            description="Create and archive inventory items, units, categories, and reorder points."
            label="Inventory items"
            path="/items"
          />
          <AdminShortcut
            description="Create and archive storage areas such as pantry, refrigerator, freezer, and trailers."
            label="Storage locations"
            path="/locations"
          />
          <AdminShortcut
            description="Configure purchase stores, default purchasers, item preferences, pack sizes, and minimum order quantities."
            label="Procurement setup"
            path="/procurement-admin"
          />
        </section>
      ) : null}

      {selectedSection === "audit" ? (
        <section className="space-y-3">
          <AdminShortcut
            description="Review, edit, approve, schedule, and publish staff purchase requests."
            label="Purchase request review"
            path="/purchase-review"
          />
          <AdminShortcut
            description="Review receipt uploads, OCR suggestions, finance notes, and CSV export evidence."
            label="Receipt and finance review"
            path="/receipt-review"
          />
          <AdminShortcut
            description="Review inventory balances, transaction history, and reversal evidence."
            label="Inventory visibility"
            path="/inventory"
          />
        </section>
      ) : null}
    </section>
  );
}
