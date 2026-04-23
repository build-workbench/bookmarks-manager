# CLAUDE.md

Project instructions for Claude-style coding tools.

## Focus

Optimize for **accurate repository cleanup and low-noise maintenance**, not feature expansion. This is a solo-maintained project; direct pushes after local verification are the default workflow.

## Before editing

1. Check `openspec/changes/` and work from the active change.
2. Read `AGENTS.md` and the relevant OpenSpec artifacts before making cross-cutting changes.
3. Prefer removing drift over layering more docs or tooling on top of it.

## Commands

```bash
npm run validate
npm run build
```

- Always run `npm run validate` for code changes.
- Also run `npm run build` when touching routing, PWA metadata, GitHub Pages behavior, or workflows.

## Repository specifics

- Router: `HashRouter`
- Data storage: Dexie / IndexedDB only
- State: Zustand
- AI: BYOK only, stored locally
- Deployment: GitHub Pages under `/bookmarks-manager/`

## Editing bias

- Prefer concise, project-specific docs over generic templates.
- Keep CI, hooks, and repo automation minimal.
- Use `/review` for risky diffs or broad cleanup passes.
