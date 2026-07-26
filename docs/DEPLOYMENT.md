# Krishna's Kitchen Deployment Runbook

This runbook prepares Krishna's Kitchen for internal temple testing on Supabase, Vercel, and the generated PWA.

The application is a browser-only React/Vite PWA. Supabase is the production data and authentication boundary. Vercel hosts the static application shell.

## Deployment Readiness

Current status: ready for demo/staging deployment with repository migrations, validation seed data, Vercel static hosting, and PWA generation.

Production status: not yet production-approved until production tenant setup, non-demo users, final Supabase Auth settings, and final manual smoke testing are completed.

## Canonical Sources

- Supabase migrations: `infra/supabase/migrations/`
- Supabase CLI config: `infra/supabase/config.toml`
- Supabase seed data: `infra/supabase/seed/`
- Supabase seed entrypoint: `infra/supabase/seed.sql`
- Browser environment contract: `.env.example`, `.env.local.example`, `apps/web/src/shared/config/env.ts`
- Vercel deployment config: `vercel.json`
- PWA manifest and service worker config: `apps/web/vite.config.ts`
- PWA icon assets: `apps/web/public/`

## Required Environment Variables

Only `VITE_` variables are exposed to the browser bundle.

| Variable | Required | Development | Demo/Staging | Production | Notes |
| --- | --- | --- | --- | --- | --- |
| `VITE_APP_NAME` | Yes | `Krishna's Kitchen` | `Krishna's Kitchen Demo` | `Krishna's Kitchen` | Display name only. |
| `VITE_APP_ENV` | Yes | `development` | `staging` | `production` | Runtime mode consumed by the app. |
| `VITE_APP_URL` | Yes | `http://localhost:5173` | Staging Vercel URL | Production URL | Must match Supabase Auth site URL and redirect allow list. |
| `VITE_SUPABASE_URL` | Yes | Local or staging Supabase URL | Staging project URL | Production project URL | Public project URL from Supabase API settings. |
| `VITE_SUPABASE_ANON_KEY` | Yes | Local or staging anon key | Staging anon key | Production anon key | Browser-safe anon key. Authorization remains in RLS. |

Do not add Supabase service-role keys to Vercel client environment variables.

## Environment Naming

Recommended Supabase projects:

- `krishnas-kitchen-dev`: local or developer-owned testing.
- `krishnas-kitchen-staging`: internal temple testing and leadership demonstrations.
- `krishnas-kitchen-prod`: production use only.

Recommended Vercel environments:

- Development: branch previews and local developer values.
- Preview: connected to `krishnas-kitchen-staging`.
- Production: connected to `krishnas-kitchen-prod`.

## Supabase Setup

1. Create a new Supabase project.
2. Record the project URL and anon key from Project Settings, API.
3. Configure Authentication:
   - Enable Email authentication for internal testing.
   - Set Site URL to the deployed Vercel URL for the environment.
   - Add redirect URLs for the deployed Vercel URL, any preview URLs used for testing, and `http://localhost:5173` for local development.
   - Disable open public sign-up for production unless temple leadership explicitly approves self-service access.
4. Apply migrations in filename order from `infra/supabase/migrations/`.
5. For demo/staging only, seed validation data through `infra/supabase/seed.sql`, or run the seed files manually in this order:
   - `infra/supabase/seed/seed_validation_cleanup.sql`
   - `infra/supabase/seed/seed_validation_core.sql`
   - Optional: `infra/supabase/seed/seed_validation_expanded.sql` for search-density and history testing.
6. Confirm RLS is enabled on all application tables.
7. Confirm authenticated policies exist for inventory, recipes, production runs, item management, and location management.
8. Confirm volunteer RPC functions exist and are executable by the intended roles.
9. Confirm no Supabase Storage buckets are required for the current release candidate.

Clean database expectation: a new project can be initialized from repository migrations. The validation seed can prepare a controlled inventory/authentication dataset for staging. Current seed data is staging-only and should not be run against production.

### Supabase CLI Local Path

The repository includes `infra/supabase/config.toml` and `infra/supabase/seed.sql` so a developer can use the Supabase CLI without committing cloud project binding or secrets.

Recommended local flow:

1. Install and authenticate the Supabase CLI outside the repository.
2. From `infra/supabase`, start the local Supabase stack.
3. Apply migrations or reset the local database through the CLI.
4. Use the generated local API URL and anon key in `.env.local`.

Manual hosted-project steps still required:

- Create the hosted Supabase project.
- Link the local CLI to the hosted project if desired.
- Configure Auth Site URL and redirect URLs in the hosted dashboard.
- Apply migrations to the hosted project.
- Run validation seed data only against demo/staging.

## Vercel Setup

1. Import the repository into Vercel.
2. Use the root of the repository as the project root.
3. Confirm Vercel reads `vercel.json`.
4. Use these settings:
   - Framework preset: Vite
   - Install command: `corepack pnpm@9.15.4 install --frozen-lockfile`
   - Build command: `corepack pnpm@9.15.4 build`
   - Output directory: `apps/web/dist`
5. Add environment variables for the selected Vercel environment.
6. Deploy a preview.
7. Promote to production only after the smoke tests pass.

The deployment config includes SPA routing fallback to `index.html`, long-lived cache headers for hashed assets, no-cache headers for PWA service worker files, and basic browser security headers.

## PWA Verification

1. Open the deployed HTTPS URL.
2. Confirm the app loads in a clean browser profile.
3. Confirm `manifest.webmanifest` returns HTTP 200.
4. Confirm `sw.js` returns HTTP 200.
5. Confirm the application can be installed on Android through Chrome.
6. Confirm the application can be added to the iPhone Home Screen through Safari.
7. Launch the installed app and confirm it opens in standalone mode.
8. Confirm theme color and icons render acceptably on both platforms.
9. Confirm an authenticated session restores after closing and reopening the installed app.
10. Confirm offline reload behavior shows the cached shell; live Supabase data operations should be treated as online-only unless separately validated.

## Production Deployment Checklist

1. Create Supabase project.
2. Configure authentication providers, site URL, redirect URLs, and sign-up policy.
3. Apply every SQL migration from `infra/supabase/migrations/` in order.
4. Do not run validation seed files against production.
5. Create real organizations, temples, users, roles, locations, items, thresholds, and initial inventory records through the approved production setup path.
6. Configure Vercel project from repository root.
7. Add production environment variables.
8. Deploy preview or protected production candidate.
9. Verify application health:
   - Login succeeds.
   - Temple context loads.
   - Inventory catalog loads.
   - Inventory balances load.
   - Transaction history loads.
   - Recipe list loads.
10. Install as PWA on iPhone and Android.
11. Run smoke tests.

## Staging Deployment Checklist

Target completion time: under 30 minutes after Supabase and Vercel accounts are available.

1. Create or reset the staging Supabase project.
2. Configure Email Auth, Site URL, and redirect URLs for the staging Vercel URL.
3. Apply repository migrations in order.
4. Run `infra/supabase/seed.sql`.
5. Configure Vercel Preview variables:
   - `VITE_APP_NAME="Krishna's Kitchen Demo"`
   - `VITE_APP_ENV=staging`
   - `VITE_APP_URL=<staging Vercel URL>`
   - `VITE_SUPABASE_URL=<staging Supabase URL>`
   - `VITE_SUPABASE_ANON_KEY=<staging anon key>`
6. Deploy the Vercel preview.
7. Run the smoke tests below.

## Smoke Tests

Run these against demo/staging after deployment. Prioritize this list; it is designed to fit within 30 minutes.

1. Sign in as validation manager.
2. View inventory dashboard.
3. Receive inventory into an active location.
4. Confirm inventory balance increases.
5. Consume inventory.
6. Confirm inventory balance decreases.
7. Transfer inventory from one active location to another.
8. Return inventory from one active location to another.
9. Attempt an overdraw transfer and confirm it is rejected.
10. Attempt an overdraw return and confirm it is rejected.
11. Reverse a recent transaction as manager.
12. Create and edit a recipe.
13. Scale the recipe and review availability.
14. Generate a shopping list from shortages.
15. Execute a production run with sufficient stock.
16. Confirm production run history and inventory balances update.
17. Open Low Stock Center and confirm dashboard low-stock counts are consistent.
18. Archive and restore a test location.
19. Archive and restore a test inventory item.
20. Refresh the browser and confirm session/context recovery.
21. Sign out and sign in as validation volunteer.
22. Confirm volunteer permissions do not expose manager-only administration or reversal actions.
23. Scan or manually enter a known validation barcode.
24. Confirm offline shell behavior by loading the app once, disabling network, and refreshing the installed or browser app.

## Missing Infrastructure Items

- Hosted Supabase project linking is intentionally not committed. Each developer or environment must link the CLI to its own Supabase project.
- Generated Supabase database types are not documented as current production evidence; the repository currently uses the shared `Database` type from `packages/types`.
- Validation seed data does not seed recipe and production-run demo content. The demo can still create this content through the UI, but a full V1 demo seed would make rehearsals faster.
- Content Security Policy is not configured in `vercel.json` because the Supabase project host changes by environment. Add an environment-specific CSP before public production launch.
- Offline behavior is limited to the generated PWA shell unless online Supabase operations have already loaded and cached assets. Data mutation while offline is not a production capability in this release.

## Demo/Staging Recommendation

Use a dedicated Supabase staging project and a Vercel preview or staging deployment for internal temple testing. Run validation seed data only in staging. Keep production empty except for real organizations, temples, roles, locations, items, and users created through approved operational setup.

## Estimated Deployment Effort

- First staging deployment: 2 to 4 hours, including Supabase project setup, migrations, seed execution, Vercel configuration, and smoke testing.
- Repeat staging deployment after configuration is established: 30 to 60 minutes.
- Production deployment after staging approval: 2 to 3 hours, mostly for environment setup, real user provisioning, and smoke testing.
