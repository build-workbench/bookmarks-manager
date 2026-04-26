## MODIFIED Requirements

### Requirement: The GitHub Pages root SHALL act as a product landing page

The GitHub Pages root SHALL act as a product landing page for the final reduced product scope.

#### Scenario: Landing page leads with the core value

- **WHEN** a visitor opens `#/`
- **THEN** the page highlights local-first bookmark cleanup, privacy-first behavior, and the core import/merge/search/export workflow

#### Scenario: Landing page avoids over-claiming retired surfaces

- **WHEN** a visitor scans the landing page
- **THEN** the page SHALL NOT present retired or downgraded AI/cleanup features as flagship capabilities

#### Scenario: Landing page still provides clear actions

- **WHEN** a visitor reaches the primary call-to-action area
- **THEN** the page offers a direct link into the app
- **AND** a secondary link to the source repository

### Requirement: Public docs SHALL stay curated and accurate

Public docs SHALL stay curated and accurate for the final maintained surface only.

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
