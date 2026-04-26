# Screenshots

This directory contains the app screenshots displayed in README files.

## Files

| File              | Description                                                          |
| ----------------- | -------------------------------------------------------------------- |
| `dashboard.svg`   | Dashboard interface preview showing bookmark statistics and charts   |
| `search.svg`      | Search interface with full-text search results                       |
| `ai-analysis.svg` | Optional AI settings interface for local BYOK provider configuration |

## Technical Notes

- Screenshots are in **SVG format** for crisp display at any resolution
- SVGs are lightweight (~3KB each) compared to PNG screenshots
- Visual design matches the app's actual dark theme UI
- To update with real screenshots, replace SVG files with PNG/JPG

## Generating Real Screenshots

To generate actual app screenshots:

1. Run the app locally:

   ```bash
   npm run dev
   ```

2. Import sample bookmarks via the upload page

3. Navigate to Dashboard, Search, and the AI settings page

4. Take screenshots using browser dev tools or system tools:
   - Chrome DevTools: `Ctrl+Shift+P` → "Capture screenshot"
   - macOS: `Cmd+Shift+4`
   - Windows: `Win+Shift+S`

5. Save as PNG in this directory and update README references
