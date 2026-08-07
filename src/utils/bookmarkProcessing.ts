import type { Bookmark } from './bookmarkParser'
import { getHostname, normalizeUrl } from './url'
import { classifyBookmarks } from './classify'

export type BookmarkStats = {
  total: number
  duplicates: number
  byDomain: Record<string, number>
  byYear: Record<string, number>
  byCategory: Record<string, number>
}

export type BookmarkProcessingResult = {
  merged: Bookmark[]
  duplicates: Record<string, Bookmark[]>
  stats: BookmarkStats
}

const TITLE_SIMILARITY_THRESHOLD = 0.8

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
    byYear,
    byCategory: classifyBookmarks(merged)
  }
}

function getBookmarkTimestamp(item: Bookmark): number {
  const timestamp = item.addDate ?? item.lastModified
  return typeof timestamp === 'number' && timestamp > 0 ? timestamp : Number.POSITIVE_INFINITY
}

/**
 * Word-level Jaccard similarity for title comparison.
 * Words shorter than 3 characters are ignored to reduce noise.
 */
function titleSimilarity(a: string, b: string): number {
  const wordsA = new Set(a.toLowerCase().split(/\s+/).filter((w) => w.length > 2))
  const wordsB = new Set(b.toLowerCase().split(/\s+/).filter((w) => w.length > 2))
  if (wordsA.size === 0 || wordsB.size === 0) return 0
  let intersection = 0
  for (const w of wordsA) {
    if (wordsB.has(w)) intersection++
  }
  return intersection / (wordsA.size + wordsB.size - intersection)
}

/**
 * Phase 1: deduplicate by normalized URL.
 */
function dedupByUrl(bookmarks: Bookmark[]): { merged: Bookmark[]; duplicates: Record<string, Bookmark[]> } {
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

  return { merged, duplicates }
}

/**
 * Phase 2: deduplicate by title similarity within the same domain.
 * Catches cases where the same resource has different URLs
 * (e.g. different query params, http vs https, mobile vs desktop).
 */
function dedupByTitleSimilarity(
  merged: Bookmark[],
  duplicates: Record<string, Bookmark[]>
): { merged: Bookmark[]; duplicates: Record<string, Bookmark[]> } {
  const domainGroups = new Map<string, Bookmark[]>()
  for (const item of merged) {
    const host = getHostname(item.url)
    const group = domainGroups.get(host) || []
    group.push(item)
    domainGroups.set(host, group)
  }

  const result: Bookmark[] = []
  const newDuplicates = { ...duplicates }
  const removed = new Set<string>()

  for (const group of domainGroups.values()) {
    if (group.length < 2) {
      result.push(...group)
      continue
    }
    for (let i = 0; i < group.length; i++) {
      if (removed.has(group[i].id)) continue
      const keep = group[i]
      const similar: Bookmark[] = []

      for (let j = i + 1; j < group.length; j++) {
        if (removed.has(group[j].id)) continue
        if (titleSimilarity(keep.title, group[j].title) >= TITLE_SIMILARITY_THRESHOLD) {
          similar.push(group[j])
          removed.add(group[j].id)
        }
      }

      if (similar.length > 0) {
        const key = normalizeUrl(keep.url)
        const existing = newDuplicates[key] || [keep]
        newDuplicates[key] = [...existing, ...similar]
      }
      result.push(keep)
    }
  }

  return { merged: result, duplicates: newDuplicates }
}

export function processBookmarks(bookmarks: Bookmark[]): BookmarkProcessingResult {
  // Phase 1: URL exact match + normalization
  const urlResult = dedupByUrl(bookmarks)

  // Phase 2: title similarity within same domain
  const titleResult = dedupByTitleSimilarity(urlResult.merged, urlResult.duplicates)

  const stats = createBookmarkStats(titleResult.merged, bookmarks.length - titleResult.merged.length)

  return {
    merged: titleResult.merged,
    duplicates: titleResult.duplicates,
    stats
  }
}
