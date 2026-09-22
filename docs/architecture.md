# Architecture

The repository is a pnpm workspace with one application, two reusable packages, and a Supabase backend. `apps/web` owns the React experience and invokes the `analyze-address` Supabase Edge Function. `packages/shared` contains domain contracts, while `packages/digipin` is a deterministic, dependency-free geographic grid package.

The Edge Function currently contains mock resolution logic and persists results to the `address_analyses` Postgres table. No authentication, external geocoder, LLM, or maps service is connected yet. The service-role key is server-only; the browser uses only the Supabase anon key.
