# AGENTS.md

Development guidance for Bookmarks Manager - a local-first PWA for merging and deduplicating browser bookmarks.

## Commands

```bash
npm run dev          # Start dev server (port 5173)
npm run validate     # Pre-commit: typecheck + lint + test
npm run ci           # Full CI: clean, install, validate with coverage, build
npm run test         # Run tests once
npm run test:watch   # Watch mode
npm run build        # Production build (tsc + vite)
```

## Verification Order

`typecheck` → `lint` → `test` (enforced by `npm run validate`)

## Key Architecture

- **Router**: `HashRouter` (required for GitHub Pages SPA)
- **Storage**: IndexedDB via Dexie (`BookmarksDB`, schema version 3)
- **State**: Zustand stores in `src/store/`
- **Workers**: Web Workers for large datasets (>500 bookmarks) in `src/workers/`
- **Path aliases**: `@/`, `@ai/`, `@components/`, `@pages/`, `@store/`, `@utils/`, `@workers/`

## Testing

- Framework: Vitest + jsdom
- IndexedDB mock: `fake-indexeddb/auto` (in `src/test/setup.ts`)
- Each test run resets the database via `beforeEach` hook
- Coverage thresholds: lines 35%, functions 50%, branches 40%, statements 35%

## Code Style

- **No semicolons** (Prettier `semi: false`)
- Single quotes for TS/JS, double quotes for JSX
- No trailing commas
- Use `interface` for object shapes

## Build Quirks

- Production builds use `VITE_BASE_PATH=/bookmarks-manager/` for GitHub Pages
- Use `npm run build:staging` for root-path builds (local testing)
- Bundle analysis: `ANALYZE=true npm run build`

## Database Schema (Dexie v3)

Tables: `bookmarks`, `settings`, `aiConfig`, `aiCache`, `aiUsage`, `aiPrompts`, `aiUsageLimits`, `cleanupSessions`

See `src/utils/db.ts` for interfaces.

## Constraints

- Node.js >= 20.0.0
- All data stays client-side (IndexedDB, no backend)
- AI features are BYOK (user provides API key, stored in IndexedDB)
