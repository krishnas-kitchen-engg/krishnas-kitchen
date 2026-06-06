import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@krishnas-kitchen/types";

import type { VolunteerSessionRepository } from "../../application/volunteerSessionRepository";
import {
  type FindActiveVolunteerSessionInput,
  normalizeVolunteerJoinCode,
  type ValidatedVolunteerSession
} from "../../domain/volunteerSession";
import {
  mapVolunteerSessionRow,
  type VolunteerSessionRow,
  type VolunteerSessionUpdate
} from "./volunteerSessionMapper";

function clientSessionMatches(row: VolunteerSessionRow, clientSessionId?: string): boolean {
  return clientSessionId === undefined || row.client_session_id === clientSessionId;
}

function isActiveAt(row: VolunteerSessionRow, now: string): boolean {
  return row.status === "active" && row.expires_at > now;
}

async function findActiveRowById(
  client: SupabaseClient<Database>,
  input: FindActiveVolunteerSessionInput
): Promise<VolunteerSessionRow | null> {
  const { data, error } = await client
    .from("volunteer_sessions")
    .select("*")
    .eq("id", input.sessionId)
    .eq("status", "active")
    .gt("expires_at", input.now)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data || !clientSessionMatches(data, input.clientSessionId)) {
    return null;
  }

  return data;
}

async function updateVolunteerSession(
  client: SupabaseClient<Database>,
  sessionId: string,
  payload: VolunteerSessionUpdate
): Promise<ValidatedVolunteerSession> {
  const { data, error } = await client
    .from("volunteer_sessions")
    .update(payload)
    .eq("id", sessionId)
    .eq("status", "active")
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return mapVolunteerSessionRow(data);
}

export function createSupabaseVolunteerSessionRepository(
  client: SupabaseClient<Database>
): VolunteerSessionRepository {
  return {
    async clearClientSession(input) {
      let query = client
        .from("volunteer_sessions")
        .update({
          client_session_id: null
        })
        .eq("id", input.sessionId);

      if (input.clientSessionId) {
        query = query.eq("client_session_id", input.clientSessionId);
      }

      const { error } = await query;

      if (error) {
        throw error;
      }
    },

    async findActiveSessionById(input) {
      const row = await findActiveRowById(client, input);

      return row ? mapVolunteerSessionRow(row) : null;
    },

    async refreshSession(input) {
      const row = await findActiveRowById(client, input);

      if (!row) {
        return null;
      }

      return updateVolunteerSession(client, row.id, {
        last_seen_at: input.lastSeenAt
      });
    },

    async validateJoinCode(input) {
      const normalizedJoinCode = normalizeVolunteerJoinCode(input.joinCode);
      const { data, error } = await client
        .from("volunteer_sessions")
        .select("*")
        .eq("join_code", normalizedJoinCode)
        .eq("status", "active")
        .gt("expires_at", input.now)
        .maybeSingle();

      if (error) {
        throw error;
      }

      if (!data || !isActiveAt(data, input.now)) {
        return null;
      }

      return updateVolunteerSession(client, data.id, {
        client_session_id: input.clientSessionId,
        display_name: input.displayName.trim(),
        last_seen_at: input.now,
        started_at: data.started_at ?? input.now
      });
    }
  };
}
