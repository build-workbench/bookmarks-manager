# Capability: Advanced Filtering

## Overview

高级过滤系统提供统一的过滤界面，支持多维度筛选条件组合、预设保存与复用，让用户高效定位目标书签。

## ADDED Requirements

### Requirement 1: 统一过滤面板

**User Story:** As a user, I want a unified filtering interface, so that I can combine multiple filter criteria easily.

#### Scenario: Filter panel access

- **WHEN** user clicks "Filters" button on Search page
- **THEN** system expands the filter panel showing all available filters

#### Scenario: Multiple filter combination

- **WHEN** user sets multiple filter criteria
- **THEN** system applies AND logic between different filter types
- **AND** shows the combined result count in real-time

#### Scenario: Clear all filters

- **WHEN** user clicks "Clear All" button
- **THEN** system resets all filter criteria to default
- **AND** shows all bookmarks

#### Scenario: Active filters indicator

- **WHEN** any filter is active
- **THEN** system shows count badge on Filters button
- **AND** displays active filters as removable chips

### Requirement 2: 日期范围过滤

**User Story:** As a user, I want to filter bookmarks by date range, so that I can find bookmarks from a specific time period.

#### Scenario: Date range selection

- **WHEN** user opens date filter
- **THEN** system shows date range picker with start and end dates

#### Scenario: Preset date ranges

- **WHEN** user views date filter
- **THEN** system offers quick presets: Today, Last 7 Days, Last 30 Days, Last Year, Custom

#### Scenario: Custom date range

- **WHEN** user selects "Custom" date range
- **THEN** system shows calendar picker for both start and end dates
- **AND** validates that end date is not before start date

#### Scenario: Date filter applies to addDate

- **WHEN** user sets date range filter
- **THEN** system filters bookmarks by their addDate field
- **AND** includes bookmarks where addDate is undefined as "Unknown" option

### Requirement 3: 多域名选择器

**User Story:** As a user, I want to filter by multiple domains, so that I can work with related websites together.

#### Scenario: Domain list display

- **WHEN** user opens domain filter
- **THEN** system shows all domains sorted by bookmark count
- **AND** shows count next to each domain

#### Scenario: Multi-select domains

- **WHEN** user selects multiple domains
- **THEN** system shows bookmarks from any selected domain (OR logic)

#### Scenario: Domain search

- **WHEN** user types in domain search box
- **THEN** system filters the domain list to matching entries
- **AND** supports partial matching

#### Scenario: Select all domains

- **WHEN** user clicks "Select All" in domain filter
- **THEN** system selects all domains
- **AND** this is equivalent to no domain filter

### Requirement 4: 标签选择器

**User Story:** As a user, I want to filter by tags, so that I can view bookmarks by topic.

#### Scenario: Tag filter display

- **WHEN** user opens tag filter
- **THEN** system shows all tags sorted by usage count
- **AND** shows count next to each tag

#### Scenario: Tag filter modes

- **WHEN** user selects tags in filter
- **THEN** system allows choosing "Match All" or "Match Any" mode

#### Scenario: Exclude tags in filter

- **WHEN** user marks tags as excluded
- **THEN** system shows bookmarks that do NOT have those tags

#### Scenario: Untagged filter option

- **WHEN** user views tag filter
- **THEN** system shows "Untagged" option to filter bookmarks without tags

### Requirement 5: 过滤预设

**User Story:** As a user, I want to save filter combinations, so that I can quickly apply my common searches.

#### Scenario: Save filter preset

- **WHEN** user clicks "Save Preset" with active filters
- **THEN** system prompts for preset name
- **AND** saves the current filter configuration

#### Scenario: Apply saved preset

- **WHEN** user selects a saved preset
- **THEN** system applies all filters from that preset
- **AND** updates the results view

#### Scenario: Manage presets

- **WHEN** user opens preset manager
- **THEN** system shows list of saved presets
- **AND** allows rename, delete, or duplicate presets

#### Scenario: Preset limit

- **WHEN** user has 20 saved presets
- **THEN** system shows warning when trying to create more
- **AND** suggests deleting unused presets

### Requirement 6: 过滤性能

**User Story:** As a user with many bookmarks, I want filtering to be fast, so that I can iterate quickly.

#### Scenario: Filter with debounce

- **WHEN** user types in search or filter inputs
- **THEN** system waits 300ms before applying the filter
- **AND** cancels pending filter if input changes

#### Scenario: Filter result count

- **WHEN** filters are applied
- **THEN** system shows "X of Y bookmarks" in the header
- **AND** updates count in real-time

#### Scenario: Virtual scrolling with filters

- **WHEN** filter results exceed 200 items
- **THEN** system uses virtual scrolling for performance
- **AND** maintains scroll position on filter change

### Requirement 7: 过滤状态同步

**User Story:** As a user, I want my filter state to persist, so that I can resume where I left off.

#### Scenario: Filter state in URL

- **WHEN** user applies filters
- **THEN** system updates URL with filter parameters
- **AND** supports sharing the URL to restore filter state

#### Scenario: Restore from URL

- **WHEN** user opens a URL with filter parameters
- **THEN** system parses and applies the filters
- **AND** shows the filtered results

#### Scenario: Session persistence

- **WHEN** user refreshes the page
- **THEN** system restores the last active filters
- **AND** maintains the filter panel expanded/collapsed state
