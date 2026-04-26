## MODIFIED Requirements

### Requirement 1: AI API 配置管理

AI configuration SHALL be an optional, local-only BYOK surface and SHALL NOT be required for the core bookmark workflow.

#### Scenario: AI remains optional

- **WHEN** a user does not configure any AI provider
- **THEN** the application remains fully usable for import, merge, search, deduplication, export, backup, and public landing flows

#### Scenario: AI configuration stays local

- **WHEN** a user stores AI configuration
- **THEN** provider, model, base URL, and API key data remain stored locally in IndexedDB only
- **AND** the application SHALL NOT upload configuration or bookmark data to any repository-controlled service

#### Scenario: AI configuration can be removed cleanly

- **WHEN** a user clears AI configuration or the repository reduces the AI feature surface further
- **THEN** the application SHALL allow local AI settings to be removed without affecting core bookmark data

## REMOVED Requirements

### Requirement 2: 书签智能分类

**Reason**: Closure hardening narrows AI to a minimal optional BYOK surface and removes broad AI operation promises that are not part of the final maintained core.
**Migration**: Remove categorize actions, related UI tabs, and associated cache/usage/test expectations from the AI route and docs.

### Requirement 3: 书签内容摘要

**Reason**: Summary generation is non-core and materially increases UI, service, caching, and testing scope.
**Migration**: Remove summary generation UI/state and stop documenting summary output as a supported feature.

### Requirement 4: 重复书签智能分析

**Reason**: Duplicate handling remains part of the core app, but AI-based duplicate recommendation is retired to keep the product contract smaller and more reliable.
**Migration**: Keep deterministic duplicate presentation in core pages; remove AI recommendation paths and related wording.

### Requirement 5: 书签健康检查建议

**Reason**: Health analysis is not required for the final archive-ready scope and carries ongoing prompt/service maintenance cost.
**Migration**: Remove health-analysis UI/state and any associated docs/tests.

### Requirement 6: 自然语言书签搜索

**Reason**: The repository already has a deterministic local search surface; a second AI search contract is unnecessary for the final maintained product.
**Migration**: Remove AI-search entry points and public claims; direct users to the core search page.

### Requirement 7: 书签集合分析报告

**Reason**: AI report generation expands the public contract without strengthening the core bookmark cleanup workflow.
**Migration**: Remove report-generation UI/state/export flows and any report-specific docs/tests.

### Requirement 8: 提示词模板管理

**Reason**: Prompt-template management is tooling complexity that does not fit the final reduced product scope.
**Migration**: Remove prompt-management surfaces and ignore or clean up stored prompt data during migration.

### Requirement 9: API 调用成本控制

**Reason**: Usage-cost reporting becomes unnecessary once broad AI operations are retired.
**Migration**: Remove usage dashboards, limits management, and cost-reporting promises from UI, state, and docs.

### Requirement 10: 离线模式与缓存

**Reason**: Rich AI result caching is not needed once broad AI analysis features are removed.
**Migration**: Remove or ignore legacy AI cache structures as part of the reduced AI migration.
