import type { Database } from "@krishnas-kitchen/types";

import type { ValidatedVolunteerSession } from "../../domain/volunteerSession";

export type VolunteerSessionRow = Database["public"]["Tables"]["volunteer_sessions"]["Row"];
export type VolunteerSessionUpdate = Database["public"]["Tables"]["volunteer_sessions"]["Update"];

export function mapVolunteerSessionRow(row: VolunteerSessionRow): ValidatedVolunteerSession {
  return {
    clientSessionId: row.client_session_id,
    displayName: row.display_name ?? row.session_name,
    expiresAt: row.expires_at,
    id: row.id,
    lastSeenAt: row.last_seen_at,
    organizationId: row.organization_id,
    role: row.role,
    startedAt: row.started_at,
    templeId: row.temple_id
  };
}
