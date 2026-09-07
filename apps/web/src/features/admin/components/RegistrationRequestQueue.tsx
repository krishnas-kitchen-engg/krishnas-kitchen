import { useState } from "react";
import type { AppRole } from "@krishnas-kitchen/types";

import {
  useRegistrationRequests,
  type RegistrationRequest
} from "../hooks/useRegistrationRequests";

const approvableRoles: Array<{ label: string; value: AppRole }> = [
  { label: "Volunteer", value: "volunteer" },
  { label: "Cook", value: "cook" },
  { label: "Senior cook", value: "senior_cook" },
  { label: "Inventory manager", value: "inventory_manager" },
  { label: "Temple admin", value: "temple_admin" }
];

function RequestCard({
  disabled,
  onReview,
  request,
  templeName
}: {
  disabled: boolean;
  onReview: (decision: "approve" | "reject", role: AppRole, note: string) => void;
  request: RegistrationRequest;
  templeName: string;
}) {
  const [role, setRole] = useState<AppRole>("volunteer");
  const [note, setNote] = useState("");

  return (
    <article className="space-y-3 rounded-md border border-stone-200 bg-white p-4">
      <div>
        <h3 className="font-semibold text-stone-950">{request.full_name}</h3>
        <p className="mt-1 break-all text-sm text-stone-600">{request.email}</p>
        <p className="mt-1 text-sm font-medium text-stone-700">{templeName}</p>
        <p className="mt-1 text-xs text-stone-500">
          Requested {new Date(request.requested_at).toLocaleString()}
        </p>
      </div>
      <label className="block text-sm font-medium text-stone-800">
        Role to grant
        <select
          className="mt-1 min-h-11 w-full rounded-md border border-stone-300 bg-white px-3"
          onChange={(event) => setRole(event.target.value as AppRole)}
          value={role}
        >
          {approvableRoles.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm font-medium text-stone-800">
        Review note (optional)
        <textarea
          className="mt-1 min-h-20 w-full rounded-md border border-stone-300 p-3"
          onChange={(event) => setNote(event.target.value)}
          value={note}
        />
      </label>
      <div className="grid grid-cols-2 gap-2">
        <button
          className="min-h-11 rounded-md border border-red-300 bg-white text-sm font-semibold text-red-800 disabled:opacity-50"
          disabled={disabled}
          onClick={() => onReview("reject", role, note)}
          type="button"
        >
          Reject
        </button>
        <button
          className="min-h-11 rounded-md bg-brand-900 text-sm font-semibold text-white disabled:opacity-50"
          disabled={disabled}
          onClick={() => onReview("approve", role, note)}
          type="button"
        >
          Approve
        </button>
      </div>
    </article>
  );
}

export function RegistrationRequestQueue({
  templesById
}: {
  templesById: ReadonlyMap<string, { name: string }>;
}) {
  const queue = useRegistrationRequests();

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-stone-950">Registration requests</h2>
          <p className="mt-1 text-sm text-stone-600">
            Approve or reject requests routed to temples you administer.
          </p>
          <p className="mt-1 text-xs leading-5 text-stone-500">
            Someone who registered before this queue was enabled may not appear here. Use People and
            their exact registered email to link that login.
          </p>
        </div>
        <button
          className="min-h-10 rounded-md border border-stone-300 px-3 text-sm font-semibold"
          disabled={queue.isLoading}
          onClick={() => void queue.refresh()}
          type="button"
        >
          Refresh
        </button>
      </div>
      {queue.error ? (
        <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{queue.error}</p>
      ) : null}
      {queue.success ? (
        <p className="rounded-md bg-green-50 p-3 text-sm text-green-800">{queue.success}</p>
      ) : null}
      {!queue.isLoading && queue.requests.length === 0 ? (
        <p className="rounded-md border border-stone-200 bg-white p-4 text-sm text-stone-600">
          No pending registration requests.
        </p>
      ) : null}
      {queue.requests.map((request) => (
        <RequestCard
          disabled={queue.isSubmitting}
          key={request.id}
          onReview={(decision, role, note) => void queue.review(request.id, decision, role, note)}
          request={request}
          templeName={templesById.get(request.temple_id)?.name ?? "Unknown temple"}
        />
      ))}
    </section>
  );
}
