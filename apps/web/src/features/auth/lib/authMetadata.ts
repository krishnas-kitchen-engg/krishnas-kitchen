import type { User } from "@supabase/supabase-js";
import type {
  AppRole,
  AuthOrganization,
  AuthTemple,
  AuthUserProfile
} from "@krishnas-kitchen/types";

import { isAppRole } from "./permissions";

function readRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function readString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function readRoles(value: unknown): AppRole[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(isAppRole);
}

function readTemples(value: unknown, organizationId: string | null): AuthTemple[] {
  if (!Array.isArray(value) || !organizationId) {
    return [];
  }

  return value.flatMap((item) => {
    const temple = readRecord(item);
    const id = readString(temple.id);
    const name = readString(temple.name);

    return id && name ? [{ id, name, organizationId }] : [];
  });
}

export function getAuthProfileFromUser(user: User): AuthUserProfile {
  const appMetadata = readRecord(user.app_metadata);
  const userMetadata = readRecord(user.user_metadata);
  const organizationId = readString(appMetadata.organization_id);
  const organizationName = readString(appMetadata.organization_name) ?? "Current organization";
  const organization: AuthOrganization | null = organizationId
    ? {
        id: organizationId,
        name: organizationName
      }
    : null;

  return {
    id: readString(appMetadata.profile_id) ?? user.id,
    authUserId: user.id,
    displayName:
      readString(userMetadata.display_name) ??
      readString(userMetadata.name) ??
      user.email ??
      "Kitchen user",
    email: user.email ?? null,
    organization,
    roles: readRoles(appMetadata.roles),
    temples: readTemples(appMetadata.temples, organizationId)
  };
}
