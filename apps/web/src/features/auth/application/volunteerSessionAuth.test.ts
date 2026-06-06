import assert from "node:assert/strict";
import { describe, it } from "vitest";

import type { VolunteerSessionRepository } from "./volunteerSessionRepository";
import {
  completeVolunteerLogout,
  createVolunteerAuthSession,
  mapValidatedVolunteerSessionToTemporarySession,
  restoreVolunteerSession,
  validateVolunteerLogin
} from "./volunteerSessionAuth";
import type { ValidatedVolunteerSession } from "../domain/volunteerSession";

function createValidatedSession(
  overrides: Partial<ValidatedVolunteerSession> = {}
): ValidatedVolunteerSession {
  return {
    clientSessionId: "client-session-1",
    displayName: "Gopal",
    expiresAt: "2026-06-06T12:00:00.000Z",
    id: "volunteer-session-1",
    lastSeenAt: "2026-06-06T09:30:00.000Z",
    organizationId: "org-from-db",
    role: "temp_receiver",
    startedAt: "2026-06-06T09:00:00.000Z",
    templeId: "temple-from-db",
    ...overrides
  };
}

function createRepository(
  options: {
    activeSession?: ValidatedVolunteerSession | null;
    clearFails?: boolean;
    joinCodeSession?: ValidatedVolunteerSession | null;
  } = {}
): VolunteerSessionRepository & {
  clearCalls: string[];
  findCalls: Array<{ clientSessionId?: string; now: string; sessionId: string }>;
  validateCalls: Array<{
    clientSessionId: string;
    displayName: string;
    joinCode: string;
    now: string;
  }>;
} {
  const repository = {
    clearCalls: [] as string[],
    findCalls: [] as Array<{ clientSessionId?: string; now: string; sessionId: string }>,
    validateCalls: [] as Array<{
      clientSessionId: string;
      displayName: string;
      joinCode: string;
      now: string;
    }>,
    clearClientSession(input: { sessionId: string }) {
      repository.clearCalls.push(input.sessionId);

      return options.clearFails ? Promise.reject(new Error("cleanup failed")) : Promise.resolve();
    },
    findActiveSessionById(input: { clientSessionId?: string; now: string; sessionId: string }) {
      repository.findCalls.push(input);

      return Promise.resolve(options.activeSession ?? null);
    },
    refreshSession() {
      return Promise.resolve(options.activeSession ?? null);
    },
    validateJoinCode(input: {
      clientSessionId: string;
      displayName: string;
      joinCode: string;
      now: string;
    }) {
      repository.validateCalls.push(input);

      return Promise.resolve(options.joinCodeSession ?? null);
    }
  };

  return repository;
}

describe("volunteer session auth helpers", () => {
  it("maps validated volunteer sessions into the existing temporary auth session shape", () => {
    const session = mapValidatedVolunteerSessionToTemporarySession(createValidatedSession());

    assert.deepEqual(session, {
      displayName: "Gopal",
      expiresAt: "2026-06-06T12:00:00.000Z",
      id: "volunteer-session-1",
      organizationId: "org-from-db",
      startedAt: "2026-06-06T09:00:00.000Z",
      templeId: "temple-from-db"
    });
  });

  it("creates a restorable auth session from a validated repository session", () => {
    const authSession = createVolunteerAuthSession(createValidatedSession());

    assert.deepEqual(authSession, {
      storedReference: {
        clientSessionId: "client-session-1",
        displayName: "Gopal",
        expiresAt: "2026-06-06T12:00:00.000Z",
        sessionId: "volunteer-session-1"
      },
      temporarySession: {
        displayName: "Gopal",
        expiresAt: "2026-06-06T12:00:00.000Z",
        id: "volunteer-session-1",
        organizationId: "org-from-db",
        startedAt: "2026-06-06T09:00:00.000Z",
        templeId: "temple-from-db"
      }
    });
  });

  it("rejects validated sessions that lack client-session attribution", () => {
    const authSession = createVolunteerAuthSession(
      createValidatedSession({
        clientSessionId: null
      })
    );

    assert.equal(authSession, null);
  });

  it("validates volunteer login through the repository and derives scope from the result", async () => {
    const repository = createRepository({
      joinCodeSession: createValidatedSession({
        organizationId: "org-server",
        templeId: "temple-server"
      })
    });

    const authSession = await validateVolunteerLogin(repository, {
      clientSessionId: "client-session-1",
      displayName: "Gopal",
      joinCode: "RICE123",
      now: "2026-06-06T09:00:00.000Z"
    });

    assert.deepEqual(repository.validateCalls, [
      {
        clientSessionId: "client-session-1",
        displayName: "Gopal",
        joinCode: "RICE123",
        now: "2026-06-06T09:00:00.000Z"
      }
    ]);
    assert.equal(authSession?.temporarySession.organizationId, "org-server");
    assert.equal(authSession?.temporarySession.templeId, "temple-server");
  });

  it("does not establish volunteer auth when join-code validation fails", async () => {
    const repository = createRepository({
      joinCodeSession: null
    });

    const authSession = await validateVolunteerLogin(repository, {
      clientSessionId: "client-session-1",
      displayName: "Gopal",
      joinCode: "BADCODE",
      now: "2026-06-06T09:00:00.000Z"
    });

    assert.equal(authSession, null);
  });

  it("returns null for failed restore so stored sessions can be cleared", async () => {
    const repository = createRepository({
      activeSession: null
    });

    const authSession = await restoreVolunteerSession(repository, {
      clientSessionId: "client-session-1",
      now: "2026-06-06T09:00:00.000Z",
      sessionId: "volunteer-session-1"
    });

    assert.deepEqual(repository.findCalls, [
      {
        clientSessionId: "client-session-1",
        now: "2026-06-06T09:00:00.000Z",
        sessionId: "volunteer-session-1"
      }
    ]);
    assert.equal(authSession, null);
  });

  it("clears local volunteer auth even when repository logout cleanup fails", async () => {
    const repository = createRepository({
      clearFails: true
    });
    const events: string[] = [];

    await completeVolunteerLogout({
      clearStoredSession() {
        events.push("clear-storage");
      },
      clearTemporarySession() {
        events.push("clear-state");
      },
      repository,
      temporarySession: {
        id: "volunteer-session-1"
      }
    });

    assert.deepEqual(events, ["clear-storage", "clear-state"]);
    assert.deepEqual(repository.clearCalls, ["volunteer-session-1"]);
  });

  it("keeps authenticated-user signout behavior when no temporary session exists", async () => {
    const events: string[] = [];

    await completeVolunteerLogout({
      clearStoredSession() {
        events.push("clear-storage");
      },
      clearTemporarySession() {
        events.push("clear-state");
      },
      repository: null,
      signOutAuthenticatedUser() {
        events.push("supabase-signout");
        return Promise.resolve();
      },
      temporarySession: null
    });

    assert.deepEqual(events, ["clear-storage", "clear-state", "supabase-signout"]);
  });
});
