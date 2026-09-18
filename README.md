# India Address Intelligence

A TypeScript monorepo foundation for analyzing, normalizing and locating Indian postal addresses with geospatial intelligence and DIGIPIN.

## Install and run

```bash
pnpm install
pnpm dev
```

The web app runs at `http://localhost:5173` and the API at `http://localhost:4000`.

```bash
pnpm test
pnpm typecheck
pnpm build
```

## Structure

- `apps/web`: React, Vite, Tailwind, React Router and TanStack Query UI.
- `apps/api`: Fastify routes, controllers, services and provider interfaces.
- `packages/digipin`: pure TypeScript 4x4-grid DIGIPIN encode/decode implementation.
- `packages/shared`: shared address and geospatial contracts.
- `docs`: architecture notes.

## Current features

The analyzer, DIGIPIN Explorer, Address Lab and About pages are available. Address analysis currently returns a clearly marked mock result through the API service layer. DIGIPIN encode/decode is deterministic and covered by Vitest.

## Planned features

Improved Indian address parsing, PIN validation, real geocoding, map visualization, explainable scoring, persistence, authentication and provider-backed enrichment will be added incrementally.
