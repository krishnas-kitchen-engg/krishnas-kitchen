import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "vitest";

import type { Database } from "@krishnas-kitchen/types";

const migration = readFileSync(
  join(
    process.cwd(),
    "infra",
    "supabase",
    "migrations",
    "20260606000600_reconcile_volunteer_sessions_runtime_fields.sql"
  ),
  "utf8"
);

describe("volunteer session runtime migration", () => {
  it("adds runtime lifecycle fields additively", () => {
    assert.match(migration, /alter table public\.volunteer_sessions/i);
    assert.match(migration, /add column if not exists display_name text/i);
    assert.match(migration, /add column if not exists started_at timestamptz/i);
    assert.match(migration, /add column if not exists last_seen_at timestamptz/i);
    assert.match(migration, /add column if not exists revoked_at timestamptz/i);
    assert.match(
      migration,
      /add column if not exists revoked_by_user_id uuid references public\.users\(id\)/i
    );
    assert.match(migration, /add column if not exists revocation_reason text/i);
    assert.match(migration, /add column if not exists client_session_id text/i);
    assert.doesNotMatch(migration, /drop table|drop column/i);
  });

  it("adds lookup indexes for future join-code validation and active session checks", () => {
    assert.match(migration, /idx_volunteer_sessions_join_code_status_expires/i);
    assert.match(migration, /on public\.volunteer_sessions\(join_code, status, expires_at\)/i);
    assert.match(migration, /idx_volunteer_sessions_active_lookup/i);
    assert.match(migration, /where status = 'active'/i);
    assert.match(migration, /idx_volunteer_sessions_client_session_id/i);
  });

  it("aligns generated volunteer session types with lifecycle fields", () => {
    type VolunteerSessionRow = Database["public"]["Tables"]["volunteer_sessions"]["Row"];
    type VolunteerSessionInsert = Database["public"]["Tables"]["volunteer_sessions"]["Insert"];
    type VolunteerSessionUpdate = Database["public"]["Tables"]["volunteer_sessions"]["Update"];

    const row = {
      client_session_id: "client-session-1",
      created_at: "2026-06-06T08:00:00.000Z",
      created_by_user_id: "user-1",
      display_name: "Mira",
      expires_at: "2026-06-06T12:00:00.000Z",
      id: "session-1",
      join_code: "RICE123",
      last_seen_at: "2026-06-06T09:00:00.000Z",
      organization_id: "org-1",
      revocation_reason: null,
      revoked_at: null,
      revoked_by_user_id: null,
      role: "temp_receiver",
      session_name: "Morning receiving",
      started_at: "2026-06-06T08:05:00.000Z",
      status: "active",
      temple_id: "temple-1",
      updated_at: "2026-06-06T09:00:00.000Z"
    } satisfies VolunteerSessionRow;
    const insert = {
      created_by_user_id: "user-1",
      expires_at: row.expires_at,
      join_code: row.join_code,
      organization_id: row.organization_id,
      role: row.role,
      session_name: row.session_name,
      temple_id: row.temple_id
    } satisfies VolunteerSessionInsert;
    const update = {
      display_name: "Mira",
      last_seen_at: "2026-06-06T09:30:00.000Z",
      status: "active"
    } satisfies VolunteerSessionUpdate;

    assert.equal(row.status, "active");
    assert.equal(insert.role, "temp_receiver");
    assert.equal(update.display_name, "Mira");
  });
});
