# project-governance Specification

## Purpose

Define a low-noise, OpenSpec-driven maintenance model for this solo repository, including direct-push verification gates, aligned assistant guidance, and minimal enforceable automation.

## Requirements

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

The repository SHALL use direct-push verification gates for solo maintenance.

**User Story:** As the maintainer, I want a workflow optimized for a one-person project, so that I can ship fixes quickly without unnecessary ceremony.

#### Scenario: Code changes require local verification

- **WHEN** code is changed
- **THEN** the maintainer runs `npm run validate` before pushing

#### Scenario: Routing and deployment changes require a build check

- **WHEN** changes affect routing, PWA behavior, metadata, or deployment files
- **THEN** the maintainer also runs `npm run build`

#### Scenario: Direct push is the default delivery model

- **WHEN** repository workflow guidance is updated
- **THEN** it documents solo direct-push maintenance as the default path

### Requirement: The repository SHALL keep assistant instructions aligned across tools

The repository SHALL keep assistant instructions aligned across tools.

**User Story:** As the maintainer, I want Claude, Copilot, and similar tools to follow the same repository contract, so that generated changes stay consistent.

#### Scenario: Core instruction files are present

- **WHEN** an assistant reads project guidance
- **THEN** it can use `AGENTS.md`, `CLAUDE.md`, and `.github/copilot-instructions.md`

#### Scenario: Instructions reflect the real repository

- **WHEN** workflow or architecture changes
- **THEN** the maintained instruction files are updated to match the new reality

#### Scenario: Risky changes get a focused review step

- **WHEN** a change is broad, risky, or hard to verify by inspection
- **THEN** the guidance recommends a targeted review pass such as `/review`

### Requirement: The repository SHALL keep automation minimal and enforceable

The repository SHALL keep automation minimal and enforceable.

**User Story:** As the maintainer, I want lightweight automation that protects quality without creating noise.

#### Scenario: Local hooks stay lightweight

- **WHEN** code is committed or pushed
- **THEN** hooks format staged files on commit
- **AND** run full validation on push

#### Scenario: CI focuses on meaningful checks

- **WHEN** GitHub Actions run
- **THEN** CI validates the repository and confirms the build
- **AND** avoids redundant matrix and status-noise jobs

#### Scenario: Dependency automation avoids workflow churn

- **WHEN** automated dependency updates are configured
- **THEN** they focus on meaningful package maintenance
- **AND** avoid low-value GitHub Actions update churn
