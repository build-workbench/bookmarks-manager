# Bookmarks Analysis (Local-first PWA)

[![App](https://img.shields.io/badge/App-GitHub%20Pages-blue?logo=github)](https://lessup.github.io/bookmarks-manager/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

[简体中文](README.md) | English

> Local parsing, multi-file merging, zero uploads — visualize your browser bookmark assets.

A privacy-first open-source tool for quickly merging bookmarks from different browsers, removing duplicates, generating structured insights, and providing extensible AI analysis (BYOK). Ships as a PWA — install and use, works offline.

## Core Features

- **Local-First & Zero Cloud Dependency** — All parsing, merging and visualization in-browser
- **Multi-Source Merging** — Import multiple Netscape Bookmark HTML files with unified folder aliases
- **Smart Deduplication** — URL normalization (scheme, host, port, path, parameter sorting, tracker removal)
- **Persistent Storage** — IndexedDB auto-save, data survives page refresh
- **Full-Text Search + Advanced Filtering** — MiniSearch-powered search with highlight; domain/folder/date filters
- **Enhanced Export** — Export all or filtered results; preserve folder structure or flatten
- **Visual Insights** — Dashboard with duplicate ratio, top domains, yearly additions
- **AI Analysis** — OpenAI, Claude, custom endpoint (BYOK): categorization, summaries, duplicate analysis, health check, NL search, collection reports

## Tech Stack

- React 18 + TypeScript + Vite
- Tailwind CSS + Lucide Icons
- Zustand (state) + Dexie (IndexedDB)
- MiniSearch (full-text search) + ECharts (visualization)
- Vite PWA Plugin (offline support)

## Quick Start

Requires Node.js 18+.

```bash
npm install
npm run dev
```

Default: http://localhost:5173/

See [QUICKSTART.md](QUICKSTART.md) for the complete walkthrough.

### Build & Preview

```bash
npm run build
npm run preview
```

## Project Structure

```
├─ src/
│  ├─ ai/                     # AI module (adapters, services)
│  ├─ pages/                  # UploadMerge, Dashboard, Search, Duplicates, AI
│  ├─ store/                  # Zustand stores
│  ├─ utils/                  # Parser, URL normalization, exporter, DB, search
│  ├─ ui/Chart.tsx            # ECharts wrapper
│  └─ App.tsx / main.tsx      # Router & entry
├─ vite.config.ts
├─ tailwind.config.js
└─ README.md
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server (PWA debug) |
| `npm run build` | Production build to `dist/` |
| `npm run typecheck` | TypeScript type check |
| `npm run preview` | Preview build locally |
| `npm run lint` | ESLint check |

## License

MIT
