# Auth Role Migration Notes

## Canonical Role Set

The app, documentation, and database should use this permanent role set:

- `volunteer`
- `cook`
- `senior_cook`
- `inventory_manager`
- `temple_admin`
- `super_admin`

Older frontend-only roles should not be used:

- `owner`
- `admin`
- `manager`
- `viewer`

## Permission Changes

The previous broad `inventory:write` permission has been replaced by granular inventory permissions:

- `inventory.read`
- `inventory.receive`
- `inventory.transfer`
- `inventory.consume`
- `inventory.return`
- `inventory.adjust`
- `inventory.undo`

Colon-style permissions such as `inventory:read`, `items:read`, and `volunteer:sessions` should be migrated to dot-style names such as `inventory.read`, `items.read`, and `volunteer_sessions.create`.

## Suggested Data Migration Mapping

If existing user metadata or database rows contain old roles, migrate them before enabling production authorization:

| Old role | New role |
|---|---|
| `owner` | `super_admin` |
| `admin` | `temple_admin` |
| `manager` | `inventory_manager` |
| `viewer` | `volunteer` |
| `volunteer` | `volunteer` |

If a user needs kitchen authority without inventory administration, assign `cook` or `senior_cook` explicitly after review.

## RLS Notes

Client-side permissions are only UI hints. Supabase RLS policies should reference the canonical role names and the granular inventory permissions implied by each role. Temporary volunteer sessions should remain server-verified before they are allowed to write operational records.
