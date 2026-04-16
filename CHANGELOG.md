# Changelog

> All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-04-15

### Added

#### Multi-Format Export (P1-1)
- Support for JSON, CSV, and Markdown export formats
- Unified exporter module at `src/utils/exporters/index.ts`
- HTML export with options for preserving or flattening directory structure
- JSON export with optional metadata inclusion
- CSV export with proper field escaping (commas, quotes, newlines)
- Markdown export with automatic table of contents generation

#### Backup & Restore (P1-2)
- New Backup page (`src/pages/Backup.tsx`)
- Support for backing up bookmarks, AI configuration, usage records, prompt templates, and cleanup workflow states
- Selective backup options to reduce file size
- Backup file size estimation
- Preview statistics before restoring

#### Web Worker Optimization
- Added `src/workers/bookmarkWorker.ts` and `src/workers/bookmarkWorkerClient.ts`
- Automatic Worker activation for bookmark counts > 500
- Graceful fallback to main thread on Worker errors

#### Virtual Scrolling Component
- Added `src/ui/VirtualList.tsx`
- Automatic activation for search results > 200 items
- Reduced DOM nodes from 1000+ to ~15 for 1000 bookmarks

### Changed

#### ECharts On-Demand Loading
- Import only required modules (PieChart, BarChart, LineChart)
- Reduced bundle size from 1,042 KB to 534 KB (48.7% reduction)

#### Search Performance Optimization
- Added 200ms debounce to search input
- Added cleanup functions to prevent memory leaks

#### Enhanced File Import Error Handling
- Improved file type checking logic (extension + MIME type)
- Display specific unsupported filenames

### Documentation

- Comprehensive documentation restructuring
- Added Architecture documentation (ARCHITECTURE.md/zh-CN.md)
- Added API Reference documentation (API.md/zh-CN.md)
- Added Contributing Guide (CONTRIBUTING.md/zh-CN.md)
- Added Product Requirements Document (PRD.md/zh-CN.md)
- All documentation available in both English and Chinese

---

## [1.0.0] - 2026-03-22

### Added

- GitHub Pages workflow (`.github/workflows/pages.yml`)
- `VITE_BASE_PATH` environment variable for subdirectory deployment
- HashRouter routing mode to prevent 404 on refresh in GitHub Pages
- CI/Deploy status badges in README
- GitHub community health files: CODE_OF_CONDUCT.md, SECURITY.md, PULL_REQUEST_TEMPLATE.md, and Issue templates

### Changed

- Static entry resources (`index.html`) now use relative paths for subdirectory compatibility
- Added `.windsurf/` to `.gitignore`
- Complete README rewrite: user-friendly structure, online demo button, browser export instructions, privacy and security sections

### Fixed

- 404 error when refreshing page on GitHub Pages deployment

---

## [0.3.2] - 2026-03-10

### Added

- Path-based triggers for Pages workflow to reduce unnecessary builds
- `main` branch trigger for Pages deployment

### Changed

- Renamed Pages workflow: `deploy.yml` → `pages.yml`
- Unified CI workflow `permissions: contents: read` and `concurrency` configuration
- Added and later removed `actions/configure-pages@v5` step in Pages workflow
- Extended Pages workflow path triggers: added `types/**`, `index.html`, `favicon.svg`, configuration files

---

## [0.3.1] - 2026-02-13

### Added

- Added IDE (`.vscode`/`.idea`), OS (`Thumbs.db`/`desktop.ini`), build artifacts (`*.tsbuildinfo`), coverage, and log patterns to `.gitignore`
- New npm scripts: `clean`, `validate`
- Added `@/` path alias, PWA icons, Workbox runtime caching, and manualChunks splitting in `vite.config.ts`
- ESLint config: upgraded to `es2022`, added `consistent-type-imports`/`no-console`/`eqeqeq` rules
- Prettier config: added `arrowParens`/`endOfLine`/`bracketSpacing` options
- `.editorconfig`: added YAML/JSON/Makefile specific rules
- `.prettierignore`: added `dev-dist`/`coverage`/`*.tsbuildinfo`

### Changed

- Version bumped to `1.0.0`, added `description`/`author`/`license`/`engines` metadata
- `build` script now includes `tsc -b` type checking
- Migrated all relative imports in `src/` to `@/` alias format
- Removed `tsconfig.node.tsbuildinfo` and `vite.config.js` from git tracking (build artifacts)

---

## [0.3.0] - 2025-01-15

### Added

#### AI Module (`src/ai/`)
- LLM Provider adapters: OpenAI, Claude, custom endpoints (Ollama, LocalAI, vLLM, etc.)
- Configuration management service (`configService.ts`): secure API Key storage, Provider/Model management, connection testing
- Prompt template service (`promptService.ts`): 6 default templates, custom editing, variable substitution
- Cache service (`cacheService.ts`): content hash-based caching with configurable expiration
- Usage tracking service (`usageService.ts`): Token usage logging, cost estimation, quota checking
- AI analysis service (`aiService.ts`): bookmark classification, summary generation, duplicate analysis, health checks, natural language search, collection reports

#### State Management
- `useAIStore` integrating all AI services with unified state management and progress tracking

#### UI Components
- AI page (`src/pages/AI.tsx`) with 7 tabs: Configuration, Classification, Summary, Health Check, Search, Reports, Usage Statistics

#### Database Extensions
- New IndexedDB tables: `aiConfig`, `aiCache`, `aiUsage`, `aiPrompts`, `aiUsageLimits`

### Changed

- Documentation updates: README.md, FEATURES.md, docs/DESIGN.md, docs/PRD.md with AI feature descriptions

---

## [0.2.1] - 2025-12-18

### Added

#### Documentation System (`/docs`)
- `docs/README.md` as documentation entry point
- `docs/PRD.md`: Roadmap scope (P0/P1/P2/Archive) and acceptance criteria
- `docs/DESIGN.md`: Layered architecture, data flow, module boundaries, and design considerations

#### Enhanced Import Experience
- Drag-and-drop support for bookmark HTML files with visual feedback
- New "Imported Files" list with aggregation by source file
- Support for removing individual source files
- Detailed loading state indicators for import/merge stages

#### Search Experience Upgrades
- Highlight matching terms in search results (title/URL/path)
- Advanced filtering: by domain, top-level folder, folder keywords, date range
- Export options: support for "current filtered results / all" selection
- Export options: support for "preserve / flatten" directory structure
- Paginated result loading (default 50 items, load more progressively)

### Changed

- README: streamlined "Quick Start/Typical Flow", unified reference to QUICKSTART
- FEATURES / QUICKSTART: Added descriptions for advanced filtering and export enhancements
- Route pages now use `React.lazy` + `Suspense` for on-demand loading
- `Chart` component uses dynamic `import()` for `echarts`, loading chart dependencies on demand

---

## [0.2.0] - 2025-12-14

### Added

- `SearchResultItem` type with strongly-typed `search()` results
- `resetSearchIndex()` to prevent stale index issues after clearing/rebuilding data
- `clearBookmarks()` to clear the `bookmarks` table in IndexedDB
- ESLint config (`.eslintrc.cjs`), Prettier config (`prettier.config.cjs` + `.prettierignore`)
- `.editorconfig` for consistent editor behavior (indentation, line endings)
- GitHub Actions CI (`.github/workflows/ci.yml`)
- Minimal type declaration in `types/vite-pwa-assets-generator-api.d.ts`

### Changed

- `importFiles()` now uses `try/finally` to ensure `importing` state is properly reset
- Deduplication logic fix: bookmarks missing `addDate/lastModified` no longer incorrectly prioritized
- `loadFromDB()` now synchronously initializes `rawItems` when restoring data
- `clear()` upgraded to async: clears memory state, resets search index, cleans IndexedDB
- Export button logic optimized on upload page: triggers `needsMerge` prompt after importing new files
- ECharts component lifecycle optimized: avoids repeated `init()` on every render
- Pinned `typescript` version to `5.5.4`
- `tsconfig.json` / `tsconfig.node.json` now include `types/` in compilation

### Fixed

- Deduplication page type fix: explicit type annotation for `Object.entries(duplicates)`
- ESLint rule adaptations: disabled `react/no-unescaped-entities` and `@typescript-eslint/no-explicit-any`
- Minor style fixes: `prefer-const` in `bookmarkParser.ts`, `_normalized` destructuring in store

---

## [0.1.0] - 2024-12-01

### Added

- 🎉 Initial release
- Bookmark import (Netscape HTML format)
- Multi-file merging
- URL normalization deduplication (handles http/https, trailing slashes, tracking params)
- Full-text search (minisearch)
- Data visualization (ECharts)
- IndexedDB persistent storage
- PWA support (works offline)
- Responsive UI (Tailwind CSS)

---

## Version Comparisons

- [1.1.0]: https://github.com/LessUp/bookmarks-manager/compare/v1.0.0...v1.1.0
- [1.0.0]: https://github.com/LessUp/bookmarks-manager/compare/v0.3.2...v1.0.0
- [0.3.2]: https://github.com/LessUp/bookmarks-manager/compare/v0.3.1...v0.3.2
- [0.3.1]: https://github.com/LessUp/bookmarks-manager/compare/v0.3.0...v0.3.1
- [0.3.0]: https://github.com/LessUp/bookmarks-manager/compare/v0.2.1...v0.3.0
- [0.2.1]: https://github.com/LessUp/bookmarks-manager/compare/v0.2.0...v0.2.1
- [0.2.0]: https://github.com/LessUp/bookmarks-manager/compare/v0.1.0...v0.2.0
- [0.1.0]: https://github.com/LessUp/bookmarks-manager/releases/tag/v0.1.0
