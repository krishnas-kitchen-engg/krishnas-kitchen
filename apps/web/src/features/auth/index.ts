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
  normalizeVolunteerJoinCode,
  type ClearVolunteerSessionClientInput,
  type FindActiveVolunteerSessionInput,
  type RefreshVolunteerSessionInput,
  type ValidatedVolunteerSession,
  type ValidateVolunteerJoinCodeInput,
  type VolunteerJoinCode
} from "./domain/volunteerSession";
export { createSupabaseVolunteerSessionRepository } from "./infrastructure/supabase/supabaseVolunteerSessionRepository";
