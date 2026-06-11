import type { TemporaryVolunteerSession } from "@krishnas-kitchen/types";

import type { VolunteerSessionRepository } from "./volunteerSessionRepository";
import {
  createStoredVolunteerSessionReference,
  type StoredVolunteerSessionReference,
  type ValidatedVolunteerSession
} from "../domain/volunteerSession";

export type VolunteerAuthSession = {
  storedReference: StoredVolunteerSessionReference;
  temporarySession: TemporaryVolunteerSession;
};

export function mapValidatedVolunteerSessionToTemporarySession(
  session: ValidatedVolunteerSession
): TemporaryVolunteerSession {
  return {
    displayName: session.displayName,
    expiresAt: session.expiresAt,
    id: session.id,
    organizationId: session.organizationId,
    startedAt: session.startedAt ?? session.lastSeenAt ?? new Date().toISOString(),
    templeId: session.templeId
  };
}

export function createVolunteerAuthSession(
  session: ValidatedVolunteerSession
): VolunteerAuthSession | null {
  const storedReference = createStoredVolunteerSessionReference(session);

  if (!storedReference) {
    return null;
  }

  return {
    storedReference,
    temporarySession: mapValidatedVolunteerSessionToTemporarySession(session)
  };
}

export function canRestoreStoredVolunteerSession(
  storedSession: StoredVolunteerSessionReference | null
): storedSession is StoredVolunteerSessionReference {
  return storedSession !== null;
}

export async function validateVolunteerLogin(
  repository: VolunteerSessionRepository,
  input: {
    clientSessionId: string;
    displayName: string;
    joinCode: string;
    now: string;
  }
): Promise<VolunteerAuthSession | null> {
  const validatedSession = await repository.validateJoinCode(input);

  return validatedSession ? createVolunteerAuthSession(validatedSession) : null;
}

export async function restoreVolunteerSession(
  repository: VolunteerSessionRepository,
  input: {
    clientSessionId: string;
    now: string;
    sessionId: string;
  }
): Promise<VolunteerAuthSession | null> {
  const validatedSession = await repository.findActiveSessionById(input);

  return validatedSession ? createVolunteerAuthSession(validatedSession) : null;
}

export async function clearVolunteerClientSessionBestEffort(
  repository: VolunteerSessionRepository | null,
  session: Pick<StoredVolunteerSessionReference, "clientSessionId" | "sessionId"> | null
): Promise<void> {
  if (!repository || !session) {
    return;
  }

  try {
    await repository.clearClientSession({
      clientSessionId: session.clientSessionId,
      sessionId: session.sessionId
    });
  } catch {
    // Local logout must not be blocked by best-effort server cleanup.
  }
}

export async function completeVolunteerLogout(input: {
  clearStoredSession: () => void;
  clearTemporarySession: () => void;
  repository: VolunteerSessionRepository | null;
  signOutAuthenticatedUser?: () => Promise<void>;
  storedSession: Pick<StoredVolunteerSessionReference, "clientSessionId" | "sessionId"> | null;
  temporarySession: Pick<TemporaryVolunteerSession, "id"> | null;
}): Promise<void> {
  input.clearStoredSession();
  input.clearTemporarySession();
  await clearVolunteerClientSessionBestEffort(input.repository, input.storedSession);
  await input.signOutAuthenticatedUser?.();
}
