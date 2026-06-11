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
    "20260607000100_add_rls_security_helper_functions.sql"
  ),
  "utf8"
);

describe("RLS security helper migration", () => {
  it("adds authenticated user scope helpers that derive scope from database records", () => {
    assert.match(
      migration,
      /create or replace function public\.current_authenticated_user_organization_id\(\)/i
    );
    assert.match(migration, /from public\.users app_user/i);
    assert.match(migration, /app_user\.id = auth\.uid\(\)/i);
    assert.match(
      migration,
      /create or replace function public\.current_authenticated_user_roles\(\)/i
    );
    assert.match(migration, /from public\.user_roles user_role/i);
    assert.match(
      migration,
      /create or replace function public\.current_authenticated_user_temple_ids\(\)/i
    );
    assert.match(migration, /from public\.temples temple/i);
  });

  it("adds active volunteer session helpers without trusting browser-provided scope", () => {
    assert.match(
      migration,
      /create or replace function public\.get_active_volunteer_session_scope\(/i
    );
    assert.match(
      migration,
      /create or replace function public\.get_active_volunteer_session_scope_by_join_code\(/i
    );
    assert.match(migration, /from public\.volunteer_sessions volunteer_session/i);
    assert.match(migration, /volunteer_session\.status = 'active'/i);
    assert.match(migration, /volunteer_session\.revoked_at is null/i);
    assert.match(migration, /volunteer_session\.expires_at > checked_at/i);
    assert.match(migration, /volunteer_session\.organization_id/i);
    assert.match(migration, /volunteer_session\.temple_id/i);
    assert.match(
      migration,
      /get_active_volunteer_session_scope\(\s+volunteer_session_id uuid,\s+expected_client_session_id text default null,\s+checked_at timestamptz/i
    );
    assert.match(
      migration,
      /get_active_volunteer_session_scope_by_join_code\(\s+normalized_join_code text,\s+checked_at timestamptz/i
    );
  });

  it("keeps helpers security-definer and does not create RLS policies or anon grants", () => {
    assert.match(migration, /security definer/i);
    assert.match(migration, /set search_path = public/i);
    assert.match(
      migration,
      /revoke execute on function public\.get_active_volunteer_session_scope\(uuid, text, timestamptz\)\s+from public/i
    );
    assert.match(
      migration,
      /revoke execute on function public\.get_active_volunteer_session_scope_by_join_code\(text, timestamptz\)\s+from public/i
    );
    assert.doesNotMatch(migration, /create policy/i);
    assert.doesNotMatch(migration, /grant execute[\s\S]+to anon/i);
    assert.doesNotMatch(migration, /grant select|grant insert|grant update|grant delete/i);
  });
});
