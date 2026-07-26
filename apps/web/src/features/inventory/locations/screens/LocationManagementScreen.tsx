import { navigateToInventoryLocation } from "@/app/routes/router";
import type { ManagedInventoryLocation } from "@/domains/inventory";

import { useLocationManagement } from "../hooks/useLocationManagement";

function LocationStatusBadge({ location }: { location: ManagedInventoryLocation }) {
  const isArchived = Boolean(location.deletedAt);

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

export function LocationManagementScreen() {
  const management = useLocationManagement();
  const isEditing = Boolean(management.form.editingLocationId);
  const canSubmit = Boolean(management.form.name.trim()) && !management.isSubmitting;

  if (!management.canManageLocations) {
    return (
      <section className="rounded-md border border-stone-200 bg-white p-4">
        <h2 className="text-lg font-semibold text-stone-950">Location management unavailable</h2>
        <p className="mt-2 text-sm leading-6 text-stone-600">
          Your current session does not include location administration permission.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase text-brand-800">Locations</p>
          <h1 className="mt-1 text-2xl font-semibold text-stone-950">Manage storage areas</h1>
        </div>
        <button
          className="min-h-10 rounded-md border border-stone-300 px-3 text-sm font-semibold text-stone-800 disabled:text-stone-400"
          disabled={management.isLoading}
          onClick={() => management.refresh()}
          type="button"
        >
          {management.isLoading ? "Refreshing" : "Refresh"}
        </button>
      </div>

      {management.error ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-800">
          {management.error}
        </div>
      ) : null}

      <section className="space-y-4 rounded-md border border-stone-200 bg-white p-4">
        <div>
          <p className="text-xs font-semibold uppercase text-stone-500">
            {isEditing ? "Edit location" : "Create location"}
          </p>
          <h2 className="mt-1 text-lg font-semibold text-stone-950">
            {isEditing ? "Update storage area" : "Add storage area"}
          </h2>
        </div>
        <label className="block text-sm font-medium text-stone-800">
          Name
          <input
            className="mt-2 min-h-11 w-full rounded-md border border-stone-300 px-3 text-base text-stone-950"
            onChange={(event) => management.setName(event.target.value)}
            placeholder="Pantry, Freezer, Trailer 1..."
            value={management.form.name}
          />
        </label>
        <label className="block text-sm font-medium text-stone-800">
          Description
          <textarea
            className="mt-2 min-h-24 w-full rounded-md border border-stone-300 px-3 py-2 text-base text-stone-950"
            onChange={(event) => management.setDescription(event.target.value)}
            placeholder="Optional notes about this storage area"
            value={management.form.description}
          />
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            className="min-h-11 rounded-md border border-stone-300 px-4 text-sm font-semibold text-stone-800"
            onClick={() => management.resetForm()}
            type="button"
          >
            Clear
          </button>
          <button
            className="min-h-11 rounded-md bg-brand-900 px-4 text-sm font-semibold text-white disabled:bg-stone-300"
            disabled={!canSubmit}
            onClick={() => {
              void management.submitLocation();
            }}
            type="button"
          >
            {management.isSubmitting ? "Saving..." : isEditing ? "Save" : "Create"}
          </button>
        </div>
      </section>

      <section className="space-y-3">
        <label className="block text-sm font-medium text-stone-800">
          Search locations
          <input
            className="mt-2 min-h-11 w-full rounded-md border border-stone-300 px-3 text-base text-stone-950"
            onChange={(event) => management.setSearchText(event.target.value)}
            placeholder="Pantry, freezer, trailer..."
            value={management.searchText}
          />
        </label>

        {management.filteredLocations.length > 0 ? (
          <div className="space-y-3">
            {management.filteredLocations.map((location) => (
              <article
                className="space-y-3 rounded-md border border-stone-200 bg-white p-4"
                key={location.id}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-stone-950">{location.name}</h2>
                    <p className="mt-1 text-sm text-stone-600">
                      {location.description || "No description"}
                    </p>
                  </div>
                  <LocationStatusBadge location={location} />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    className="min-h-10 rounded-md border border-stone-300 px-2 text-sm font-semibold text-stone-800"
                    onClick={() => management.setEditingLocation(location)}
                    type="button"
                  >
                    Edit
                  </button>
                  <button
                    className="min-h-10 rounded-md border border-stone-300 px-2 text-sm font-semibold text-stone-800"
                    onClick={() => navigateToInventoryLocation(location.id)}
                    type="button"
                  >
                    History
                  </button>
                  <button
                    className="min-h-10 rounded-md bg-stone-900 px-2 text-sm font-semibold text-white disabled:bg-stone-300"
                    disabled={management.isSubmitting}
                    onClick={() => {
                      void management.setArchived(location, !location.deletedAt);
                    }}
                    type="button"
                  >
                    {location.deletedAt ? "Restore" : "Archive"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="rounded-md border border-stone-200 bg-white p-4 text-sm text-stone-600">
            No locations match this search.
          </p>
        )}
      </section>
    </section>
  );
}
