/**
 * Bookmark Processing Web Worker
 * Handles parsing, merging, deduplication and search index building off the main thread
 */

import type { Bookmark } from '@/utils/bookmarkParser'
import { parseNetscapeBookmarks } from '@/utils/bookmarkParser'
import { normalizeUrl, getHostname } from '@/utils/url'
import { normalizePath } from '@/utils/folders'
import MiniSearch from 'minisearch'

// Worker message types
export type WorkerMessage =
  | { type: 'PARSE_FILES'; payload: { files: Array<{ name: string; content: string }> } }
  | { type: 'MERGE_DEDUP'; payload: { bookmarks: Bookmark[] } }
  | { type: 'BUILD_SEARCH_INDEX'; payload: { bookmarks: Bookmark[] } }
  | { type: 'COMPUTE_STATS'; payload: { bookmarks: Bookmark[]; duplicates: Record<string, Bookmark[]> } }

export type WorkerResponse =
  | { type: 'PARSE_FILES_RESULT'; payload: { bookmarks: Bookmark[]; errors: string[] } }
  | { type: 'PARSE_FILES_PROGRESS'; payload: { current: number; total: number; fileName: string } }
  | { type: 'MERGE_DEDUP_RESULT'; payload: { merged: Bookmark[]; duplicates: Record<string, Bookmark[]> } }
  | { type: 'MERGE_DEDUP_PROGRESS'; payload: { stage: string } }
  | { type: 'SEARCH_INDEX_RESULT'; payload: { success: boolean } }
  | { type: 'STATS_RESULT'; payload: { total: number; duplicates: number; byDomain: Record<string, number>; byYear: Record<string, number> } }
  | { type: 'ERROR'; payload: { message: string; details?: string } }

// Stats computation helper
function computeStats(merged: Bookmark[], duplicates: Record<string, Bookmark[]>): WorkerResponse & { type: 'STATS_RESULT' } {
  const byDomain: Record<string, number> = {}
  const byYear: Record<string, number> = {}
  
  for (const it of merged) {
    const host = getHostname(it.url) || 'unknown'
    byDomain[host] = (byDomain[host] || 0) + 1
    const ts = it.addDate || it.lastModified
    const year = ts ? new Date(ts * 1000).getFullYear().toString() : 'Unknown'
    byYear[year] = (byYear[year] || 0) + 1
  }
  
  return {
    type: 'STATS_RESULT',
    payload: {
      total: merged.length,
      duplicates: Object.keys(duplicates).length,
      byDomain,
      byYear
    }
  }
}

// Search index builder
function buildSearchIndex(bookmarks: Bookmark[]): MiniSearch<Bookmark> {
  const searchIndex = new MiniSearch<Bookmark>({
    fields: ['title', 'url', 'path'],
    storeFields: ['id', 'title', 'url', 'path', 'addDate', 'lastModified', 'sourceFile'],
    searchOptions: {
      boost: { title: 2, url: 1, path: 1 },
      fuzzy: 0.2,
      prefix: true
    },
    extractField: (document, fieldName) => {
      if (fieldName === 'path') {
        return document.path.join(' ')
      }
      return (document as Record<string, unknown>)[fieldName] as string
    }
  })

  searchIndex.addAll(bookmarks)
  return searchIndex
}

// Parse files
function parseFiles(files: Array<{ name: string; content: string }>): { bookmarks: Bookmark[]; errors: string[] } {
  const all: Bookmark[] = []
  const errors: string[] = []

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    
    // Send progress update
    self.postMessage({
      type: 'PARSE_FILES_PROGRESS',
      payload: { current: i + 1, total: files.length, fileName: file.name }
    } as WorkerResponse)

    try {
      const items = parseNetscapeBookmarks(file.content, file.name)
        .map(it => ({ ...it, path: normalizePath(it.path) }))
      all.push(...items)
    } catch (error) {
      errors.push(`解析 ${file.name} 失败: ${error}`)
    }
  }

  return { bookmarks: all, errors }
}

// Merge and deduplicate
function mergeAndDedup(bookmarks: Bookmark[]): { merged: Bookmark[]; duplicates: Record<string, Bookmark[]> } {
  self.postMessage({
    type: 'MERGE_DEDUP_PROGRESS',
    payload: { stage: '正在归一化 URL...' }
  } as WorkerResponse)

  const groups = new Map<string, Bookmark[]>()
  
  for (const it of bookmarks) {
    const key = normalizeUrl(it.url)
    const arr = groups.get(key) || []
    arr.push(it)
    groups.set(key, arr)
  }

  self.postMessage({
    type: 'MERGE_DEDUP_PROGRESS',
    payload: { stage: '正在计算重复簇...' }
  } as WorkerResponse)

  const merged: Bookmark[] = []
  const duplicates: Record<string, Bookmark[]> = {}

  const getBookmarkTimestamp = (it: Bookmark): number => {
    const ts = it.addDate ?? it.lastModified
    return typeof ts === 'number' && ts > 0 ? ts : Number.POSITIVE_INFINITY
  }

  for (const [k, arr] of groups) {
    let best = arr[0]
    for (const it of arr) {
      if (getBookmarkTimestamp(it) < getBookmarkTimestamp(best)) best = it
    }
    if (arr.length > 1) {
      duplicates[k] = [best, ...arr.filter((it) => it.id !== best.id)]
    }
    merged.push(best)
  }

  return { merged, duplicates }
}

// Message handler
self.onmessage = function (event: MessageEvent<WorkerMessage>) {
  const { type, payload } = event.data

  try {
    switch (type) {
      case 'PARSE_FILES': {
        const { bookmarks, errors } = parseFiles(payload.files)
        self.postMessage({
          type: 'PARSE_FILES_RESULT',
          payload: { bookmarks, errors }
        } as WorkerResponse)
        break
      }

      case 'MERGE_DEDUP': {
        const { merged, duplicates } = mergeAndDedup(payload.bookmarks)
        self.postMessage({
          type: 'MERGE_DEDUP_RESULT',
          payload: { merged, duplicates }
        } as WorkerResponse)
        
        // Compute and send stats
        const stats = computeStats(merged, duplicates)
        self.postMessage(stats)
        break
      }

      case 'BUILD_SEARCH_INDEX': {
        buildSearchIndex(payload.bookmarks)
        self.postMessage({
          type: 'SEARCH_INDEX_RESULT',
          payload: { success: true }
        } as WorkerResponse)
        break
      }

      default:
        self.postMessage({
          type: 'ERROR',
          payload: { message: `Unknown message type: ${type}` }
        } as WorkerResponse)
    }
  } catch (error) {
    self.postMessage({
      type: 'ERROR',
      payload: { 
        message: error instanceof Error ? error.message : 'Worker processing error',
        details: error instanceof Error ? error.stack : undefined
      }
    } as WorkerResponse)
  }
}
