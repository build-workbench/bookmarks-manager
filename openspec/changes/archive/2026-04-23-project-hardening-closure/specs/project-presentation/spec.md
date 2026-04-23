# Capability: Project Presentation

## ADDED Requirements

### Requirement: The GitHub Pages root SHALL act as a product landing page

The GitHub Pages root SHALL act as a product landing page.

**User Story:** As a prospective user, I want the root Pages experience to explain the product quickly, so that I can decide whether to try it.

#### Scenario: Root route shows the landing page

- **WHEN** a visitor opens `#/`
- **THEN** the application shows a landing page instead of dropping directly into the workspace

#### Scenario: Landing page communicates the core value

- **WHEN** a visitor scans the landing page
- **THEN** it highlights local-first bookmark cleanup
- **AND** explains that the workflow happens without forced uploads

#### Scenario: Landing page provides clear actions

- **WHEN** a visitor reaches the primary call-to-action area
- **THEN** the page offers a direct link into the app
- **AND** a secondary link to the source repository

### Requirement: Public entry points SHALL stay aligned with each other

Public entry points SHALL stay aligned with each other.

**User Story:** As a user, I want landing, app routing, PWA metadata, and GitHub Pages fallback behavior to agree with each other, so that navigation and installation work reliably.

#### Scenario: Landing and workspace routes are separated

- **WHEN** routing is configured
- **THEN** `#/` remains the landing route
- **AND** `#/app/*` remains the workspace route set

#### Scenario: Legacy routes are redirected

- **WHEN** an old hash route is visited
- **THEN** the application redirects it into the supported `#/app/*` structure

#### Scenario: Manifest shortcuts use real routes

- **WHEN** the PWA manifest exposes shortcuts or start URLs
- **THEN** those URLs point to valid workspace routes

#### Scenario: GitHub Pages fallback returns to SPA entry

- **WHEN** a deep link hits the GitHub Pages 404 fallback
- **THEN** the fallback redirects back into the single-page application flow

### Requirement: Public docs SHALL stay curated and accurate

Public docs SHALL stay curated and accurate.

**User Story:** As a user or maintainer, I want the visible docs surface to match the actual product, so that the repository stays trustworthy.

#### Scenario: README matches the product

- **WHEN** a visitor reads the README
- **THEN** it describes the real product workflow and maintained docs only

#### Scenario: Docs index links only maintained docs

- **WHEN** the docs index is opened
- **THEN** it links only to docs that are still maintained

#### Scenario: Stale reference sets are removed

- **WHEN** outdated API dumps, PRDs, or placeholder docs are no longer maintained
- **THEN** they are removed instead of left to drift

### Requirement: Repository metadata SHALL match the product

Repository metadata SHALL match the product.

**User Story:** As a GitHub visitor, I want the repository About section to accurately describe the project, so that search results and first impressions are useful.

#### Scenario: Description matches product scope

- **WHEN** the repository description is shown on GitHub
- **THEN** it describes Bookmarks Manager as a local-first bookmark cleanup and export app

#### Scenario: Homepage points to the live site

- **WHEN** the repository homepage is configured
- **THEN** it points to the GitHub Pages URL

#### Scenario: Topics focus on the real domain

- **WHEN** repository topics are configured
- **THEN** they emphasize bookmarks, cleanup, local-first behavior, and the actual frontend stack
- **AND** avoid unrelated labels
