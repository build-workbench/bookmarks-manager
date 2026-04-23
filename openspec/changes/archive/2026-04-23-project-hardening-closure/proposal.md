## Why

The repository has drifted away from a tight OpenSpec-driven workflow. Active changes, public docs, automation, and repository metadata no longer reflect the actual product or the desired maintenance model for a solo project that is approaching closure.

This change resets the project around a smaller, consistent, low-noise baseline so future maintenance can stay lightweight and deliberate.

## What Changes

- Freeze and defer the oversized `batch-edit-tags-system` change so it no longer drives active work
- Introduce a closure-oriented governance baseline for OpenSpec, AI assistant guidance, solo direct-push maintenance, hooks, and verification
- Remove stale or low-signal documentation, tracked build artifacts, and unnecessary community/automation files
- Simplify engineering configuration, GitHub Actions, and dependency automation to match a low-maintenance solo workflow
- Refresh the GitHub Pages landing experience, routing/manifest metadata, and GitHub repository About metadata

## Capabilities

### New Capabilities

- `project-governance`: Defines how this repository is maintained, validated, and guided for OpenSpec and AI-assisted development
- `project-presentation`: Defines the public-facing landing, documentation surface, and repository metadata requirements

### Modified Capabilities

- None

## Impact

- `AGENTS.md`, `CLAUDE.md`, `.github/copilot-instructions.md`, `docs/CONTRIBUTING*.md`
- `openspec/changes/`, `openspec/specs/`, and OpenSpec archive structure
- `.github/workflows/*`, `.github/dependabot.yml`, `.husky/*`, `.vscode/*`
- `package.json`, `vite.config.ts`, `index.html`, `public/manifest.json`, `public/404.html`
- `src/App.tsx`, `src/pages/LandingPage/*`, `README*.md`, `docs/*`, `CHANGELOG*.md`
