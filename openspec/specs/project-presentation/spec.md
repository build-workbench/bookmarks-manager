# project-presentation Specification

## Purpose

Define how Bookmarks Manager presents itself through GitHub Pages, curated docs, and repository metadata so the public surface stays clear, accurate, and useful.

## Requirements

### Requirement: The GitHub Pages root SHALL act as a product landing page

The GitHub Pages root SHALL act as a product landing page for the final reduced product scope.

**User Story:** As a prospective user, I want the root Pages experience to explain the product quickly, so that I can decide whether to try it.

#### Scenario: Landing page leads with the core value

- **WHEN** a visitor opens `#/`
- **THEN** the page highlights local-first bookmark cleanup, privacy-first behavior, and the core import/merge/search/export workflow

#### Scenario: Landing page avoids over-claiming retired surfaces

- **WHEN** a visitor scans the landing page
- **THEN** the page SHALL NOT present retired or downgraded AI/cleanup features as flagship capabilities

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

Public docs SHALL stay curated and accurate for the final maintained surface only.

**User Story:** As a user or maintainer, I want the visible docs surface to match the actual product, so that the repository stays trustworthy.

#### Scenario: README matches the retained product

- **WHEN** a visitor reads the README
- **THEN** it describes the real supported product workflow and maintained docs only
- **AND** it avoids promising broad AI or cleanup capabilities that the repository no longer supports

#### Scenario: Maintained docs stay intentionally small

- **WHEN** docs are reviewed
- **THEN** the repository keeps a small maintained doc set instead of preserving stale reference material

#### Scenario: Stale claims are removed instead of preserved

- **WHEN** a doc section no longer matches the final product surface
- **THEN** that section is removed or rewritten in the same change

### Requirement: Repository metadata SHALL match the product

Repository metadata SHALL match the reduced product and public landing surface.

**User Story:** As a GitHub visitor, I want the repository About section to accurately describe the project, so that search results and first impressions are useful.

#### Scenario: Description matches the final product scope

- **WHEN** the repository description is shown on GitHub
- **THEN** it describes Bookmarks Manager as a local-first bookmark cleanup and export application

#### Scenario: Homepage points to the live site

- **WHEN** the repository homepage is configured
- **THEN** it points to the GitHub Pages URL

#### Scenario: Topics focus on the real domain

- **WHEN** repository topics are configured
- **THEN** they emphasize bookmarks, cleanup, local-first behavior, privacy-first behavior, PWA delivery, and the actual frontend stack
- **AND** avoid unrelated or inflated labels
