## MODIFIED Requirements

### Requirement 4: 仪表盘统计

The Dashboard SHALL provide a low-maintenance summary surface for the retained core bookmark workflow.

#### Scenario: Dashboard shows stable core summaries

- **WHEN** a user opens the dashboard
- **THEN** the application shows summary metrics that directly support bookmark cleanup work, including merged bookmark count, duplicate count, and unique domain count

#### Scenario: Insights do not require specific chart implementations

- **WHEN** the application presents visual insights
- **THEN** it MAY use simple charts or lists
- **AND** it SHALL NOT require any specific chart type, highly interactive visualization, or large exploratory dashboard surface to satisfy the product contract

#### Scenario: Non-essential insight surfaces may be removed

- **WHEN** an insight view is not essential to import, merge, search, deduplicate, export, or backup workflows
- **THEN** the repository MAY remove that view rather than preserve a high-maintenance implementation

### Requirement 8: 本地数据持久化

The Storage_Service SHALL persist the retained product surface locally and tolerate removal of retired feature data.

#### Scenario: Core data persists locally

- **WHEN** the core bookmark dataset is saved
- **THEN** bookmarks and required retained settings are stored in IndexedDB only

#### Scenario: Retired feature data does not block startup

- **WHEN** the application loads after feature reduction
- **THEN** obsolete AI or cleanup data SHALL NOT block startup
- **AND** the application MAY ignore or clean up retired feature records safely

#### Scenario: Persistence scope matches retained features

- **WHEN** the repository retires or downgrades a feature
- **THEN** persistence requirements SHALL shrink with that feature
- **AND** the application SHALL NOT keep promising long-term storage for removed capabilities
