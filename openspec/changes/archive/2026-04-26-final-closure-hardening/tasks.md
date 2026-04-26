## 1. Freeze the final supported scope

- [x] 1.1 Audit `src/App.tsx`, `src/pages/**`, `src/store/**`, `src/ai/**`, `src/cleanup/**`, and `src/utils/**` to produce a keep/reduce/remove matrix that matches the new spec deltas (`core-bookmarks`, `ai-analysis`, `cleanup-workflow`)
- [x] 1.2 Remove or downgrade dedicated cleanup entry points and decide whether `AI` survives only as a minimal settings surface or is removed completely (`ai-analysis`, `cleanup-workflow`)
- [x] 1.3 Update route/navigation/public-surface decisions in the OpenSpec change if the runtime audit proves an even smaller final scope is required (`project-presentation`, `project-governance`)

## 2. Simplify runtime code around the retained core

- [x] 2.1 Refactor `src/App.tsx` and affected page entry points so the route tree only exposes retained product surfaces, then run `npm run validate` (`core-bookmarks`, `cleanup-workflow`)
- [x] 2.2 Remove dead cleanup workflow code and dependent store/service/type references, then run `npm run validate` (`cleanup-workflow`)
- [x] 2.3 Shrink AI code to the retained minimal BYOK surface, remove retired operations/tabs/state, and run `npm run validate` (`ai-analysis`)
- [x] 2.4 Simplify dashboard/search/duplicates/backup surfaces where needed so the UI matches the reduced long-term product contract, then run `npm run validate` (`core-bookmarks`)
- [x] 2.5 Clean persistence and migration paths so retired AI/cleanup data does not block startup, then run `npm run validate` (`core-bookmarks`, `ai-analysis`)

## 3. Rewrite docs, specs, and repository metadata to match reality

- [x] 3.1 Update `README*.md`, `docs/ARCHITECTURE*.md`, and `docs/CONTRIBUTING*.md` so they describe only the retained workflow and maintained docs (`project-presentation`, `project-governance`)
- [x] 3.2 Update `AGENTS.md`, `CLAUDE.md`, and `.github/copilot-instructions.md` so assistant guidance matches closure hardening, direct-push maintenance, and the reduced feature set (`project-governance`)
- [x] 3.3 Use `gh` to align repository description, homepage, topics, and Pages/About wording with the final product scope (`project-presentation`)

## 4. Finish repository hardening and verification

- [x] 4.1 Refresh dependency/version anchors, remove packages/config tied only to retired surfaces, and rerun `npm run validate` (`core-bookmarks`, `project-governance`)
- [x] 4.2 Simplify `.github/workflows/*.yml`, `.github/dependabot.yml`, and related workflow docs so CI/CD remains low-noise and enforceable, then run `npm run build` (`project-governance`, `project-presentation`)
- [x] 4.3 Tune `.vscode/*`, `tsconfig*.json`, and related tooling guidance so the workspace keeps only project-specific, high-value rules (`project-governance`)
- [x] 4.4 Run `npm run validate`, run `npm run build`, perform a focused `/review` on the broad diff, and update this change's checklist/status for GLM handoff (`project-governance`, `project-presentation`)
