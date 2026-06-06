export { AuthProvider } from "./providers/AuthProvider";
export { useAuth } from "./hooks/useAuth";
export { AuthLoadingScreen } from "./components/AuthLoadingScreen";
export { LoginScreen } from "./screens/LoginScreen";
export { TempleSelectionScreen } from "./screens/TempleSelectionScreen";
export { UnauthorizedScreen } from "./screens/UnauthorizedScreen";
export {
  getPermissionsForRoles,
  hasAnyPermission,
  hasPermission,
  isPrivilegedRole
} from "./lib/permissions";
export type { VolunteerSessionRepository } from "./application/volunteerSessionRepository";
export {
  createStoredVolunteerSessionReference,
  normalizeVolunteerJoinCode,
  type ClearVolunteerSessionClientInput,
  type FindActiveVolunteerSessionInput,
  type RefreshVolunteerSessionInput,
  type StoredVolunteerSessionReference,
  type ValidatedVolunteerSession,
  type ValidateVolunteerJoinCodeInput,
  type VolunteerJoinCode
} from "./domain/volunteerSession";
export {
  clearStoredVolunteerSession,
  createStoredVolunteerSessionValidationInput,
  getStoredVolunteerSessionTimeRemaining,
  loadStoredVolunteerSession,
  saveStoredVolunteerSession
} from "./lib/volunteerSessionStorage";
export { createSupabaseVolunteerSessionRepository } from "./infrastructure/supabase/supabaseVolunteerSessionRepository";
