# Bookmarks Manager

**Local-first bookmark cleanup for browsers.** Import exported bookmarks, deduplicate them locally, search them, back them up, and export a cleaner set back out.

[Live demo](https://lessup.github.io/bookmarks-manager/) · [中文说明](README.zh-CN.md) · [Architecture](docs/ARCHITECTURE.md) · [Contributing](docs/CONTRIBUTING.md)

## Why this project exists

Most bookmark tools either want your data in the cloud or stop at basic import/export. Bookmarks Manager focuses on a different trade-off:

- **Local-first**: bookmark files stay in the browser
- **Privacy-first**: no backend, no account system, no forced upload
- **Practical cleanup**: merge, deduplicate, inspect, search, back up, export
- **Installable**: runs as a PWA on GitHub Pages

## Core workflow

| Step    | What you do                                                                     | What the app does                              |
| ------- | ------------------------------------------------------------------------------- | ---------------------------------------------- |
| Import  | Export bookmarks from Chrome, Firefox, Edge, Safari, Brave, or similar browsers | Parses Netscape bookmark HTML locally          |
| Merge   | Load one or more files                                                          | Normalizes folders and URLs, groups duplicates |
| Explore | Search, inspect duplicates, create backups                                      | Keeps data in IndexedDB for later sessions     |
| Export  | Download cleaned bookmarks                                                      | Exports HTML, JSON, CSV, or Markdown           |

## Feature snapshot

| Area             | Included                                                                     |
| ---------------- | ---------------------------------------------------------------------------- |
| Bookmark cleanup | Multi-file import, URL normalization, duplicate grouping, merge stats        |
| Search           | Full-text search, highlight, advanced filtering, filtered export             |
| Insights         | Domain and year charts, duplicate overview                                   |
| AI               | Optional BYOK provider configuration and connection testing                  |
| Resilience       | IndexedDB persistence, backup/restore, Web Worker support for large datasets |

## Run locally

```bash
git clone https://github.com/LessUp/bookmarks-manager.git
cd bookmarks-manager
npm install
npm run dev
```

For local verification:

```bash
npm run validate
npm run build
```

## Maintained docs

| File                      | Purpose                              |
| ------------------------- | ------------------------------------ |
| `docs/ARCHITECTURE.md`    | High-signal architecture map         |
| `docs/CONTRIBUTING.md`    | Actual repository workflow           |
| `CHANGELOG.md`            | Curated release history              |
| `openspec/`               | Change proposals, specs, and archive |
| `AGENTS.md` / `CLAUDE.md` | AI assistant repo instructions       |

## License

MIT
