# Changelog

This file keeps a **curated** release history. It records meaningful product and repository milestones, not every internal tweak.

## Unreleased

### Changed

- Retired the dedicated cleanup workflow and reduced AI to local BYOK configuration plus connection testing
- Rebuilt repository governance around a smaller OpenSpec-driven, solo-maintained workflow
- Simplified CI, Pages deployment, dependency automation, and local hooks
- Refreshed the GitHub Pages landing flow, metadata, and public docs set
- Removed stale documentation and tracked build artifacts that were no longer part of the maintained repo surface

## 1.1.0 - 2026-04-15

### Added

- Multi-format export (HTML, JSON, CSV, Markdown)
- Backup and restore page for local data
- Worker-based processing for larger bookmark sets
- Cleanup workflow and expanded AI analysis surface

### Changed

- Search and dashboard performance improvements
- Documentation and landing-page groundwork for the public release

## 1.0.0 - 2026-03-22

### Added

- GitHub Pages deployment
- HashRouter-based SPA routing
- Local-first bookmark import, merge, deduplication, search, and export baseline
