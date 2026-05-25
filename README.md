# Krishna's Kitchen

Krishna's Kitchen is a mobile-first Progressive Web App (PWA) for temple kitchen operations and inventory management.

Built on the SevaOps platform architecture.

## Goals

- Reliable inventory tracking
- Fast volunteer workflows
- Barcode/QR scanning
- Offline-capable operations
- Feast preparation support
- Operational simplicity

## Status

Currently in active development.

## Stack

- pnpm workspaces
- React + Vite
- TypeScript strict mode with project references
- Tailwind CSS
- Vite PWA plugin with generated service worker
- ESLint flat config
- Prettier
- Husky + lint-staged
- Supabase-ready environment and integration boundary

## Workspace Layout

```text
apps/
  web/                    # Mobile-first React PWA
    src/
      app/                # Composition root, providers, routes
      domains/            # Domain models and rules, added by feature area
      features/           # User-facing workflows, added incrementally
      shared/             # Cross-feature config, integrations, styles, UI
packages/
  ui/                     # Reusable React UI primitives
  types/                  # Shared TypeScript contracts
  utils/                  # Framework-neutral helpers
infra/
  supabase/               # Future migrations, seeds, functions, local config
docs/                     # Product and architecture documentation
```

## Getting Started

Install dependencies:

```bash
pnpm install
```

Copy local environment values:

```bash
cp .env.local.example .env.local
```

Start the PWA:

```bash
pnpm dev
```

Build every workspace:

```bash
pnpm build
```

Run quality checks:

```bash
pnpm typecheck
pnpm lint
pnpm format
```

## Environment Variables

Only `VITE_` variables are exposed to the browser app.

```text
VITE_APP_NAME
VITE_APP_ENV
VITE_APP_URL
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

Keep secrets out of the client. Server-side Supabase service keys should only be added when a backend or edge function boundary exists.

## Architecture Notes

The app is intentionally business-feature-free at this stage. New workflows should enter through `apps/web/src/features`, keep core rules in `apps/web/src/domains`, and depend on `shared` only for cross-cutting concerns such as configuration, API clients, styles, and infrastructure adapters.

Supabase access is prepared under `apps/web/src/shared/integrations/supabase`. Feature code should consume a thin application-facing API instead of importing Supabase directly once real data flows are introduced.
