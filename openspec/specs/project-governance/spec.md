# project-governance Specification

## Purpose

Define a low-noise, OpenSpec-driven maintenance model for this solo repository, including direct-push verification gates, aligned assistant guidance, and minimal enforceable automation.

## Requirements

### Requirement: The repository SHALL prefer lightweight AI-assisted workflows over orchestration-heavy defaults

The repository SHALL prefer the smallest effective AI workflow that preserves clarity and reduces maintenance overhead.

**User Story:** As the maintainer, I want AI workflows to stay minimal, so that I can focus on cleanup work without managing orchestration complexity.

#### Scenario: Fleet-style orchestration is not the default

- **WHEN** the maintainer plans or executes broad repository cleanup
- **THEN** the default workflow uses one active OpenSpec change, a long-running session, and focused review steps
- **AND** it SHALL NOT require `/fleet` as the default execution mode

#### Scenario: Extra tools need explicit value

- **WHEN** new MCP servers, plugins, or automation layers are proposed
- **THEN** they SHALL only be adopted if they materially reduce long-term repository maintenance cost

### Requirement: The repository SHALL keep OpenSpec active changes aligned with current work

The repository SHALL keep OpenSpec active changes aligned with current work.

**User Story:** As the maintainer, I want the active OpenSpec list to represent only current work, so that planning and apply flows stay trustworthy.

#### Scenario: Deferred change is removed from active work

- **WHEN** a change is no longer being executed
- **THEN** the repository moves it out of `openspec/changes/`
- **AND** preserves prior artifacts in `openspec/archive/`

#### Scenario: Maintenance work uses its own scoped change

- **WHEN** repository cleanup or closure work begins
- **THEN** the repository creates a focused change for that work
- **AND** does not continue an unrelated feature-expansion change

### Requirement: The repository SHALL use direct-push verification gates for solo maintenance

The repository SHALL use direct-push verification gates for solo maintenance and keep the flow optimized for fast but reviewable closure work.

**User Story:** As the maintainer, I want a workflow optimized for a one-person project, so that I can ship fixes quickly without unnecessary ceremony.

#### Scenario: Code changes require local verification

- **WHEN** code is changed
- **THEN** the maintainer runs `npm run validate` before pushing

#### Scenario: Routing and deployment changes require a build check

- **WHEN** changes affect routing, PWA behavior, metadata, workflows, or deployment files
- **THEN** the maintainer also runs `npm run build`

#### Scenario: Risky changes get a focused review step

- **WHEN** a change is broad, risky, deletion-heavy, or hard to verify by inspection
- **THEN** the workflow uses a focused review pass such as `/review` before the work is finalized

#### Scenario: Direct push remains the default delivery model

- **WHEN** repository workflow guidance is updated
- **THEN** it documents solo direct-push maintenance as the default path
- **AND** it avoids branch or PR ceremony that does not improve this repository's closure-hardening goal

### Requirement: The repository SHALL keep assistant instructions aligned across tools

The repository SHALL keep assistant instructions aligned across tools and scoped to the final supported product surface.

**User Story:** As the maintainer, I want Claude, Copilot, and similar tools to follow the same repository contract, so that generated changes stay consistent.

#### Scenario: Core instruction files remain authoritative

- **WHEN** an assistant reads project guidance
- **THEN** it can rely on `AGENTS.md`, `CLAUDE.md`, and `.github/copilot-instructions.md`

#### Scenario: Instructions reflect real retained scope

- **WHEN** the repository removes or downgrades a feature
- **THEN** the maintained instruction files are updated in the same change so assistants do not continue generating drift

#### Scenario: Instructions discourage unnecessary workflow complexity

- **WHEN** tooling and workflow guidance is written
- **THEN** it prefers OpenSpec, `gh`, lightweight editor settings, and focused review flows over orchestration-heavy defaults

### Requirement: The repository SHALL keep automation minimal and enforceable

The repository SHALL keep automation minimal and enforceable, focusing on meaningful checks instead of workflow noise.

**User Story:** As the maintainer, I want lightweight automation that protects quality without creating noise.

#### Scenario: Local hooks stay lightweight

- **WHEN** code is committed or pushed
- **THEN** hooks stay limited to staged formatting on commit and full validation on push

#### Scenario: CI focuses on meaningful checks

- **WHEN** GitHub Actions run
- **THEN** CI validates the repository and confirms the build where appropriate
- **AND** it avoids redundant matrices, low-value status jobs, and overdesigned workflow choreography

#### Scenario: Dependency automation avoids churn

- **WHEN** automated dependency updates are configured
- **THEN** they focus on meaningful package maintenance
- **AND** avoid low-value workflow churn and maintenance noise
