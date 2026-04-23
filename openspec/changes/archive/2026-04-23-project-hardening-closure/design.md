## Context

Bookmarks Manager is already functional, but the repository has accumulated too much operational drift:

- an unfinished feature-expansion change was left as the only active OpenSpec change
- the doc set grew faster than it was maintained
- CI, Dependabot, and community files were tuned for a busier workflow than this repo needs
- GitHub Pages and repository metadata undersell the actual product
- AI assistant guidance exists, but it is still too generic and partially inconsistent

This repository is maintained as a solo project. The design should favor fast local iteration, direct pushes after local verification, and a smaller number of durable docs and automation rules.

## Goals / Non-Goals

**Goals:**

- Restore a clean OpenSpec state with one active change that matches the current closure-oriented work
- Make the repository instructions, docs, workflows, and metadata consistent with the actual product
- Reduce maintenance noise without weakening the core safety checks
- Keep AI-tool guidance project-specific and enforceable
- Finish in a state that is easy to maintain infrequently

**Non-Goals:**

- Shipping the deferred batch-edit and tag-system feature set
- Adding new backend services, sync features, or heavy new tooling
- Creating process overhead intended for a larger team
- Committing speculative MCP or plugin configuration with unclear repository value

## Decisions

### D1: Remove the unfinished feature expansion from active OpenSpec work

The old `batch-edit-tags-system` change will be moved out of `openspec/changes/` and into `openspec/archive/` with a deferred label.

**Why:** Active changes should describe current intent. Leaving an abandoned mega-change active makes OpenSpec misleading.

**Alternative rejected:** Keeping the deferred change active with a warning banner still pollutes `openspec list` and future apply flows.

### D2: Optimize governance for a solo direct-push workflow

The repository workflow will default to:

```ts
interface RepositoryWorkflowPolicy {
  changeEntry: 'openspec-first'
  deliveryModel: 'solo-direct-push'
  requiredLocalChecks: ['npm run validate']
  requiredBuildCheck: ['npm run build']
  recommendedReviewStep: '/review'
}
```

Direct pushes are allowed after local verification, with a focused review pass for risky diffs.

**Why:** The previous PR-centric workflow added friction without real benefit for a one-person repository.

### D3: Shrink the maintained documentation surface

The maintained docs will center on:

- `README.md` / `README.zh-CN.md`
- `CHANGELOG.md` / `CHANGELOG.zh-CN.md`
- `AGENTS.md`
- `CLAUDE.md`
- `docs/README*.md`
- `docs/ARCHITECTURE*.md`
- `docs/CONTRIBUTING*.md`
- `openspec/`

Stale API/PRD-style docs and generic community templates will be removed when they do not add ongoing value.

**Why:** A smaller, actively maintained doc set is better than a comprehensive but unreliable one.

### D4: Keep automation minimal but strict

Automation will be simplified to:

- local hooks for staged formatting and pre-push verification
- CI that runs validation and build checks on pushes and manual runs
- a simple Pages deployment workflow
- Dependabot limited to npm dependency maintenance

**Why:** This preserves safety while cutting low-value workflow and dependency noise.

### D5: Treat public presentation as a product surface

The root route, metadata, README, and GitHub About settings will be aligned under one presentation contract:

```ts
interface PublicPresentationContract {
  landingRoute: '#/'
  appRoutePrefix: '#/app/'
  primaryMessage: 'local-first bookmark cleanup without uploads'
  requiredCtas: ['open app', 'view source']
}
```

**Why:** GitHub Pages is the project storefront, not a mirrored README dump.

## Risks / Trade-offs

- **Less documentation history** → Keep a curated changelog and an accurate architecture doc instead of many stale references
- **Direct pushes increase main-branch risk** → Keep `npm run validate` as the local gate and CI/build as a remote backstop
- **Removing automation/features may surprise future contributors** → Capture the maintenance model clearly in governance docs and OpenSpec specs
- **Deferring the old change may hide prior thinking** → Preserve it under `openspec/archive/` with a deferred archive name

## Migration Plan

1. Move the stale active change to `openspec/archive/`
2. Create and implement `project-hardening-closure`
3. Rewrite docs, workflows, and presentation assets in one coherent pass
4. Run validation and build checks
5. Archive `project-hardening-closure` so the new capabilities land in `openspec/specs/`

## Open Questions

- None; this change intentionally favors simplification over optional expansion
