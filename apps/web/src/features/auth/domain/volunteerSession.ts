import type { EntityId, TemporaryVolunteerRole } from "@krishnas-kitchen/types";

export type VolunteerJoinCode = string;

export type ValidatedVolunteerSession = {
  clientSessionId: string | null;
  displayName: string;
  expiresAt: string;
  id: EntityId;
  lastSeenAt: string | null;
  organizationId: EntityId;
  role: TemporaryVolunteerRole;
  startedAt: string | null;
  templeId: EntityId;
};

export type StoredVolunteerSessionReference = {
  clientSessionId: string;
  displayName: string;
  expiresAt: string;
  sessionId: EntityId;
};

export type ValidateVolunteerJoinCodeInput = {
  clientSessionId: string;
  displayName: string;
  joinCode: VolunteerJoinCode;
  now: string;
};

export type FindActiveVolunteerSessionInput = {
  clientSessionId?: string;
  now: string;
  sessionId: EntityId;
};

export type RefreshVolunteerSessionInput = {
  clientSessionId?: string;
  lastSeenAt: string;
  now: string;
  sessionId: EntityId;
};

export type ClearVolunteerSessionClientInput = {
  clientSessionId?: string;
  sessionId: EntityId;
};

export function normalizeVolunteerJoinCode(joinCode: VolunteerJoinCode): VolunteerJoinCode {
  return joinCode.trim().toUpperCase().replace(/\s+/g, "");
}

export function createStoredVolunteerSessionReference(
  session: Pick<ValidatedVolunteerSession, "clientSessionId" | "displayName" | "expiresAt" | "id">
): StoredVolunteerSessionReference | null {
  if (!session.clientSessionId) {
    return null;
  }

  return {
    clientSessionId: session.clientSessionId,
    displayName: session.displayName,
    expiresAt: session.expiresAt,
    sessionId: session.id
  };
}
