# Contributing

Bookmarks Manager is maintained as a **small, solo-first repository**. The process is optimized for clear OpenSpec scope, fast local verification, and low automation noise.

## Workflow

1. Start with `openspec/changes/` for any meaningful product or repository change.
2. Keep changes focused. If a proposal grows into multiple concerns, split it.
3. Direct pushes are the default maintainer workflow after local verification.
4. Use a focused review step such as `/review` before pushing cross-cutting changes.

External contributors are welcome, but the repository workflow is optimized around low-friction maintenance rather than a PR-heavy process.

## Local setup

```bash
git clone https://github.com/LessUp/bookmarks-manager.git
cd bookmarks-manager
npm install
npm run dev
```

## Verification

```bash
npm run validate
npm run build
```

- Run `npm run validate` for all code changes.
- Run `npm run build` when touching routes, PWA metadata, GitHub Pages behavior, or workflow/deployment files.

## What to update when you change the repo

| Change type                | Update these too                                                       |
| -------------------------- | ---------------------------------------------------------------------- |
| Product behavior           | OpenSpec change artifacts, README if user-facing                       |
| Routing / PWA / deployment | `index.html`, manifest, Pages workflow, build docs                     |
| Architecture changes       | `docs/ARCHITECTURE*.md`                                                |
| Workflow / tooling changes | `AGENTS.md`, `CLAUDE.md`, `.github/copilot-instructions.md`, this file |

## Documentation bar

Prefer a **small maintained doc set** over large generic references. If a doc cannot be kept current, remove it instead of preserving stale detail.
