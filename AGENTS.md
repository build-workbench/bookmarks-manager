# AGENTS.md

Repository contract for AI coding assistants working on **Bookmarks Manager**.

## Product and current goal

Bookmarks Manager is a **local-first PWA** for importing, deduplicating, searching, backing up, and exporting browser bookmarks. The current project goal is **closure hardening**: improve coherence, reduce maintenance noise, and keep the repo easy to maintain as a solo project.

## Architecture snapshot

- `src/pages/` — route-level UI, including the public landing page and the in-app workspace
- `src/ui/` — shared UI primitives
- `src/store/` — Zustand state
- `src/utils/` — bookmark parsing, search, storage, export, backup helpers
- `src/ai/` — optional BYOK AI config and adapters
- `src/workers/` — Web Worker support for large bookmark datasets
- `openspec/` — the source of truth for scoped product and repository changes

## Commands that matter

```bash
npm run dev
npm run validate   # typecheck -> lint -> test
npm run build
```

Use `npm run validate` for all code changes. Also run `npm run build` when you touch routing, PWA, metadata, workflows, or deployment-facing files.

## Workflow rules

1. Start with OpenSpec for meaningful product or repository changes.
2. Keep only active, current work under `openspec/changes/`; move deferred work out of the active list.
3. This repository is maintained as a **solo direct-push** project.
4. Use `/review` or an equivalent focused review step for risky, cross-cutting, or hard-to-verify changes.

## Documentation rules

Prefer a **small maintained doc set** over many stale documents. Keep these accurate:

- `README.md` / `README.zh-CN.md`
- `CHANGELOG.md` / `CHANGELOG.zh-CN.md`
- `docs/README*.md`
- `docs/ARCHITECTURE*.md`
- `docs/CONTRIBUTING*.md`
- `AGENTS.md`
- `CLAUDE.md`

Do not add generic PRDs, API dumps, or community boilerplate unless they will be actively maintained.

## Tooling policy

- Prefer `gh`, built-in assistant features, and OpenSpec skills over extra MCP/tooling sprawl.
- Copilot guidance lives in `.github/copilot-instructions.md`.
- Workspace editor and LSP defaults live in `.vscode/settings.json`.
- Husky hooks should stay lightweight: staged formatting on commit, full validation on push.

## Guardrails

- Preserve the local-first privacy model.
- Do not introduce a backend or cloud dependency.
- Do not hardcode API keys or secrets.
- Keep changes surgical and remove drift when you find it, but do not resurrect deferred feature work unless a new OpenSpec change explicitly scopes it.
