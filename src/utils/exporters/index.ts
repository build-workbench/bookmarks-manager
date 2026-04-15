/**
 * Multi-format bookmark exporters
 * Supports: Netscape HTML, JSON, CSV, Markdown
 */

import type { Bookmark } from '../bookmarkParser'
import { buildFolderTree, type FolderNode } from '../folders'

export type ExportFormat = 'html' | 'json' | 'csv' | 'markdown'

export interface ExportOptions {
  /** Preserve folder structure (for HTML/Markdown) */
  preserveFolders?: boolean
  /** Include metadata like addDate, sourceFile */
  includeMetadata?: boolean
  /** Pretty print JSON output */
  prettyPrint?: boolean
  /**
   * CSV delimiter, default is comma
   * Use '\t' for TSV format
   */
  csvDelimiter?: string
}

/**
 * Escape HTML special characters
 */
function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/**
 * Escape CSV field - wrap in quotes if contains special characters
 */
function escapeCsvField(field: string, delimiter: string): string {
  // Check if field needs quoting
  if (
    field.includes(delimiter) ||
    field.includes('"') ||
    field.includes('\n') ||
    field.includes('\r')
  ) {
    // Double up quotes and wrap in quotes
    return `"${field.replace(/"/g, '""')}"`
  }
  return field
}

/**
 * Export bookmarks as Netscape HTML format (browser compatible)
 */
export function exportAsNetscapeHTML(
  items: Bookmark[],
  options: ExportOptions = {}
): string {
  const { preserveFolders = true } = options
  const lines: string[] = []

  lines.push('<!DOCTYPE NETSCAPE-Bookmark-file-1>')
  lines.push('<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">')
  lines.push('<TITLE>Bookmarks</TITLE>')
  lines.push('<H1>Bookmarks</H1>')
  lines.push('<DL><p>')

  if (!preserveFolders) {
    for (const b of items) {
      const ts = b.addDate || Math.floor(Date.now() / 1000)
      const title = esc(b.title || b.url)
      const href = esc(b.url)
      lines.push(`<DT><A HREF="${href}" ADD_DATE="${ts}">${title}</A>`)
    }
    lines.push('</DL><p>')
    return lines.join('\n')
  }

  const tree = buildFolderTree(items)

  // Root level bookmarks
  for (const b of tree.bookmarks) {
    const ts = b.addDate || Math.floor(Date.now() / 1000)
    const title = esc(b.title || b.url)
    const href = esc(b.url)
    lines.push(`<DT><A HREF="${href}" ADD_DATE="${ts}">${title}</A>`)
  }

  // Recursively emit folders
  function emitFolder(name: string, node: FolderNode, _depth: number): void {
    const title = esc(name)
    lines.push(`<DT><H3>${title}</H3>`)
    lines.push('<DL><p>')

    for (const b of node.bookmarks) {
      const ts = b.addDate || Math.floor(Date.now() / 1000)
      const t = esc(b.title || b.url)
      const href = esc(b.url)
      lines.push(`<DT><A HREF="${href}" ADD_DATE="${ts}">${t}</A>`)
    }

    for (const [childName, child] of node.folders) {
      emitFolder(childName, child, _depth + 1)
    }

    lines.push('</DL><p>')
  }

  for (const [name, node] of tree.folders) {
    emitFolder(name, node, 0)
  }

  lines.push('</DL><p>')
  return lines.join('\n')
}

/**
 * Export bookmarks as JSON format
 */
export function exportAsJSON(
  items: Bookmark[],
  options: ExportOptions = {}
): string {
  const { includeMetadata = true, prettyPrint = true } = options

  const exportData = includeMetadata
    ? {
        exportDate: new Date().toISOString(),
        total: items.length,
        bookmarks: items,
      }
    : items

  return prettyPrint
    ? JSON.stringify(exportData, null, 2)
    : JSON.stringify(exportData)
}

/**
 * Export bookmarks as CSV format
 */
export function exportAsCSV(
  items: Bookmark[],
  options: ExportOptions = {}
): string {
  const { includeMetadata = true, csvDelimiter = ',' } = options

  const headers = includeMetadata
    ? ['Title', 'URL', 'Folder Path', 'Add Date', 'Source File']
    : ['Title', 'URL', 'Folder Path']

  const lines: string[] = [
    headers.map((h) => escapeCsvField(h, csvDelimiter)).join(csvDelimiter),
  ]

  for (const item of items) {
    const folderPath = item.path?.join('/') || ''

    const fields = includeMetadata
      ? [
          item.title || '',
          item.url,
          folderPath,
          item.addDate
            ? new Date(item.addDate * 1000).toISOString()
            : '',
          item.sourceFile || '',
        ]
      : [item.title || '', item.url, folderPath]

    lines.push(
      fields.map((f) => escapeCsvField(String(f), csvDelimiter)).join(csvDelimiter)
    )
  }

  return lines.join('\n')
}

/**
 * Export bookmarks as Markdown format
 */
export function exportAsMarkdown(
  items: Bookmark[],
  options: ExportOptions = {}
): string {
  const { preserveFolders = true } = options

  const lines: string[] = []
  lines.push('# Bookmarks\n')
  lines.push(`Exported: ${new Date().toLocaleString()}\n`)
  lines.push(`Total: ${items.length} bookmarks\n`)

  if (!preserveFolders) {
    // Flat list
    for (const item of items) {
      const title = item.title || item.url
      lines.push(`- [${title}](${item.url})`)
    }
    return lines.join('\n')
  }

  const tree = buildFolderTree(items)

  // Root level bookmarks
  if (tree.bookmarks.length > 0) {
    lines.push('\n## Root\n')
    for (const b of tree.bookmarks) {
      const title = b.title || b.url
      lines.push(`- [${title}](${b.url})`)
    }
  }

  // Recursively emit folders
  function emitFolder(name: string, node: FolderNode, depth: number): void {
    const headingLevel = Math.min(depth + 2, 6) // Max H6
    lines.push(`\n${'#'.repeat(headingLevel)} ${name}\n`)

    for (const b of node.bookmarks) {
      const title = b.title || b.url
      lines.push(`- [${title}](${b.url})`)
    }

    for (const [childName, child] of node.folders) {
      emitFolder(childName, child, depth + 1)
    }
  }

  for (const [name, node] of tree.folders) {
    emitFolder(name, node, 0)
  }

  return lines.join('\n')
}

/**
 * Universal export function
 * Dispatches to the appropriate exporter based on format
 */
export function exportBookmarks(
  items: Bookmark[],
  format: ExportFormat,
  options: ExportOptions = {}
): string {
  switch (format) {
    case 'html':
      return exportAsNetscapeHTML(items, options)
    case 'json':
      return exportAsJSON(items, options)
    case 'csv':
      return exportAsCSV(items, options)
    case 'markdown':
      return exportAsMarkdown(items, options)
    default:
      throw new Error(`Unsupported export format: ${format}`)
  }
}

/**
 * Get file extension for export format
 */
export function getExportFileExtension(format: ExportFormat): string {
  switch (format) {
    case 'html':
      return 'html'
    case 'json':
      return 'json'
    case 'csv':
      return 'csv'
    case 'markdown':
      return 'md'
    default:
      return 'txt'
  }
}

/**
 * Get MIME type for export format
 */
export function getExportMimeType(format: ExportFormat): string {
  switch (format) {
    case 'html':
      return 'text/html; charset=utf-8'
    case 'json':
      return 'application/json; charset=utf-8'
    case 'csv':
      return 'text/csv; charset=utf-8'
    case 'markdown':
      return 'text/markdown; charset=utf-8'
    default:
      return 'text/plain; charset=utf-8'
  }
}

// Default export
export default {
  exportBookmarks,
  exportAsNetscapeHTML,
  exportAsJSON,
  exportAsCSV,
  exportAsMarkdown,
  getExportFileExtension,
  getExportMimeType,
}
