# Capability: Batch Operations

## Overview

书签批量操作能力，提供多选、批量标签管理、批量删除等功能，支持高效处理大量书签。

## ADDED Requirements

### Requirement 1: 书签多选系统

**User Story:** As a user, I want to select multiple bookmarks at once, so that I can perform operations on them efficiently.

#### Scenario: Enter selection mode

- **WHEN** user clicks "Select" button or long-presses a bookmark
- **THEN** system enters selection mode and shows checkboxes on all bookmarks

#### Scenario: Toggle single selection

- **WHEN** user clicks a bookmark checkbox in selection mode
- **THEN** system toggles the selection state of that bookmark

#### Scenario: Range selection

- **WHEN** user holds Shift and clicks two bookmarks
- **THEN** system selects all bookmarks between the two (inclusive)

#### Scenario: Select all

- **WHEN** user clicks "Select All" button
- **THEN** system selects all bookmarks in current view

#### Scenario: Deselect all

- **WHEN** user clicks "Deselect All" button or escapes selection mode
- **THEN** system clears all selections

#### Scenario: Selection counter

- **WHEN** bookmarks are selected
- **THEN** system displays the count of selected bookmarks in the toolbar

### Requirement 2: 批量标签操作

**User Story:** As a user, I want to add or remove tags from multiple bookmarks at once, so that I can organize my collection efficiently.

#### Scenario: Batch add tags

- **WHEN** user selects multiple bookmarks and clicks "Add Tags"
- **THEN** system shows tag input dialog
- **AND** after confirmation, adds selected tags to all selected bookmarks

#### Scenario: Batch remove tags

- **WHEN** user selects multiple bookmarks and clicks "Remove Tags"
- **THEN** system shows tag selection dialog with common tags
- **AND** after confirmation, removes selected tags from all selected bookmarks

#### Scenario: Batch operation progress

- **WHEN** batch operation involves more than 100 bookmarks
- **THEN** system shows progress bar with current/total count
- **AND** user can cancel the operation

#### Scenario: Batch operation undo

- **WHEN** batch operation completes
- **THEN** system shows toast with "Undo" option for 5 seconds

### Requirement 3: 批量删除

**User Story:** As a user, I want to delete multiple bookmarks at once, so that I can clean up my collection quickly.

#### Scenario: Batch delete with confirmation

- **WHEN** user selects bookmarks and clicks "Delete"
- **THEN** system shows confirmation dialog with count
- **AND** requires explicit confirmation for deletion

#### Scenario: Bulk delete confirmation details

- **WHEN** delete confirmation dialog is shown
- **THEN** system displays the number of bookmarks to be deleted
- **AND** system displays warning if deletion is irreversible

#### Scenario: Delete operation progress

- **WHEN** deleting more than 50 bookmarks
- **THEN** system shows progress indicator
- **AND** operation is performed in Web Worker

### Requirement 4: 批量导出

**User Story:** As a user, I want to export selected bookmarks, so that I can share or backup specific subsets.

#### Scenario: Export selected bookmarks

- **WHEN** user selects bookmarks and clicks "Export"
- **THEN** system exports only the selected bookmarks
- **AND** supports HTML, JSON, CSV, and Markdown formats

#### Scenario: Export preserves tags

- **WHEN** exporting to JSON format
- **THEN** tags field is included in the output

#### Scenario: Export without tags for compatibility

- **WHEN** exporting to HTML format
- **THEN** tags are stored in custom data attribute `data-tags`

### Requirement 5: 批量操作性能

**User Story:** As a user with a large bookmark collection, I want batch operations to be responsive, so that the app remains usable.

#### Scenario: Large batch operation handling

- **WHEN** batch operation involves more than 500 bookmarks
- **THEN** system uses Web Worker for processing
- **AND** UI remains responsive during operation

#### Scenario: Operation cancellation

- **WHEN** user clicks "Cancel" during a batch operation
- **THEN** system stops processing and rolls back partial changes
- **AND** displays number of items processed before cancellation
