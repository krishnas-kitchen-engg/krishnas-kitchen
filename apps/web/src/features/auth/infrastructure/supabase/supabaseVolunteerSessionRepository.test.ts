import assert from "node:assert/strict";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@krishnas-kitchen/types";
import { describe, it } from "vitest";

import { createSupabaseVolunteerSessionRepository } from "./supabaseVolunteerSessionRepository";
import type { VolunteerSessionRpcRow } from "./volunteerSessionMapper";

type RpcName =
  | "clear_volunteer_client_session"
  | "refresh_volunteer_session"
  | "restore_volunteer_session"
  | "validate_volunteer_join_code";

type RpcCall = {
  name: RpcName;
  params: Record<string, unknown>;
};

class SupabaseRpcStub {
  readonly calls: RpcCall[] = [];
  nextError: Error | null = null;

  constructor(
    private readonly responses: Partial<Record<RpcName, VolunteerSessionRpcRow[]>> = {}
  ) {}

  rpc<TData>(name: RpcName, params: Record<string, unknown>) {
    this.calls.push({ name, params });

    if (this.nextError) {
      return Promise.resolve({
        data: null as TData,
        error: this.nextError
      });
    }

    if (name === "clear_volunteer_client_session") {
      return Promise.resolve({
        data: null as TData,
        error: null
      });
    }

    return Promise.resolve({
      data: (this.responses[name] ?? []) as TData,
      error: null
    });
  }
}

function createRpcRow(overrides: Partial<VolunteerSessionRpcRow> = {}): VolunteerSessionRpcRow {
  return {
    client_session_id: "client-1",
    display_name: "Gopal",
    expires_at: "2026-06-06T12:00:00.000Z",
    last_seen_at: "2026-06-06T09:00:00.000Z",
    organization_id: "org-from-rpc",
    role: "temp_receiver",
    session_id: "session-1",
    started_at: "2026-06-06T09:00:00.000Z",
    temple_id: "temple-from-rpc",
    ...overrides
  };
}

function createRepository(responses: Partial<Record<RpcName, VolunteerSessionRpcRow[]>> = {}) {
  const stub = new SupabaseRpcStub(responses);

  return {
    repository: createSupabaseVolunteerSessionRepository(
      stub as unknown as SupabaseClient<Database>
    ),
    stub
  };
}

describe("Supabase volunteer session repository", () => {
  it("validates an active join code through the volunteer validation RPC", async () => {
    const { repository, stub } = createRepository({
      validate_volunteer_join_code: [createRpcRow()]
    });

    const session = await repository.validateJoinCode({
      clientSessionId: "client-1",
      displayName: "  Gopal  ",
      joinCode: " rice 123 ",
      now: "2026-06-06T09:00:00.000Z"
    });

    assert.deepEqual(stub.calls[0], {
      name: "validate_volunteer_join_code",
      params: {
        checked_at: "2026-06-06T09:00:00.000Z",
        input_client_session_id: "client-1",
        raw_join_code: "RICE123",
        volunteer_display_name: "  Gopal  "
      }
    });
    assert.equal(session?.id, "session-1");
    assert.equal(session?.displayName, "Gopal");
    assert.equal(session?.organizationId, "org-from-rpc");
    assert.equal(session?.templeId, "temple-from-rpc");
  });

  it("returns null for invalid, expired, and revoked join-code attempts", async () => {
    const { repository, stub } = createRepository({
      validate_volunteer_join_code: []
    });

    const invalid = await repository.validateJoinCode({
      clientSessionId: "client-1",
      displayName: "Gopal",
      joinCode: "wrong-code",
      now: "2026-06-06T09:00:00.000Z"
    });
    const expired = await repository.validateJoinCode({
      clientSessionId: "client-1",
      displayName: "Gopal",
      joinCode: "EXPIRED123",
      now: "2026-06-06T09:00:00.000Z"
    });
    const revoked = await repository.validateJoinCode({
      clientSessionId: "client-1",
      displayName: "Gopal",
      joinCode: "REVOKED123",
      now: "2026-06-06T09:00:00.000Z"
    });

    assert.equal(invalid, null);
    assert.equal(expired, null);
    assert.equal(revoked, null);
    assert.deepEqual(
      stub.calls.map((call) => call.name),
      [
        "validate_volunteer_join_code",
        "validate_volunteer_join_code",
        "validate_volunteer_join_code"
      ]
    );
  });

  it("restores active sessions through the restoration RPC", async () => {
    const { repository, stub } = createRepository({
      restore_volunteer_session: [createRpcRow()]
    });

    const session = await repository.findActiveSessionById({
      clientSessionId: "client-1",
      now: "2026-06-06T10:00:00.000Z",
      sessionId: "session-1"
    });

    assert.deepEqual(stub.calls[0], {
      name: "restore_volunteer_session",
      params: {
        checked_at: "2026-06-06T10:00:00.000Z",
        expected_client_session_id: "client-1",
        volunteer_session_id: "session-1"
      }
    });
    assert.equal(session?.id, "session-1");
    assert.equal(session?.clientSessionId, "client-1");
  });

  it("returns null when restoration fails or lacks a client session id", async () => {
    const { repository, stub } = createRepository({
      restore_volunteer_session: []
    });

    const failed = await repository.findActiveSessionById({
      clientSessionId: "other-client",
      now: "2026-06-06T10:00:00.000Z",
      sessionId: "session-1"
    });
    const missingClientSession = await repository.findActiveSessionById({
      now: "2026-06-06T10:00:00.000Z",
      sessionId: "session-1"
    });

    assert.equal(failed, null);
    assert.equal(missingClientSession, null);
    assert.equal(stub.calls.length, 1);
  });

  it("refreshes last seen through the refresh RPC", async () => {
    const { repository, stub } = createRepository({
      refresh_volunteer_session: [
        createRpcRow({
          last_seen_at: "2026-06-06T10:30:00.000Z"
        })
      ]
    });

    const session = await repository.refreshSession({
      clientSessionId: "client-1",
      lastSeenAt: "2026-06-06T10:30:00.000Z",
      now: "2026-06-06T10:30:00.000Z",
      sessionId: "session-1"
    });

    assert.deepEqual(stub.calls[0], {
      name: "refresh_volunteer_session",
      params: {
        expected_client_session_id: "client-1",
        refreshed_at: "2026-06-06T10:30:00.000Z",
        volunteer_session_id: "session-1"
      }
    });
    assert.equal(session?.lastSeenAt, "2026-06-06T10:30:00.000Z");
  });

  it("skips refresh and cleanup when no client session id is available", async () => {
    const { repository, stub } = createRepository();

    const refreshed = await repository.refreshSession({
      lastSeenAt: "2026-06-06T10:30:00.000Z",
      now: "2026-06-06T10:30:00.000Z",
      sessionId: "session-1"
    });
    await repository.clearClientSession({
      sessionId: "session-1"
    });

    assert.equal(refreshed, null);
    assert.equal(stub.calls.length, 0);
  });

  it("clears client session id through the logout cleanup RPC", async () => {
    const { repository, stub } = createRepository();

    await repository.clearClientSession({
      clientSessionId: "client-1",
      sessionId: "session-1"
    });

    assert.deepEqual(stub.calls[0], {
      name: "clear_volunteer_client_session",
      params: {
        expected_client_session_id: "client-1",
        volunteer_session_id: "session-1"
      }
    });
  });

  it("propagates repository RPC failures", async () => {
    const { repository, stub } = createRepository();
    stub.nextError = new Error("rpc failed");

    await assert.rejects(
      () =>
        repository.validateJoinCode({
          clientSessionId: "client-1",
          displayName: "Gopal",
          joinCode: "ACTIVE123",
          now: "2026-06-06T09:00:00.000Z"
        }),
      /rpc failed/
    );
  });
});
