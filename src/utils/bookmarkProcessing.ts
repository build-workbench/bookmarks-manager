import type { Bookmark } from './bookmarkParser'
import { getHostname, normalizeUrl } from './url'

export type BookmarkStats = {
  total: number
  duplicates: number
  byDomain: Record<string, number>
  byYear: Record<string, number>
}

export type BookmarkProcessingResult = {
  merged: Bookmark[]
  duplicates: Record<string, Bookmark[]>
  stats: BookmarkStats
}

export function createBookmarkStats(merged: Bookmark[], duplicateCount: number): BookmarkStats {
  const byDomain: Record<string, number> = {}
  const byYear: Record<string, number> = {}

  for (const item of merged) {
    const host = getHostname(item.url) || 'unknown'
    byDomain[host] = (byDomain[host] || 0) + 1
    const timestamp = item.addDate || item.lastModified
    const year = timestamp ? new Date(timestamp * 1000).getFullYear().toString() : 'Unknown'
    byYear[year] = (byYear[year] || 0) + 1
  }

  return {
    total: merged.length,
    duplicates: duplicateCount,
    byDomain,
    byYear
  }
}

function getBookmarkTimestamp(item: Bookmark): number {
  const timestamp = item.addDate ?? item.lastModified
  return typeof timestamp === 'number' && timestamp > 0 ? timestamp : Number.POSITIVE_INFINITY
}

export function processBookmarks(bookmarks: Bookmark[]): BookmarkProcessingResult {
  const groups = new Map<string, Bookmark[]>()

  for (const item of bookmarks) {
    const key = normalizeUrl(item.url)
    const group = groups.get(key) || []
    group.push(item)
    groups.set(key, group)
  }

  const merged: Bookmark[] = []
  const duplicates: Record<string, Bookmark[]> = {}

  for (const [key, group] of groups) {
    let best = group[0]

    for (const item of group) {
      if (getBookmarkTimestamp(item) < getBookmarkTimestamp(best)) {
        best = item
      }
    }

    if (group.length > 1) {
      duplicates[key] = [best, ...group.filter((item) => item.id !== best.id)]
    }

    merged.push(best)
  }

  return {
    merged,
    duplicates,
    stats: createBookmarkStats(merged, bookmarks.length - merged.length)
  }
}
