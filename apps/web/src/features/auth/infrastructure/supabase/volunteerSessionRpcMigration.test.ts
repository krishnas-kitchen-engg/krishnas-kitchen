import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "vitest";

const migration = readFileSync(
  join(
    process.cwd(),
    "infra",
    "supabase",
    "migrations",
    "20260607000200_add_volunteer_session_rpc_functions.sql"
  ),
  "utf8"
);

describe("volunteer session RPC migration", () => {
  it("adds secure RPCs for join validation, restore, refresh, and logout cleanup", () => {
    assert.match(migration, /create or replace function public\.validate_volunteer_join_code\(/i);
    assert.match(migration, /create or replace function public\.restore_volunteer_session\(/i);
    assert.match(migration, /create or replace function public\.refresh_volunteer_session\(/i);
    assert.match(migration, /create or replace function public\.clear_volunteer_client_session\(/i);
    assert.match(
      migration,
      /returns table \([\s\S]*session_id uuid,[\s\S]*organization_id uuid,[\s\S]*temple_id uuid,[\s\S]*role public\.temp_volunteer_role/i
    );
  });

  it("derives volunteer scope from database helpers and persisted sessions only", () => {
    assert.match(migration, /public\.get_active_volunteer_session_scope_by_join_code/i);
    assert.match(migration, /public\.get_active_volunteer_session_scope\(/i);
    assert.match(migration, /update public\.volunteer_sessions volunteer_session/i);
    assert.match(migration, /join public\.volunteer_sessions volunteer_session/i);
    assert.match(migration, /volunteer_session\.organization_id/i);
    assert.match(migration, /volunteer_session\.temple_id/i);
    assert.match(migration, /volunteer_session\.role/i);
    assert.match(migration, /volunteer_session\.status = 'active'/i);
    assert.match(migration, /volunteer_session\.revoked_at is null/i);
    assert.match(migration, /volunteer_session\.expires_at > checked_at/i);
  });

  it("updates only session lifecycle fields and validates client session matching", () => {
    assert.match(migration, /client_session_id = normalized_client_session_id/i);
    assert.match(migration, /display_name = normalized_display_name/i);
    assert.match(migration, /last_seen_at = checked_at/i);
    assert.match(migration, /started_at = coalesce\(volunteer_session\.started_at, checked_at\)/i);
    assert.match(migration, /set last_seen_at = refreshed_at/i);
    assert.match(migration, /set client_session_id = null/i);
    assert.match(migration, /volunteer_session\.client_session_id = expected_client_session_id/i);
    assert.match(migration, /expected_client_session_id text\s+\)/i);
    assert.match(migration, /nullif\(trim\(expected_client_session_id\), ''\) is null/i);
    assert.doesNotMatch(migration, /organization_id\s*=/i);
    assert.doesNotMatch(migration, /temple_id\s*=/i);
    assert.doesNotMatch(migration, /role\s*=/i);
  });

  it("uses security definer with explicit search paths and no table exposure", () => {
    assert.match(migration, /security definer/i);
    assert.match(migration, /set search_path = public/i);
    assert.match(
      migration,
      /revoke execute on function public\.validate_volunteer_join_code\(text, text, text, timestamptz\)\s+from public/i
    );
    assert.match(
      migration,
      /grant execute on function public\.validate_volunteer_join_code\(text, text, text, timestamptz\)\s+to anon/i
    );
    assert.match(
      migration,
      /grant execute on function public\.restore_volunteer_session\(uuid, text, timestamptz\)\s+to anon/i
    );
    assert.match(
      migration,
      /grant execute on function public\.refresh_volunteer_session\(uuid, text, timestamptz\)\s+to anon/i
    );
    assert.match(
      migration,
      /grant execute on function public\.clear_volunteer_client_session\(uuid, text\)\s+to anon/i
    );
    assert.doesNotMatch(migration, /create policy/i);
    assert.doesNotMatch(migration, /grant select|grant insert|grant update|grant delete/i);
  });
});
