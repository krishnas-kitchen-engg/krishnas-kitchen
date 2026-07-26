-- Krishna's Kitchen staging/local seed entrypoint.
--
-- Supabase CLI executes this file after migrations when seed execution is
-- enabled. Keep validation seed order deterministic:
--   1. Remove validation-tagged rows.
--   2. Insert the core validation dataset.
--
-- The expanded dataset is intentionally excluded from the default seed path.
-- Run seed/seed_validation_expanded.sql manually when search-density or longer
-- history scenarios are needed.

\ir ./seed/seed_validation_cleanup.sql
\ir ./seed/seed_validation_core.sql
