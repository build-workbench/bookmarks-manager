# Capability: Tag System

## Overview

标签系统提供灵活的书签组织能力，支持标签的创建、管理、搜索和统计，帮助用户建立个性化的分类体系。

## ADDED Requirements

### Requirement 1: 标签创建与分配

**User Story:** As a user, I want to create and assign tags to bookmarks, so that I can organize them by topics.

#### Scenario: Create new tag

- **WHEN** user types a new tag name in tag input
- **THEN** system creates the tag and assigns it to the bookmark
- **AND** tag ID is slugified from the name (lowercase, hyphens)

#### Scenario: Assign existing tag

- **WHEN** user selects from existing tags list
- **THEN** system assigns the selected tag to the bookmark

#### Scenario: Multiple tags assignment

- **WHEN** user selects multiple tags
- **THEN** system assigns all selected tags to the bookmark
- **AND** displays tags as badges in sorted order

#### Scenario: Tag auto-suggestion

- **WHEN** user types in tag input
- **THEN** system shows matching existing tags as suggestions
- **AND** highlights the matching text

### Requirement 2: 标签管理

**User Story:** As a user, I want to manage my tags, so that I can maintain an organized tagging system.

#### Scenario: View all tags

- **WHEN** user opens Tags page
- **THEN** system displays all tags with usage count
- **AND** sorts by usage count by default

#### Scenario: Rename tag

- **WHEN** user renames a tag
- **THEN** system updates the tag display name
- **AND** updates all bookmarks using that tag
- **AND** shows confirmation with affected bookmark count

#### Scenario: Delete tag

- **WHEN** user deletes a tag
- **THEN** system removes the tag from all bookmarks
- **AND** shows confirmation with affected bookmark count before deletion

#### Scenario: Merge tags

- **WHEN** user selects multiple tags and clicks "Merge"
- **THEN** system combines them into one tag
- **AND** transfers all bookmarks to the target tag
- **AND** deletes the source tags

#### Scenario: Tag search

- **WHEN** user searches in Tags page
- **THEN** system filters tags by name
- **AND** supports partial matching

### Requirement 3: 按标签搜索

**User Story:** As a user, I want to search bookmarks by tags, so that I can find related content quickly.

#### Scenario: Filter by single tag

- **WHEN** user clicks on a tag badge
- **THEN** system filters bookmarks to show only those with that tag

#### Scenario: Filter by multiple tags (AND)

- **WHEN** user selects multiple tags with "Match All" mode
- **THEN** system shows bookmarks that have ALL selected tags

#### Scenario: Filter by multiple tags (OR)

- **WHEN** user selects multiple tags with "Match Any" mode
- **THEN** system shows bookmarks that have ANY of the selected tags

#### Scenario: Exclude tags

- **WHEN** user marks a tag as "Exclude"
- **THEN** system shows bookmarks that do NOT have that tag

### Requirement 4: 标签统计与可视化

**User Story:** As a user, I want to see tag statistics, so that I can understand my bookmark distribution.

#### Scenario: Tag cloud display

- **WHEN** user views Dashboard
- **THEN** system displays tag cloud with font size based on usage count
- **AND** clicking a tag filters to that tag

#### Scenario: Tag usage statistics

- **WHEN** user opens Tags page
- **THEN** system displays each tag with:
  - Usage count
  - Creation date
  - Last used date

#### Scenario: Untagged bookmarks

- **WHEN** user views tag statistics
- **THEN** system shows count of bookmarks without any tags
- **AND** clicking shows all untagged bookmarks

### Requirement 5: 标签导入导出

**User Story:** As a user, I want my tags to be preserved during import/export, so that I don't lose my organization.

#### Scenario: Export tags in JSON

- **WHEN** user exports bookmarks to JSON
- **THEN** tags array is included for each bookmark

#### Scenario: Export tags in HTML

- **WHEN** user exports bookmarks to HTML
- **THEN** tags are stored in data-tags attribute on each link
- **AND** format is comma-separated tag IDs

#### Scenario: Import tags from JSON

- **WHEN** user imports JSON file with tags
- **THEN** system preserves the tags
- **AND** creates new tags if they don't exist

#### Scenario: Import tags from HTML

- **WHEN** user imports HTML file with data-tags attribute
- **THEN** system parses and assigns the tags

### Requirement 6: 标签验证与约束

**User Story:** As a user, I want consistent tag behavior, so that my tagging system remains clean.

#### Scenario: Tag name length limit

- **WHEN** user creates a tag longer than 50 characters
- **THEN** system shows error and truncates to 50 characters

#### Scenario: Tag name uniqueness

- **WHEN** user creates a tag with name matching existing tag (case-insensitive)
- **THEN** system uses the existing tag instead of creating duplicate

#### Scenario: Maximum tags per bookmark

- **WHEN** user tries to add more than 20 tags to a bookmark
- **THEN** system shows warning and prevents adding more

#### Scenario: Empty tag prevention

- **WHEN** user tries to create empty or whitespace-only tag
- **THEN** system ignores the input
