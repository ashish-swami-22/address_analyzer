# Architecture

The repository is a pnpm workspace with two applications and two packages. `apps/web` owns the React experience; `apps/api` owns HTTP transport and delegates business logic to services. `packages/shared` contains contracts used by both applications, while `packages/digipin` is a deterministic, dependency-free geographic grid package.

Provider interfaces in the API are deliberately placeholders. No database, authentication, external geocoder, LLM, or maps service is connected yet.
