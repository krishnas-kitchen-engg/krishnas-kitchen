import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "vitest";

const migration = readFileSync(
  join(process.cwd(), "infra", "supabase", "migrations", "20260802000100_add_admin_management.sql"),
  "utf8"
);

describe("admin management migration", () => {
  it("adds admin helper functions with explicit security boundaries", () => {
    assert.match(
      migration,
      /create or replace function public\.is_authenticated_organization_admin/i
    );
    assert.match(migration, /create or replace function public\.is_authenticated_super_admin/i);
    assert.match(
      migration,
      /create or replace function public\.admin_refresh_organization_app_metadata/i
    );
    assert.match(migration, /security definer/i);
    assert.match(migration, /revoke execute on function public\.admin_refresh_user_app_metadata/i);
    assert.match(
      migration,
      /revoke execute on function public\.admin_refresh_organization_app_metadata/i
    );
    assert.match(migration, /grant execute on function public\.admin_refresh_user_app_metadata/i);
  });

  it("synchronizes app metadata from canonical public administration records", () => {
    assert.match(migration, /update auth\.users auth_user/i);
    assert.match(migration, /'organization_id', profile_record\.organization_id/i);
    assert.match(migration, /'organization_name', profile_record\.organization_name/i);
    assert.match(migration, /'roles', role_values/i);
    assert.match(migration, /'temples', temple_values/i);
  });

  it("adds policies for temple, user, and role administration", () => {
    for (const tableName of ["temples", "users", "user_roles"]) {
      assert.match(migration, new RegExp(`create policy [\\s\\S]+ on public\\.${tableName}`, "i"));
    }

    assert.match(migration, /role <> 'super_admin'/i);
    assert.match(migration, /public\.is_authenticated_super_admin\(organization_id\)/i);
  });
});
