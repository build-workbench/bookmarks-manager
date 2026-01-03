# Requirements Document

## Introduction

AI辅助书签整理工作流是一个帮助用户高效清理和整理浏览器书签的功能。用户可以在AI的辅助下，快速识别并删除不需要的书签，同时对需要保留的书签进行智能分类整理，最终导出为标准HTML格式导入浏览器，实现书签的全面更新。

## Glossary

- **Cleanup_Workflow**: 书签清理整理工作流，包含筛选、删除、分类、导出的完整流程
- **Bookmark_Selector**: 书签选择器，用于批量选择书签进行操作
- **AI_Cleanup_Advisor**: AI清理顾问，分析书签并提供删除/保留建议
- **Category_Manager**: 分类管理器，管理书签的文件夹分类
- **Batch_Editor**: 批量编辑器，支持对多个书签同时进行操作
- **Export_Preview**: 导出预览，在导出前预览最终的书签结构

## Requirements

### Requirement 1: 批量选择与删除书签

**User Story:** As a user, I want to select multiple bookmarks and delete them in batch, so that I can quickly remove unwanted bookmarks.

#### Acceptance Criteria

1. THE Bookmark_Selector SHALL provide checkbox selection for individual bookmarks
2. THE Bookmark_Selector SHALL provide "select all" and "deselect all" functionality for current view
3. WHEN bookmarks are selected, THE Batch_Editor SHALL display the count of selected items
4. WHEN user confirms deletion, THE Cleanup_Workflow SHALL remove selected bookmarks from the local database
5. WHEN bookmarks are deleted, THE Cleanup_Workflow SHALL update all related statistics and indexes immediately
6. IF deletion fails for any bookmark, THEN THE Cleanup_Workflow SHALL display an error message and rollback the operation

### Requirement 2: AI智能清理建议

**User Story:** As a user, I want AI to analyze my bookmarks and suggest which ones to delete, so that I can make informed decisions about cleanup.

#### Acceptance Criteria

1. WHEN user requests AI cleanup analysis, THE AI_Cleanup_Advisor SHALL analyze bookmarks and categorize them into "recommend delete", "recommend keep", and "needs review"
2. THE AI_Cleanup_Advisor SHALL provide a reason for each deletion recommendation (e.g., "duplicate content", "broken link pattern", "outdated content", "low quality")
3. THE AI_Cleanup_Advisor SHALL display confidence score (0-100) for each recommendation
4. WHEN displaying recommendations, THE Cleanup_Workflow SHALL group bookmarks by recommendation type
5. THE Bookmark_Selector SHALL allow user to accept or reject AI recommendations individually or in batch
6. WHEN user accepts AI recommendations, THE Cleanup_Workflow SHALL automatically select the recommended bookmarks for deletion

### Requirement 3: AI智能分类整理

**User Story:** As a user, I want AI to suggest better folder organization for my bookmarks, so that I can have a well-organized bookmark structure.

#### Acceptance Criteria

1. WHEN user requests AI categorization, THE AI_Cleanup_Advisor SHALL analyze bookmark content and suggest optimal folder structure
2. THE AI_Cleanup_Advisor SHALL suggest moving bookmarks to appropriate folders based on content analysis
3. THE Category_Manager SHALL display current folder structure alongside AI-suggested structure
4. THE Category_Manager SHALL allow user to create new folders based on AI suggestions
5. WHEN user accepts category suggestions, THE Batch_Editor SHALL move bookmarks to the suggested folders
6. THE Category_Manager SHALL allow user to manually drag and drop bookmarks between folders
7. THE Category_Manager SHALL prevent creating duplicate folder names at the same level

### Requirement 4: 整理工作流界面

**User Story:** As a user, I want a dedicated cleanup workflow interface, so that I can efficiently work through the cleanup process step by step.

#### Acceptance Criteria

1. THE Cleanup_Workflow SHALL provide a step-by-step interface with stages: "Review & Delete" → "Organize & Categorize" → "Preview & Export"
2. THE Cleanup_Workflow SHALL display progress indicator showing current stage and completion status
3. WHEN user completes a stage, THE Cleanup_Workflow SHALL allow navigation to next stage
4. THE Cleanup_Workflow SHALL allow user to go back to previous stages and make changes
5. THE Cleanup_Workflow SHALL persist workflow state so user can resume later
6. WHEN user is in "Review & Delete" stage, THE Cleanup_Workflow SHALL show AI cleanup recommendations prominently

### Requirement 5: 导出预览与确认

**User Story:** As a user, I want to preview the final bookmark structure before exporting, so that I can verify the organization is correct.

#### Acceptance Criteria

1. WHEN user enters "Preview & Export" stage, THE Export_Preview SHALL display the complete folder tree structure
2. THE Export_Preview SHALL show bookmark count for each folder
3. THE Export_Preview SHALL highlight changes made during the cleanup session (deleted items, moved items, new folders)
4. THE Export_Preview SHALL allow user to expand/collapse folders to review contents
5. WHEN user confirms export, THE Cleanup_Workflow SHALL generate standard Netscape Bookmark HTML file
6. THE Export_Preview SHALL display a summary of changes (total deleted, total moved, new folders created)

### Requirement 6: 快速筛选与过滤

**User Story:** As a user, I want to filter bookmarks by various criteria, so that I can focus on specific subsets during cleanup.

#### Acceptance Criteria

1. THE Bookmark_Selector SHALL provide filter by domain name
2. THE Bookmark_Selector SHALL provide filter by folder/path
3. THE Bookmark_Selector SHALL provide filter by date range (added date)
4. THE Bookmark_Selector SHALL provide filter by AI recommendation status
5. WHEN filters are applied, THE Bookmark_Selector SHALL update the displayed bookmarks immediately
6. THE Bookmark_Selector SHALL allow combining multiple filters with AND logic
7. THE Bookmark_Selector SHALL display the count of filtered results

### Requirement 7: 撤销与恢复操作

**User Story:** As a user, I want to undo my cleanup actions, so that I can recover from mistakes.

#### Acceptance Criteria

1. THE Cleanup_Workflow SHALL maintain an operation history during the cleanup session
2. WHEN user performs delete or move operations, THE Cleanup_Workflow SHALL record the operation for undo
3. THE Cleanup_Workflow SHALL provide an undo button that reverts the last operation
4. THE Cleanup_Workflow SHALL support multiple levels of undo (at least 10 operations)
5. WHEN user undoes an operation, THE Cleanup_Workflow SHALL restore the affected bookmarks to their previous state
6. IF user closes the workflow without exporting, THEN THE Cleanup_Workflow SHALL warn about unsaved changes

