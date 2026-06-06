import assert from "node:assert/strict";
import { describe, it } from "vitest";

import {
  clearStoredVolunteerSession,
  createStoredVolunteerSessionValidationInput,
  getStoredVolunteerSessionTimeRemaining,
  loadStoredVolunteerSession,
  saveStoredVolunteerSession
} from "./volunteerSessionStorage";

const storageKey = "krishnas-kitchen:temporary-volunteer-session";

class MemoryStorage implements Pick<Storage, "getItem" | "removeItem" | "setItem"> {
  readonly values = new Map<string, string>();

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  removeItem(key: string): void {
    this.values.delete(key);
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }
}

describe("volunteer session storage", () => {
  it("saves only the session reference fields", () => {
    const storage = new MemoryStorage();

    saveStoredVolunteerSession(
      {
        clientSessionId: "client-1",
        displayName: "Gopal",
        expiresAt: "2026-06-06T12:00:00.000Z",
        sessionId: "session-1"
      },
      storage
    );

    assert.deepEqual(JSON.parse(storage.getItem(storageKey) ?? "{}"), {
      clientSessionId: "client-1",
      displayName: "Gopal",
      expiresAt: "2026-06-06T12:00:00.000Z",
      sessionId: "session-1"
    });
  });

  it("loads a valid stored session reference", () => {
    const storage = new MemoryStorage();
    storage.setItem(
      storageKey,
      JSON.stringify({
        clientSessionId: "client-1",
        displayName: "Gopal",
        expiresAt: "2026-06-06T12:00:00.000Z",
        sessionId: "session-1"
      })
    );

    const session = loadStoredVolunteerSession(storage, Date.parse("2026-06-06T09:00:00.000Z"));

    assert.deepEqual(session, {
      clientSessionId: "client-1",
      displayName: "Gopal",
      expiresAt: "2026-06-06T12:00:00.000Z",
      sessionId: "session-1"
    });
  });

  it("clears a stored session reference", () => {
    const storage = new MemoryStorage();
    storage.setItem(storageKey, "{}");

    clearStoredVolunteerSession(storage);

    assert.equal(storage.getItem(storageKey), null);
  });

  it("cleans up malformed storage", () => {
    const storage = new MemoryStorage();
    storage.setItem(storageKey, "not-json");

    const session = loadStoredVolunteerSession(storage);

    assert.equal(session, null);
    assert.equal(storage.getItem(storageKey), null);
  });

  it("sanitizes legacy full temporary volunteer sessions without trusting scope fields", () => {
    const storage = new MemoryStorage();
    storage.setItem(
      storageKey,
      JSON.stringify({
        displayName: "  Gopal  ",
        expiresAt: "2026-06-06T12:00:00.000Z",
        id: "legacy-session-1",
        organizationId: "local-org",
        startedAt: "2026-06-06T08:00:00.000Z",
        templeId: "local-temple"
      })
    );

    const session = loadStoredVolunteerSession(storage, Date.parse("2026-06-06T09:00:00.000Z"));

    assert.deepEqual(session, {
      clientSessionId: "legacy-session-1",
      displayName: "Gopal",
      expiresAt: "2026-06-06T12:00:00.000Z",
      sessionId: "legacy-session-1"
    });
    assert.deepEqual(JSON.parse(storage.getItem(storageKey) ?? "{}"), {
      clientSessionId: "legacy-session-1",
      displayName: "Gopal",
      expiresAt: "2026-06-06T12:00:00.000Z",
      sessionId: "legacy-session-1"
    });
  });

  it("cleans up invalid or expired stored references", () => {
    const invalidStorage = new MemoryStorage();
    invalidStorage.setItem(
      storageKey,
      JSON.stringify({
        clientSessionId: "client-1",
        displayName: "Gopal",
        expiresAt: "not-a-date",
        sessionId: "session-1"
      })
    );

    const expiredStorage = new MemoryStorage();
    expiredStorage.setItem(
      storageKey,
      JSON.stringify({
        clientSessionId: "client-1",
        displayName: "Gopal",
        expiresAt: "2026-06-06T08:59:59.000Z",
        sessionId: "session-1"
      })
    );

    assert.equal(loadStoredVolunteerSession(invalidStorage), null);
    assert.equal(invalidStorage.getItem(storageKey), null);
    assert.equal(
      loadStoredVolunteerSession(expiredStorage, Date.parse("2026-06-06T09:00:00.000Z")),
      null
    );
    assert.equal(expiredStorage.getItem(storageKey), null);
  });

  it("creates future repository restoration input from a stored reference", () => {
    const input = createStoredVolunteerSessionValidationInput(
      {
        clientSessionId: "client-1",
        displayName: "Gopal",
        expiresAt: "2026-06-06T12:00:00.000Z",
        sessionId: "session-1"
      },
      "2026-06-06T09:00:00.000Z"
    );

    assert.deepEqual(input, {
      clientSessionId: "client-1",
      now: "2026-06-06T09:00:00.000Z",
      sessionId: "session-1"
    });
  });

  it("calculates time remaining without reading trusted scope data", () => {
    assert.equal(
      getStoredVolunteerSessionTimeRemaining(
        { expiresAt: "2026-06-06T10:00:00.000Z" },
        Date.parse("2026-06-06T09:30:00.000Z")
      ),
      30 * 60 * 1000
    );
  });
});
