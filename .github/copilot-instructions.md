# Copilot Instructions

## Project intent

This repository is in a **closure hardening** phase. Prefer cleanup, consistency, and reliability over new feature expansion.

## Product constraints

- Local-first only: no backend, no cloud sync
- Privacy-first: do not introduce uploads or telemetry
- BYOK AI only: never hardcode keys or secrets
- GitHub Pages deployment with `HashRouter`

## Working style

- Start with the active OpenSpec change before broad edits
- Keep changes scoped and remove drift when it is tightly related
- This is a solo-maintained repo: direct pushes after local verification are normal

## Commands

```bash
npm run validate
npm run build
```

- Use `npm run validate` for code changes
- Also use `npm run build` when touching routes, PWA metadata, workflows, or deployment behavior

## Docs and tooling

- Keep docs concise and maintained
- Do not add generic PRDs, API dumps, or template-heavy community files unless they will stay current
- Prefer native tooling, `gh`, OpenSpec, and focused review flows such as `/review` over extra MCP/plugin complexity
