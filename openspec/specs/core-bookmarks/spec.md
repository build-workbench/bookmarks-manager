# Capability: Core Bookmarks

## Overview

书签管理器的核心功能，提供书签的上传合并、智能去重、搜索、仪表盘统计等基础能力。采用 Local-first 架构，所有数据存储在本地 IndexedDB 中。

## Requirements

### Requirement 1: 书签上传与导入

**User Story:** As a user, I want to import bookmarks from my browser, so that I can manage them in one place.

#### Acceptance Criteria

1. THE Upload_Page SHALL support selecting multiple bookmark HTML files simultaneously
2. THE Upload_Page SHALL support drag-and-drop file import
3. THE Upload_Page SHALL support Netscape Bookmark format from Chrome, Firefox, Edge, and Safari
4. WHEN importing, THE Upload_Page SHALL display real-time statistics including original count, merged count, and duplicate count
5. THE Upload_Page SHALL display a list of imported source files with aggregated statistics
6. THE Upload_Page SHALL support removing individual source files with re-merge prompt
7. WHEN import is in progress, THE Upload_Page SHALL show stage-based loading status and disable relevant interactions

### Requirement 2: 智能去重算法

**User Story:** As a user, I want duplicate bookmarks to be automatically detected and merged, so that I have a clean bookmark collection.

#### Acceptance Criteria

1. THE Deduplication_Service SHALL normalize URLs before comparison (protocol, hostname case, port, trailing slash, query params)
2. THE Deduplication*Service SHALL remove tracking parameters (utm*\*, gclid, fbclid, etc.)
3. WHEN duplicates are found, THE Deduplication_Service SHALL keep the earliest-added bookmark
4. THE Deduplication_Service SHALL intelligently merge directories from different browsers
5. THE Deduplication_Service SHALL recognize root directory aliases from different browsers

### Requirement 3: 书签导出

**User Story:** As a user, I want to export my cleaned bookmarks, so that I can import them into any browser.

#### Acceptance Criteria

1. THE Export_Service SHALL generate standard Netscape Bookmark HTML format
2. THE Export_Service SHALL preserve complete folder hierarchy
3. THE Export_Service SHALL automatically add timestamp to the filename
4. THE exported file SHALL be importable to any major browser

### Requirement 4: 仪表盘统计

**User Story:** As a user, I want to see statistics about my bookmark collection, so that I can understand my collection at a glance.

#### Acceptance Criteria

1. THE Dashboard SHALL display total bookmark count after deduplication
2. THE Dashboard SHALL display duplicate count detected
3. THE Dashboard SHALL display unique domain count
4. THE Dashboard SHALL display a pie chart showing duplicate ratio
5. THE Dashboard SHALL display a bar chart showing top 10 domains
6. THE Dashboard SHALL display a line chart showing bookmarks added by year
7. THE Dashboard SHALL provide expandable/collapsible bookmark list with pagination (20 per page)
8. WHEN clicking a bookmark, THE Dashboard SHALL open the link in a new tab

### Requirement 5: 全文搜索

**User Story:** As a user, I want to search my bookmarks, so that I can quickly find what I need.

#### Acceptance Criteria

1. THE Search_Page SHALL provide full-text search based on MiniSearch engine
2. THE Search_Page SHALL search across title, URL, and folder path fields
3. THE Search_Page SHALL support fuzzy matching with typo tolerance
4. THE Search_Page SHALL provide prefix matching with search-as-you-type
5. THE Search_Page SHALL apply weighted search (title > URL > path)
6. THE Search_Page SHALL highlight matching terms in results
7. THE Search_Page SHALL display 50 results by default with load-more option
8. THE Search_Page SHALL provide real-time search feedback

### Requirement 6: 高级过滤与导出

**User Story:** As a user, I want to filter and export specific bookmarks, so that I can work with subsets of my collection.

#### Acceptance Criteria

1. THE Search_Page SHALL provide filter by domain
2. THE Search_Page SHALL provide filter by top-level folder
3. THE Search_Page SHALL provide filter by folder keyword
4. THE Search_Page SHALL provide filter by time range
5. THE Search_Page SHALL allow combining filters with search
6. THE Search_Page SHALL support exporting all or filtered results
7. THE Search_Page SHALL support export with or without folder structure preservation

### Requirement 7: 重复书签展示

**User Story:** As a user, I want to see all duplicate bookmarks grouped together, so that I can understand what was deduplicated.

#### Acceptance Criteria

1. THE Duplicates_Page SHALL display duplicate groups (clusters)
2. THE Duplicates_Page SHALL visually indicate kept bookmark (green checkmark) and duplicates (gray trash icon)
3. THE Duplicates_Page SHALL display bookmark title, URL, added date, folder path, and source file
4. THE Duplicates_Page SHALL explain the keep rule (earliest added is kept)

### Requirement 8: 本地数据持久化

**User Story:** As a user, I want my data to persist across sessions, so that I don't lose my bookmarks when I close the browser.

#### Acceptance Criteria

1. THE Storage_Service SHALL automatically save bookmarks to IndexedDB after merge
2. THE Storage_Service SHALL automatically load bookmarks on page refresh
3. THE Storage_Service SHALL store bookmarks, settings, AI config, AI cache, AI usage, AI prompts, and usage limits
4. THE Storage_Service SHALL use batch writes for performance optimization
5. THE Storage_Service SHALL use indexed queries for fast retrieval

### Requirement 9: PWA特性

**User Story:** As a user, I want to install this app on my device, so that I can use it like a native application.

#### Acceptance Criteria

1. THE PWA SHALL provide Service Worker caching for offline support
2. THE PWA SHALL support "Add to Home Screen" installation
3. THE PWA SHALL run in standalone window mode
4. THE PWA SHALL provide app icon and theme color

### Requirement 10: 隐私与安全

**User Story:** As a user, I want my data to stay private, so that I can trust this application with my bookmarks.

#### Acceptance Criteria

1. THE Application SHALL process all data client-side only
2. THE Application SHALL NOT require a server or cloud storage
3. THE Application SHALL store API keys securely in IndexedDB
4. THE Application SHALL allow user to export and clear data at any time
