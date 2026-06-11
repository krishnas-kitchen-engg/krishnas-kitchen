import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@krishnas-kitchen/types";

import type { VolunteerSessionRepository } from "../../application/volunteerSessionRepository";
import {
  normalizeVolunteerJoinCode,
  type ValidatedVolunteerSession
} from "../../domain/volunteerSession";
import { mapVolunteerSessionRpcRow, type VolunteerSessionRpcRow } from "./volunteerSessionMapper";

type VolunteerSessionRpcName =
  | "clear_volunteer_client_session"
  | "refresh_volunteer_session"
  | "restore_volunteer_session"
  | "validate_volunteer_join_code";

type VolunteerSessionRpcClient = {
  rpc<TData>(
    name: VolunteerSessionRpcName,
    params: Record<string, unknown>
  ): Promise<{
    data: TData;
    error: unknown;
  }>;
};

function getRpcClient(client: SupabaseClient<Database>): VolunteerSessionRpcClient {
  return client as unknown as VolunteerSessionRpcClient;
}

function throwRpcError(error: unknown): never {
  if (error instanceof Error) {
    throw error;
  }

  throw new Error("Volunteer session RPC failed.", {
    cause: error
  });
}

async function readSingleVolunteerSessionRpcRow(
  client: SupabaseClient<Database>,
  name: Exclude<VolunteerSessionRpcName, "clear_volunteer_client_session">,
  params: Record<string, unknown>
): Promise<ValidatedVolunteerSession | null> {
  const { data, error } = await getRpcClient(client).rpc<VolunteerSessionRpcRow[]>(name, params);

  if (error) {
    throwRpcError(error);
  }

  const row = data[0];

  return row ? mapVolunteerSessionRpcRow(row) : null;
}

export function createSupabaseVolunteerSessionRepository(
  client: SupabaseClient<Database>
): VolunteerSessionRepository {
  return {
    async clearClientSession(input) {
      if (!input.clientSessionId) {
        return;
      }

      const { error } = await getRpcClient(client).rpc<null>("clear_volunteer_client_session", {
        expected_client_session_id: input.clientSessionId,
        volunteer_session_id: input.sessionId
      });

      if (error) {
        throwRpcError(error);
      }
    },

    async findActiveSessionById(input) {
      if (!input.clientSessionId) {
        return null;
      }

      return readSingleVolunteerSessionRpcRow(client, "restore_volunteer_session", {
        checked_at: input.now,
        expected_client_session_id: input.clientSessionId,
        volunteer_session_id: input.sessionId
      });
    },

    async refreshSession(input) {
      if (!input.clientSessionId) {
        return null;
      }

      return readSingleVolunteerSessionRpcRow(client, "refresh_volunteer_session", {
        expected_client_session_id: input.clientSessionId,
        refreshed_at: input.lastSeenAt,
        volunteer_session_id: input.sessionId
      });
    },

    async validateJoinCode(input) {
      const normalizedJoinCode = normalizeVolunteerJoinCode(input.joinCode);

      return readSingleVolunteerSessionRpcRow(client, "validate_volunteer_join_code", {
        checked_at: input.now,
        input_client_session_id: input.clientSessionId,
        raw_join_code: normalizedJoinCode,
        volunteer_display_name: input.displayName
      });
    }
  };
}
