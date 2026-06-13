import type { TemporaryVolunteerSession } from "@krishnas-kitchen/types";

import { createUuid } from "@/shared/lib/uuid";

const storageKey = "krishnas-kitchen:temporary-volunteer-session";
const sessionDurationMs = 4 * 60 * 60 * 1000;

type TemporaryVolunteerInput = {
  displayName: string;
  organizationId: string;
  templeId: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function createTemporaryVolunteerSession(
  input: TemporaryVolunteerInput
): TemporaryVolunteerSession {
  const now = new Date();

  return {
    id: createUuid(),
    displayName: input.displayName.trim(),
    organizationId: input.organizationId.trim(),
    templeId: input.templeId.trim(),
    startedAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + sessionDurationMs).toISOString()
  };
}

export function isTemporaryVolunteerSessionExpired(
  session: Pick<TemporaryVolunteerSession, "expiresAt">,
  now = Date.now()
): boolean {
  const expiresAt = Date.parse(session.expiresAt);

  return Number.isNaN(expiresAt) || expiresAt <= now;
}

export function getTemporaryVolunteerSessionTimeRemaining(
  session: Pick<TemporaryVolunteerSession, "expiresAt">,
  now = Date.now()
): number {
  const expiresAt = Date.parse(session.expiresAt);

  return Number.isNaN(expiresAt) ? 0 : Math.max(expiresAt - now, 0);
}

export function isValidTemporaryVolunteerSession(
  value: unknown,
  now = Date.now()
): value is TemporaryVolunteerSession {
  if (!isRecord(value)) {
    return false;
  }

  const session = value;

  return (
    isNonEmptyString(session.id) &&
    isNonEmptyString(session.displayName) &&
    isNonEmptyString(session.organizationId) &&
    isNonEmptyString(session.templeId) &&
    isNonEmptyString(session.startedAt) &&
    isNonEmptyString(session.expiresAt) &&
    !Number.isNaN(Date.parse(session.startedAt)) &&
    !isTemporaryVolunteerSessionExpired({ expiresAt: session.expiresAt }, now)
  );
}

export function loadTemporaryVolunteerSession(): TemporaryVolunteerSession | null {
  const rawValue = window.localStorage.getItem(storageKey);

  if (!rawValue) {
    return null;
  }

  try {
    const session = JSON.parse(rawValue) as unknown;

    if (!isValidTemporaryVolunteerSession(session)) {
      clearTemporaryVolunteerSession();
      return null;
    }

    return session;
  } catch {
    clearTemporaryVolunteerSession();
    return null;
  }
}

export function saveTemporaryVolunteerSession(session: TemporaryVolunteerSession): void {
  window.localStorage.setItem(storageKey, JSON.stringify(session));
}

export function clearTemporaryVolunteerSession(): void {
  window.localStorage.removeItem(storageKey);
}
