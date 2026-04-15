import { describe, it, expect } from 'vitest'
import type { Bookmark } from '../bookmarkParser'
import {
  exportAsNetscapeHTML,
  exportAsJSON,
  exportAsCSV,
  exportAsMarkdown,
  exportBookmarks,
  getExportFileExtension,
  getExportMimeType,
  type ExportFormat,
} from './index'

// Test data generator
function createTestBookmarks(): Bookmark[] {
  return [
    {
      id: '1',
      title: 'Google',
      url: 'https://google.com',
      addDate: 1609459200, // 2021-01-01
      path: ['Bookmarks Bar'],
      sourceFile: 'chrome.html',
    },
    {
      id: '2',
      title: 'GitHub',
      url: 'https://github.com',
      addDate: 1609545600, // 2021-01-02
      path: ['Bookmarks Bar', 'Dev'],
      sourceFile: 'chrome.html',
    },
    {
      id: '3',
      title: 'Example with "quotes"',
      url: 'https://example.com',
      addDate: 1609632000,
      path: ['Other Bookmarks'],
      sourceFile: 'firefox.html',
    },
  ]
}

describe('Export Format Utilities', () => {
  describe('getExportFileExtension', () => {
    it('returns correct extension for each format', () => {
      expect(getExportFileExtension('html')).toBe('html')
      expect(getExportFileExtension('json')).toBe('json')
      expect(getExportFileExtension('csv')).toBe('csv')
      expect(getExportFileExtension('markdown')).toBe('md')
    })
  })

  describe('getExportMimeType', () => {
    it('returns correct MIME type for each format', () => {
      expect(getExportMimeType('html')).toContain('text/html')
      expect(getExportMimeType('json')).toContain('application/json')
      expect(getExportMimeType('csv')).toContain('text/csv')
      expect(getExportMimeType('markdown')).toContain('text/markdown')
    })
  })
})

describe('HTML Export', () => {
  it('should export as Netscape HTML format', () => {
    const bookmarks = createTestBookmarks()
    const result = exportAsNetscapeHTML(bookmarks)

    expect(result).toContain('<!DOCTYPE NETSCAPE-Bookmark-file-1>')
    expect(result).toContain('Google')
    expect(result).toContain('https://google.com')
    expect(result).toContain('GitHub')
    expect(result).toContain('<H3>书签栏</H3>') // normalized from 'Bookmarks Bar'
  })

  it('should escape HTML special characters', () => {
    const bookmarks: Bookmark[] = [
      {
        id: '1',
        title: 'Test <script>alert("xss")</script>',
        url: 'https://test.com',
        path: ['Test'],
        sourceFile: 'test.html',
      },
    ]
    const result = exportAsNetscapeHTML(bookmarks)

    expect(result).toContain('&lt;script&gt;')
    expect(result).not.toContain('<script>')
  })

  it('should support flat export without folders', () => {
    const bookmarks = createTestBookmarks()
    const result = exportAsNetscapeHTML(bookmarks, { preserveFolders: false })

    expect(result).toContain('Google')
    expect(result).toContain('GitHub')
    expect(result).not.toContain('<H3>')
  })
})

describe('JSON Export', () => {
  it('should export as JSON with metadata', () => {
    const bookmarks = createTestBookmarks()
    const result = exportAsJSON(bookmarks)

    const parsed = JSON.parse(result)
    expect(parsed).toHaveProperty('exportDate')
    expect(parsed).toHaveProperty('total', 3)
    expect(parsed).toHaveProperty('bookmarks')
    expect(parsed.bookmarks).toHaveLength(3)
    expect(parsed.bookmarks[0]).toHaveProperty('title', 'Google')
  })

  it('should export without metadata when specified', () => {
    const bookmarks = createTestBookmarks()
    const result = exportAsJSON(bookmarks, { includeMetadata: false })

    const parsed = JSON.parse(result)
    expect(Array.isArray(parsed)).toBe(true)
    expect(parsed).toHaveLength(3)
  })

  it('should pretty print JSON by default', () => {
    const bookmarks = createTestBookmarks()
    const result = exportAsJSON(bookmarks)

    expect(result).toContain('\n')
    expect(result).toContain('  ')
  })

  it('should minify JSON when prettyPrint is false', () => {
    const bookmarks = createTestBookmarks()
    const result = exportAsJSON(bookmarks, { prettyPrint: false })

    expect(result).not.toContain('\n  ')
  })
})

describe('CSV Export', () => {
  it('should export as CSV with headers', () => {
    const bookmarks = createTestBookmarks()
    const result = exportAsCSV(bookmarks)

    const lines = result.split('\n')
    expect(lines[0]).toContain('Title')
    expect(lines[0]).toContain('URL')
    expect(lines[0]).toContain('Folder Path')
    expect(lines[1]).toContain('Google')
    expect(lines[1]).toContain('https://google.com')
  })

  it('should escape CSV fields with commas', () => {
    const bookmarks: Bookmark[] = [
      {
        id: '1',
        title: 'Test, with comma',
        url: 'https://test.com',
        path: ['Test'],
        sourceFile: 'test.html',
      },
    ]
    const result = exportAsCSV(bookmarks)

    expect(result).toContain('"Test, with comma"')
  })

  it('should escape CSV fields with quotes', () => {
    const bookmarks: Bookmark[] = [
      {
        id: '1',
        title: 'Say "Hello"',
        url: 'https://test.com',
        path: ['Test'],
        sourceFile: 'test.html',
      },
    ]
    const result = exportAsCSV(bookmarks)

    expect(result).toContain('"Say ""Hello"""')
  })

  it('should support custom delimiter for TSV', () => {
    const bookmarks = createTestBookmarks()
    const result = exportAsCSV(bookmarks, { csvDelimiter: '\t' })

    const lines = result.split('\n')
    expect(lines[0].split('\t').length).toBeGreaterThan(1)
  })

  it('should support minimal CSV without metadata', () => {
    const bookmarks = createTestBookmarks()
    const result = exportAsCSV(bookmarks, { includeMetadata: false })

    const lines = result.split('\n')
    expect(lines[0]).toBe('Title,URL,Folder Path')
    expect(lines[0]).not.toContain('Source File')
  })
})

describe('Markdown Export', () => {
  it('should export as Markdown with headers', () => {
    const bookmarks = createTestBookmarks()
    const result = exportAsMarkdown(bookmarks)

    expect(result).toContain('# Bookmarks')
    expect(result).toContain('Exported:')
    expect(result).toContain('Total: 3 bookmarks')
  })

  it('should create markdown links', () => {
    const bookmarks = createTestBookmarks()
    const result = exportAsMarkdown(bookmarks)

    expect(result).toContain('[Google](https://google.com)')
    expect(result).toContain('[GitHub](https://github.com)')
  })

  it('should preserve folder structure as headings', () => {
    const bookmarks = createTestBookmarks()
    const result = exportAsMarkdown(bookmarks)

    expect(result).toContain('## 书签栏') // normalized from 'Bookmarks Bar'
    expect(result).toContain('### Dev')
  })

  it('should support flat export without folders', () => {
    const bookmarks = createTestBookmarks()
    const result = exportAsMarkdown(bookmarks, { preserveFolders: false })

    expect(result).toContain('[Google](https://google.com)')
    expect(result).not.toContain('## ')
  })
})

describe('Universal Export Function', () => {
  const bookmarks = createTestBookmarks()

  it('should dispatch to HTML exporter', () => {
    const result = exportBookmarks(bookmarks, 'html')
    expect(result).toContain('<!DOCTYPE NETSCAPE-Bookmark-file-1>')
  })

  it('should dispatch to JSON exporter', () => {
    const result = exportBookmarks(bookmarks, 'json')
    expect(JSON.parse(result)).toHaveProperty('bookmarks')
  })

  it('should dispatch to CSV exporter', () => {
    const result = exportBookmarks(bookmarks, 'csv')
    expect(result.split('\n')[0]).toContain('Title')
  })

  it('should dispatch to Markdown exporter', () => {
    const result = exportBookmarks(bookmarks, 'markdown')
    expect(result).toContain('# Bookmarks')
  })

  it('should throw error for unsupported format', () => {
    expect(() => {
      exportBookmarks(bookmarks, 'xml' as ExportFormat)
    }).toThrow('Unsupported export format')
  })
})

describe('Edge Cases', () => {
  it('should handle empty bookmark list', () => {
    const empty: Bookmark[] = []

    expect(exportAsNetscapeHTML(empty)).toContain('<!DOCTYPE')
    expect(JSON.parse(exportAsJSON(empty)).total).toBe(0)
    expect(exportAsCSV(empty).split('\n')).toHaveLength(1) // header only for empty list
    expect(exportAsMarkdown(empty)).toContain('Total: 0 bookmarks')
  })

  it('should handle bookmarks without titles', () => {
    const bookmarks: Bookmark[] = [
      {
        id: '1',
        title: '',
        url: 'https://example.com',
        path: [],
        sourceFile: 'test.html',
      },
    ]

    const html = exportAsNetscapeHTML(bookmarks)
    expect(html).toContain('https://example.com') // should fall back to URL

    const md = exportAsMarkdown(bookmarks)
    expect(md).toContain('[https://example.com](https://example.com)')
  })

  it('should handle deeply nested folders in Markdown', () => {
    const bookmarks: Bookmark[] = [
      {
        id: '1',
        title: 'Deep',
        url: 'https://deep.com',
        path: ['A', 'B', 'C', 'D', 'E', 'F'],
        sourceFile: 'test.html',
      },
    ]

    const result = exportAsMarkdown(bookmarks)
    // Should not exceed H6
    expect(result).not.toContain('#######')
  })
})
