import type { StoredVolunteerSessionReference } from "../domain/volunteerSession";

const storageKey = "krishnas-kitchen:temporary-volunteer-session";

type VolunteerSessionStorage = Pick<Storage, "getItem" | "removeItem" | "setItem">;

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isValidTimestamp(value: string): boolean {
  return !Number.isNaN(Date.parse(value));
}

function isStoredVolunteerSessionExpired(
  session: Pick<StoredVolunteerSessionReference, "expiresAt">,
  now = Date.now()
): boolean {
  const expiresAt = Date.parse(session.expiresAt);

  return Number.isNaN(expiresAt) || expiresAt <= now;
}

function getBrowserStorage(): VolunteerSessionStorage | null {
  return typeof window === "undefined" ? null : window.localStorage;
}

function parseStoredVolunteerSessionReference(
  value: unknown
): StoredVolunteerSessionReference | null {
  if (!isRecord(value)) {
    return null;
  }

  const sessionId = isNonEmptyString(value.sessionId)
    ? value.sessionId.trim()
    : isNonEmptyString(value.id)
      ? value.id.trim()
      : null;
  const clientSessionId = isNonEmptyString(value.clientSessionId)
    ? value.clientSessionId.trim()
    : isNonEmptyString(value.id)
      ? value.id.trim()
      : null;

  if (
    !sessionId ||
    !clientSessionId ||
    !isNonEmptyString(value.displayName) ||
    !isNonEmptyString(value.expiresAt)
  ) {
    return null;
  }

  const expiresAt = value.expiresAt.trim();

  if (!isValidTimestamp(expiresAt)) {
    return null;
  }

  return {
    clientSessionId,
    displayName: value.displayName.trim(),
    expiresAt,
    sessionId
  };
}

function serializeStoredVolunteerSessionReference(
  session: StoredVolunteerSessionReference
): string {
  return JSON.stringify({
    clientSessionId: session.clientSessionId,
    displayName: session.displayName,
    expiresAt: session.expiresAt,
    sessionId: session.sessionId
  });
}

export function loadStoredVolunteerSession(
  storage = getBrowserStorage(),
  now = Date.now()
): StoredVolunteerSessionReference | null {
  if (!storage) {
    return null;
  }

  const rawValue = storage.getItem(storageKey);

  if (!rawValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawValue) as unknown;
    const session = parseStoredVolunteerSessionReference(parsed);

    if (!session || isStoredVolunteerSessionExpired(session, now)) {
      clearStoredVolunteerSession(storage);
      return null;
    }

    const sanitizedValue = serializeStoredVolunteerSessionReference(session);
    if (sanitizedValue !== rawValue) {
      storage.setItem(storageKey, sanitizedValue);
    }

    return session;
  } catch {
    clearStoredVolunteerSession(storage);
    return null;
  }
}

export function saveStoredVolunteerSession(
  session: StoredVolunteerSessionReference,
  storage = getBrowserStorage()
): void {
  if (!storage) {
    return;
  }

  storage.setItem(storageKey, serializeStoredVolunteerSessionReference(session));
}

export function clearStoredVolunteerSession(storage = getBrowserStorage()): void {
  storage?.removeItem(storageKey);
}

export function getStoredVolunteerSessionTimeRemaining(
  session: Pick<StoredVolunteerSessionReference, "expiresAt">,
  now = Date.now()
): number {
  const expiresAt = Date.parse(session.expiresAt);

  return Number.isNaN(expiresAt) ? 0 : Math.max(expiresAt - now, 0);
}

export function createStoredVolunteerSessionValidationInput(
  session: StoredVolunteerSessionReference,
  now: string
) {
  return {
    clientSessionId: session.clientSessionId,
    now,
    sessionId: session.sessionId
  };
}
