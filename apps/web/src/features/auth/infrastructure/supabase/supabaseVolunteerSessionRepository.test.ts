import assert from "node:assert/strict";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@krishnas-kitchen/types";
import { describe, it } from "vitest";

import { createSupabaseVolunteerSessionRepository } from "./supabaseVolunteerSessionRepository";
import type { VolunteerSessionRow, VolunteerSessionUpdate } from "./volunteerSessionMapper";

type SupabaseResult<T> = {
  data: T;
  error: null;
};

class VolunteerSessionQuery implements PromiseLike<SupabaseResult<null>> {
  private filters: Array<(row: VolunteerSessionRow) => boolean> = [];
  private pendingUpdate: VolunteerSessionUpdate | null = null;

  constructor(
    private readonly rows: VolunteerSessionRow[],
    private readonly stub: SupabaseClientStub
  ) {}

  eq<K extends keyof VolunteerSessionRow>(column: K, value: VolunteerSessionRow[K]): this {
    this.filters.push((row) => row[column] === value);
    return this;
  }

  gt<K extends keyof VolunteerSessionRow>(column: K, value: VolunteerSessionRow[K]): this {
    this.filters.push((row) => String(row[column]) > String(value));
    return this;
  }

  maybeSingle(): Promise<SupabaseResult<VolunteerSessionRow | null>> {
    return Promise.resolve({
      data: this.apply()[0] ?? null,
      error: null
    });
  }

  select(_columns: string): this {
    return this;
  }

  single(): Promise<SupabaseResult<VolunteerSessionRow>> {
    const row = this.apply()[0];

    if (!row) {
      throw new Error("No volunteer_sessions row matched single query.");
    }

    return Promise.resolve({
      data: row,
      error: null
    });
  }

  then<TResult1 = SupabaseResult<null>, TResult2 = never>(
    onfulfilled?: ((value: SupabaseResult<null>) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ): PromiseLike<TResult1 | TResult2> {
    this.apply();

    return Promise.resolve({
      data: null,
      error: null
    }).then(onfulfilled, onrejected);
  }

  update(payload: VolunteerSessionUpdate): this {
    this.pendingUpdate = payload;
    this.stub.updated = payload;
    return this;
  }

  private apply(): VolunteerSessionRow[] {
    let values = this.rows.filter((row) => this.filters.every((filter) => filter(row)));

    if (this.pendingUpdate) {
      values = values.map((row) => {
        const updated = {
          ...row,
          ...this.pendingUpdate,
          updated_at: this.pendingUpdate?.updated_at ?? row.updated_at
        };
        const index = this.rows.findIndex((existingRow) => existingRow.id === row.id);

        if (index >= 0) {
          this.rows[index] = updated;
        }

        return updated;
      });
      this.pendingUpdate = null;
    }

    return values;
  }
}

class SupabaseClientStub {
  readonly tables: string[] = [];
  updated: VolunteerSessionUpdate | null = null;

  constructor(readonly rows: VolunteerSessionRow[]) {}

  from(table: "volunteer_sessions"): VolunteerSessionQuery {
    this.tables.push(table);
    return new VolunteerSessionQuery(this.rows, this);
  }
}

function createRow(overrides: Partial<VolunteerSessionRow> = {}): VolunteerSessionRow {
  return {
    client_session_id: null,
    created_at: "2026-06-06T08:00:00.000Z",
    created_by_user_id: "manager-1",
    display_name: null,
    expires_at: "2026-06-06T12:00:00.000Z",
    id: "session-1",
    join_code: "RICE123",
    last_seen_at: null,
    organization_id: "org-from-db",
    revocation_reason: null,
    revoked_at: null,
    revoked_by_user_id: null,
    role: "temp_receiver",
    session_name: "Morning receiving",
    started_at: null,
    status: "active",
    temple_id: "temple-from-db",
    updated_at: "2026-06-06T08:00:00.000Z",
    ...overrides
  };
}

function createRepository(rows: VolunteerSessionRow[]) {
  const stub = new SupabaseClientStub(rows);

  return {
    repository: createSupabaseVolunteerSessionRepository(
      stub as unknown as SupabaseClient<Database>
    ),
    stub
  };
}

describe("Supabase volunteer session repository", () => {
  it("validates an active join code and persists runtime session fields", async () => {
    const { repository, stub } = createRepository([createRow()]);

    const session = await repository.validateJoinCode({
      clientSessionId: "client-1",
      displayName: "  Gopal  ",
      joinCode: " rice 123 ",
      now: "2026-06-06T09:00:00.000Z"
    });

    assert.equal(stub.tables[0], "volunteer_sessions");
    assert.equal(stub.updated?.client_session_id, "client-1");
    assert.equal(stub.updated?.display_name, "Gopal");
    assert.equal(stub.updated?.last_seen_at, "2026-06-06T09:00:00.000Z");
    assert.equal(stub.updated?.started_at, "2026-06-06T09:00:00.000Z");
    assert.equal(session?.id, "session-1");
    assert.equal(session?.displayName, "Gopal");
  });

  it("returns null for an invalid join code", async () => {
    const { repository, stub } = createRepository([createRow()]);

    const session = await repository.validateJoinCode({
      clientSessionId: "client-1",
      displayName: "Gopal",
      joinCode: "wrong-code",
      now: "2026-06-06T09:00:00.000Z"
    });

    assert.equal(session, null);
    assert.equal(stub.updated, null);
  });

  it("rejects expired and revoked sessions during join-code validation", async () => {
    const expired = createRow({
      expires_at: "2026-06-06T08:59:59.000Z",
      id: "expired"
    });
    const revoked = createRow({
      id: "revoked",
      join_code: "REVOKED123",
      status: "revoked"
    });
    const { repository, stub } = createRepository([expired, revoked]);

    const expiredSession = await repository.validateJoinCode({
      clientSessionId: "client-1",
      displayName: "Gopal",
      joinCode: "RICE123",
      now: "2026-06-06T09:00:00.000Z"
    });
    const revokedSession = await repository.validateJoinCode({
      clientSessionId: "client-1",
      displayName: "Gopal",
      joinCode: "REVOKED123",
      now: "2026-06-06T09:00:00.000Z"
    });

    assert.equal(expiredSession, null);
    assert.equal(revokedSession, null);
    assert.equal(stub.updated, null);
  });

  it("restores active sessions with matching client session id", async () => {
    const { repository } = createRepository([
      createRow({
        client_session_id: "client-1",
        display_name: "Gopal",
        last_seen_at: "2026-06-06T09:00:00.000Z",
        started_at: "2026-06-06T09:00:00.000Z"
      })
    ]);

    const session = await repository.findActiveSessionById({
      clientSessionId: "client-1",
      now: "2026-06-06T10:00:00.000Z",
      sessionId: "session-1"
    });
    const mismatch = await repository.findActiveSessionById({
      clientSessionId: "other-client",
      now: "2026-06-06T10:00:00.000Z",
      sessionId: "session-1"
    });

    assert.equal(session?.id, "session-1");
    assert.equal(session?.clientSessionId, "client-1");
    assert.equal(mismatch, null);
  });

  it("refreshes last seen only for active, non-expired sessions", async () => {
    const { repository, stub } = createRepository([
      createRow({
        client_session_id: "client-1",
        display_name: "Gopal",
        started_at: "2026-06-06T09:00:00.000Z"
      })
    ]);

    const session = await repository.refreshSession({
      clientSessionId: "client-1",
      lastSeenAt: "2026-06-06T10:30:00.000Z",
      now: "2026-06-06T10:30:00.000Z",
      sessionId: "session-1"
    });

    assert.equal(stub.updated?.last_seen_at, "2026-06-06T10:30:00.000Z");
    assert.equal(session?.lastSeenAt, "2026-06-06T10:30:00.000Z");
  });

  it("clears client session id with optional client matching", async () => {
    const row = createRow({
      client_session_id: "client-1",
      display_name: "Gopal",
      started_at: "2026-06-06T09:00:00.000Z"
    });
    const { repository, stub } = createRepository([row]);

    await repository.clearClientSession({
      clientSessionId: "client-1",
      sessionId: "session-1"
    });

    assert.equal(stub.updated?.client_session_id, null);
    assert.equal(stub.rows[0]?.client_session_id, null);
  });

  it("derives organization and temple from the server row", async () => {
    const { repository } = createRepository([
      createRow({
        client_session_id: "client-1",
        organization_id: "org-server",
        temple_id: "temple-server"
      })
    ]);

    const session = await repository.findActiveSessionById({
      clientSessionId: "client-1",
      now: "2026-06-06T09:00:00.000Z",
      sessionId: "session-1"
    });

    assert.equal(session?.organizationId, "org-server");
    assert.equal(session?.templeId, "temple-server");
  });
});
