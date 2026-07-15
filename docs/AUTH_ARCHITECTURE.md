# Authentication and Authorization Architecture

## Structure

```text
apps/web/src/
  app/
    providers/          # App-wide provider composition
    routes/             # Tiny route layer and guards
    screens/            # App-shell screens with no domain workflows
  features/auth/
    components/         # Auth-specific loading and state components
    hooks/              # App-facing auth hooks
    lib/                # Permission, metadata, and session helpers
    providers/          # Role-aware and organization-scoped auth context
    screens/            # Login, temple selection, unauthorized screens
  shared/integrations/
    supabase/           # Low-level Supabase client and session source
packages/types/src/     # Shared auth models, roles, permissions, DB shape
```

## Design

Supabase Auth remains the source of browser session persistence. `SupabaseAuthProvider` owns the low-level session subscription and client reference. `AuthProvider` converts that session into app-facing state: profile, organization, selected temple, roles, permissions, and temporary volunteer mode.

Route protection happens in `RouteGuard`. It supports authenticated routes, temple-scoped routes, and permission-gated routes. The current route layer is intentionally small and dependency-free until the app has enough navigation complexity to justify a router package.

## Authorization Model

Roles map to a small permission set in `features/auth/lib/permissions.ts`. These helpers are for UI gating and ergonomics only. Database authorization should still be enforced through Supabase row-level security policies.

Canonical permanent roles are:

- `volunteer`
- `cook`
- `senior_cook`
- `inventory_manager`
- `temple_admin`
- `super_admin`

Inventory permissions are intentionally granular:

- `inventory.read`
- `inventory.receive`
- `inventory.transfer`
- `inventory.consume`
- `inventory.return`
- `inventory.adjust`
- `inventory.undo`

Temporary volunteer sessions are time-limited, server-verified session modes. In the browser they receive only read/session permissions:

- `locations.read`
- `items.read`
- `inventory.read`
- `volunteer_sessions.create`

They do not receive `inventory.receive`, `inventory.transfer`, `inventory.consume`, `inventory.return`, `inventory.adjust`, `inventory.undo`, item editing, audit, user, role, temple, organization, or other administrative permissions. Expired or malformed temporary sessions are cleared during hydration, and active temporary sessions are cleared automatically when their expiration time is reached.

## Assumptions

- Supabase `app_metadata` will eventually include `organization_id`, `organization_name`, `profile_id`, `roles`, and `temples`.
- Temple selection is local session context for now. RLS remains the final source of authorization.
- No business workflows, inventory screens, or recipe flows are included in this foundation.
- Temporary volunteer sessions are server-verified, but operational write permissions remain out of scope until an approved server-enforced write model exists.

## Future Extension Notes

- Replace metadata-derived profiles with a typed profile query once RLS policies are implemented.
- Persist selected temple in a server-backed preference if users frequently switch devices.
- Add route definitions beside real feature modules as the app grows.
- Generate Supabase database types and replace the placeholder `Database` type.
- Move temporary volunteer session issuance behind a server-side function before production use.
