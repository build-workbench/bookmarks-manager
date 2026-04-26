## Context

Bookmarks Manager is already in a partial closure-hardening phase: the repository has recent cleanup commits, lean GitHub workflows, and a passing validation/build baseline. The remaining problem is not basic breakage; it is scope drift. The runtime, OpenSpec contracts, public docs, and assistant instructions still describe a wider product than the repository can justify maintaining to an archive-ready standard.

The highest-maintenance surfaces are concentrated in the AI and cleanup verticals:

- `src/ai/aiService.ts`
- `src/store/useAIStore.ts`
- `src/pages/AI.tsx`
- `src/store/useCleanupStore.ts`
- `src/cleanup/CleanupWorkflow.tsx`

At the same time, the stable product value is already clear and independent of those surfaces: local-first bookmark import, merge, deduplication, search, export, backup, and GitHub Pages delivery under `HashRouter`.

### Target file shape

```text
src/
├── pages/
│   ├── LandingPage/
│   ├── UploadMerge.tsx
│   ├── Dashboard.tsx        # simplified, low-maintenance insights only
│   ├── Search.tsx
│   ├── Duplicates.tsx
│   ├── Backup.tsx
│   └── AI.tsx               # optional settings-only surface, or removed if unnecessary
├── store/
│   ├── useBookmarksStore.ts
│   └── useAIStore.ts        # reduced to minimal local BYOK config if AI survives
├── ai/
│   ├── configService.ts
│   └── adapters/**          # kept only if required by minimal AI surface
└── cleanup/                 # removed if dedicated workflow is retired
```

### Data flow

```text
Bookmark HTML -> parser -> bookmarks store -> dedupe/search/export/backup
                                      \-> optional local BYOK config (no cloud state)
```

## Goals / Non-Goals

**Goals:**

- Freeze the final supported product surface around the core bookmark workflow.
- Remove or downgrade high-maintenance AI/cleanup surfaces that do not justify their cost.
- Rewrite OpenSpec, docs, GitHub metadata, and assistant instructions so they describe only the final supported reality.
- Keep automation, CI/CD, and editor/tooling minimal and enforceable.
- Preserve local-first, privacy-first, GitHub Pages, and BYOK constraints.

**Non-Goals:**

- Expanding AI features, prompt systems, reporting, analytics, or cloud-connected workflows.
- Replacing the core stack or introducing backend services.
- Adding orchestration-heavy repo processes, branch rituals, or plugin sprawl.
- Preserving every current screen purely because it already exists.

## Decisions

### Decision 1: Freeze the product around the core local-first bookmark loop

**Decision:** The long-term supported workflow is import -> merge -> deduplicate -> search -> export/backup, plus the public landing page and GitHub Pages delivery.

**Why:** This flow already passes validation, matches the repository's value proposition, and can be explained simply in README, Pages, and GitHub About. It is also the lowest-risk path to an archive-ready state.

**Alternatives considered:**

- **Keep the existing broad feature set:** rejected because the AI/cleanup scope is wider than the closure-hardening objective.
- **Rebuild the application around new abstractions first:** rejected because scope freeze must come before deeper refactoring.

### Decision 2: Retire the dedicated cleanup workflow

**Decision:** The dedicated `#/app/cleanup` workflow is removed from the supported product surface.

**Why:** It introduces a second large state machine with AI coupling, undo/session persistence, and broad UI surface area, but it is not required for the core value proposition. Retiring it simplifies routing, store shape, docs, tests, and future maintenance.

**Alternatives considered:**

- **Keep cleanup and rewrite it:** rejected because it remains a large maintenance surface.
- **Keep cleanup but hide it:** rejected because hidden but supported features still create drift and maintenance cost.

### Decision 3: Reduce AI to a minimal optional BYOK surface

**Decision:** AI support is narrowed to a minimal, optional, local BYOK configuration surface. Broad AI analysis operations, prompt management, usage/cost reporting, cache management, report generation, and AI search are retired.

**Why:** This preserves the project's BYOK and privacy constraints without carrying a large operational and UI contract. It also allows the repository to stop promising a large AI product that is not central to the app's final scope.

**Alternatives considered:**

- **Keep the current AI feature family:** rejected because it is one of the largest and least essential surfaces.
- **Remove AI completely:** viable fallback if even the settings-only surface is not worth its cost after runtime audit.

### Decision 4: Prefer simplification over chart-heavy dashboard commitments

**Decision:** Dashboard and public presentation requirements are rewritten around stable summary value, not specific chart types or highly interactive visual commitments.

**Why:** The current build shows heavy chart-related chunks. Archive-ready quality favors a smaller, more predictable insights surface over maintaining specific chart implementations as a product promise.

**Alternatives considered:**

- **Keep specific chart commitments in spec/docs:** rejected because it locks the project into visual complexity that may not remain worth maintaining.

### Decision 5: Tooling and process stay intentionally small

**Decision:** The final workflow keeps one active OpenSpec change, local verification, focused `/review`, direct push, minimal GitHub Actions, and minimal editor/LSP settings. Extra MCPs or plugins are opt-in only when they materially reduce long-term maintenance cost.

**Why:** Closure hardening is a subtraction exercise. Every new tool or process becomes another maintenance object.

**Alternatives considered:**

- **Add more automation to enforce quality:** rejected because it adds noise and complexity that the current repository does not need.

## Risks / Trade-offs

- **[Risk] AI or cleanup removal may break routes, persistence, or docs** -> **Mitigation:** remove entry points first, then clean dependent store/service/test/doc references in the same batch.
- **[Risk] OpenSpec and public docs may drift during the reduction** -> **Mitigation:** update specs and maintained docs before or alongside code changes, not after.
- **[Risk] Legacy IndexedDB data may reference retired features** -> **Mitigation:** treat obsolete tables/config as optional on load and clean them up safely during migration.
- **[Risk] Dashboard simplification may be perceived as feature loss** -> **Mitigation:** preserve the core insights users actually need and align public messaging around reliability, privacy, and cleanup outcomes.
- **[Risk] Tooling guidance can reintroduce complexity through boilerplate** -> **Mitigation:** keep instructions repo-specific and explicitly reject default `/fleet` or heavy-MCP expansion.

## Migration Plan

1. Create the OpenSpec change and lock the keep / reduce / remove matrix.
2. Update spec deltas so runtime and docs changes have a clear contract.
3. Remove cleanup entry points and dependent code if the workflow is retired.
4. Shrink AI to a minimal optional configuration surface, or remove it entirely if the audit shows no compelling low-cost variant.
5. Simplify dashboard/public presentation requirements and corresponding UI.
6. Refresh maintained docs, GitHub About metadata, workflows, dependency anchors, and editor/tooling guidance.
7. Run `npm run validate`, run `npm run build` for route/PWA/workflow changes, and use focused `/review` before closeout.

## Open Questions

- If the AI settings-only surface still creates disproportionate maintenance cost after the runtime audit, it should be removed entirely rather than preserved for sentimentality.
