import type {
  ClearVolunteerSessionClientInput,
  FindActiveVolunteerSessionInput,
  RefreshVolunteerSessionInput,
  ValidatedVolunteerSession,
  ValidateVolunteerJoinCodeInput
} from "../domain/volunteerSession";

export type VolunteerSessionRepository = {
  clearClientSession(input: ClearVolunteerSessionClientInput): Promise<void>;
  findActiveSessionById(
    input: FindActiveVolunteerSessionInput
  ): Promise<ValidatedVolunteerSession | null>;
  refreshSession(input: RefreshVolunteerSessionInput): Promise<ValidatedVolunteerSession | null>;
  validateJoinCode(
    input: ValidateVolunteerJoinCodeInput
  ): Promise<ValidatedVolunteerSession | null>;
};
