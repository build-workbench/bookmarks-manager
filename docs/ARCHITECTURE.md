# Architecture

Bookmarks Manager is a **client-only React + TypeScript PWA**. All bookmark processing happens in the browser and persisted state lives in IndexedDB through Dexie.

## Runtime surfaces

| Surface        | Responsibility                                                 |
| -------------- | -------------------------------------------------------------- |
| `#/`           | Public landing page for GitHub Pages visitors                  |
| `#/app/*`      | Application workspace                                          |
| Service worker | Offline assets and installability                              |
| IndexedDB      | Bookmarks, settings, backup data, and optional local AI config |

## Code map

```text
src/
├── pages/        Route-level UI
├── ui/           Shared UI components
├── store/        Zustand stores
├── utils/        Parsing, search, storage, export, backup helpers
├── ai/           Optional BYOK AI config and adapters
└── workers/      Worker support for large imports
```

## Main flows

### Import and merge

1. The user imports one or more bookmark HTML files
2. `bookmarkParser.ts` parses Netscape bookmark HTML into local models
3. `useBookmarksStore.ts` normalizes URLs and folder paths
4. Deduplication picks a canonical bookmark per normalized URL
5. The merged result is written to Dexie and indexed for search

### Search and export

1. Search indexes are created in memory with MiniSearch
2. Search and filter pages query the in-memory index plus stored bookmark data
3. Export helpers generate HTML, JSON, CSV, or Markdown on demand

### Optional AI config

- AI support is optional and reduced to local BYOK configuration plus connection testing
- The core bookmark workflow does not depend on AI

## Operational rules

- Router: `HashRouter` for GitHub Pages compatibility
- Quality gate: `npm run validate`
- Build check: `npm run build`
- OpenSpec tracks meaningful product and repository changes
