# Changelog

All notable changes to this project will be documented in this file.

## [0.2.0] - 2024-10-27

### Added
- **Persistent Storage with Dexie**: Bookmarks are now automatically saved to IndexedDB after merging, surviving page refreshes
- **Full-Text Search**: New search page powered by MiniSearch with fuzzy matching across titles, URLs, and folder paths
- **Duplicate Management**: Dedicated page to view and manage duplicate bookmark clusters with visual indicators
- **Enhanced Dashboard**: 
  - Collapsible bookmark list view with pagination
  - Improved visual design with icons
  - Better empty states
- **Improved Upload Experience**:
  - Drag-and-drop style file picker
  - Success/error notifications
  - Loading indicators
  - Timestamped export filenames
- **Better AI Page**:
  - API Key storage in IndexedDB
  - Enhanced UI with gradient backgrounds
  - Privacy-focused design with explanations
  - Demo statistics report

### Changed
- Updated navigation to include Search and Duplicates pages
- Improved color scheme and visual hierarchy
- Better responsive design across all pages
- Enhanced error handling throughout the app

### Fixed
- TypeScript build configuration for better compatibility
- Search index creation after data load
- State management in bookmark store

## [0.1.0] - Initial Release

### Added
- Upload and merge multiple bookmark HTML files
- Smart deduplication with URL normalization
- Basic statistics dashboard with ECharts
- Export to Netscape Bookmark HTML format
- PWA support with offline capability
- Dark theme UI with Tailwind CSS
