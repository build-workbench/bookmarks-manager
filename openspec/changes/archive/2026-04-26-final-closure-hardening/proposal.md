## Why

The repository has already completed one round of cleanup, but its public scope, OpenSpec requirements, runtime complexity, and AI/tooling guidance are still wider than the project's closure-hardening goal. This change is needed now to freeze the final product boundary, remove or downgrade high-maintenance surfaces, and bring code, docs, workflows, and repository metadata to an archive-ready state.

## What Changes

- Freeze the product around the stable local-first bookmark workflow: import, merge, deduplicate, search, export, backup, and GitHub Pages delivery.
- **BREAKING** remove or downgrade non-core, high-maintenance surfaces when they do not justify their complexity, especially broad AI analysis and AI-assisted cleanup flows.
- Rewrite OpenSpec, maintained docs, and assistant instruction files so they only describe the final supported reality.
- Continue simplifying GitHub workflows, dependency/version anchors, and repository metadata instead of adding more automation.
- Define a lightweight final maintenance workflow: OpenSpec-first, one active change, solo direct-push, focused `/review`, and no default `/fleet` usage.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `core-bookmarks`: narrow the final supported core workflow, persistence expectations, and presentation/performance surface to what will be maintained long-term.
- `ai-analysis`: reduce the requirement set to a minimal maintainable BYOK surface or formally retire broad AI promises that do not fit closure hardening.
- `cleanup-workflow`: reduce or retire the AI-assisted cleanup workflow if it remains too expensive relative to core value and testability.
- `project-governance`: codify final solo-maintenance, OpenSpec-first, low-noise workflow rules and tooling guidance.
- `project-presentation`: align GitHub Pages, landing page, README, and GitHub About metadata with the final reduced product scope.

## Impact

- Affected code: `src/App.tsx`, `src/pages/**`, `src/store/**`, `src/ai/**`, `src/cleanup/**`, `src/utils/**`, `src/workers/**`
- Affected docs/specs: `openspec/specs/**`, `README*.md`, `docs/*.md`, `AGENTS.md`, `CLAUDE.md`, `.github/copilot-instructions.md`
- Affected engineering surfaces: `.github/workflows/*.yml`, `package.json`, `.vscode/*`, GitHub repository About metadata, GitHub Pages presentation
