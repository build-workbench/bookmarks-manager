import { create } from 'zustand'
import { parseNetscapeBookmarks, type Bookmark } from '../utils/bookmarkParser'
import { normalizeUrl, getHostname } from '../utils/url'
import { exportAsNetscapeHTML } from '../utils/exporter'
import { normalizePath } from '../utils/folders'
import { clearBookmarks, saveBookmarks, loadBookmarks, type StoredBookmark } from '../utils/db'
import { createSearchIndex, resetSearchIndex, search as searchBookmarks, type SearchResultItem } from '../utils/search'

type Stats = { total: number, duplicates: number, byDomain: Record<string, number>, byYear: Record<string, number> }

type State = {
  rawItems: Bookmark[]
  mergedItems: Bookmark[]
  duplicates: Record<string, Bookmark[]>
  importing: boolean
  loading: boolean
  needsMerge: boolean
  stats: Stats
  importFiles: (files: FileList | File[]) => Promise<void>
  removeSourceFile: (sourceFile: string) => void
  mergeAndDedup: () => Promise<void>
  clear: () => Promise<void>
  exportHTML: () => string
  loadFromDB: () => Promise<void>
  search: (query: string) => SearchResultItem[]
}

const useBookmarksStore = create<State>((set, get) => ({
  rawItems: [],
  mergedItems: [],
  duplicates: {},
  importing: false,
  loading: false,
  needsMerge: false,
  stats: { total: 0, duplicates: 0, byDomain: {}, byYear: {} },
  async importFiles(files) {
    set({ importing: true })
    try {
      const list = Array.isArray(files) ? files : Array.from(files)
      const all: Bookmark[] = []
      for (const f of list) {
        const text = await f.text()
        const items = parseNetscapeBookmarks(text, f.name).map(it => ({ ...it, path: normalizePath(it.path) }))
        all.push(...items)
      }
      set((state) => ({ rawItems: state.rawItems.concat(all), needsMerge: true }))
    } finally {
      set({ importing: false })
    }
  },
  removeSourceFile(sourceFile: string) {
    const { rawItems, mergedItems } = get()
    const next = rawItems.filter((it) => (it.sourceFile || 'Unknown') !== sourceFile)
    if (next.length === rawItems.length) return

    if (next.length === 0) {
      void get().clear()
      return
    }

    set({ rawItems: next, needsMerge: mergedItems.length > 0 ? true : get().needsMerge })
  },
  async mergeAndDedup() {
    const raw = get().rawItems
    const groups = new Map<string, Bookmark[]>()
    for (const it of raw) {
      const key = normalizeUrl(it.url)
      const arr = groups.get(key) || []
      arr.push(it)
      groups.set(key, arr)
    }
    const merged: Bookmark[] = []
    const dups: Record<string, Bookmark[]> = {}

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
        dups[k] = [best, ...arr.filter((it) => it.id !== best.id)]
      }
      merged.push(best)
    }
    const byDomain: Record<string, number> = {}
    const byYear: Record<string, number> = {}
    for (const it of merged) {
      const host = getHostname(it.url) || 'unknown'
      byDomain[host] = (byDomain[host] || 0) + 1
      const ts = it.addDate || it.lastModified
      const year = ts ? new Date(ts * 1000).getFullYear().toString() : 'Unknown'
      byYear[year] = (byYear[year] || 0) + 1
    }
    const stats: Stats = { total: merged.length, duplicates: raw.length - merged.length, byDomain, byYear }
    set({ mergedItems: merged, duplicates: dups, stats, needsMerge: false })
    
    const storedItems: StoredBookmark[] = merged.map(it => ({
      ...it,
      normalized: normalizeUrl(it.url)
    }))
    await saveBookmarks(storedItems)
    createSearchIndex(merged)
  },
  async loadFromDB() {
    set({ loading: true })
    try {
      const stored = await loadBookmarks()
      if (stored.length > 0) {
        const merged = stored.map(({ normalized: _normalized, ...rest }) => rest)
        const byDomain: Record<string, number> = {}
        const byYear: Record<string, number> = {}
        for (const it of merged) {
          const host = getHostname(it.url) || 'unknown'
          byDomain[host] = (byDomain[host] || 0) + 1
          const ts = it.addDate || it.lastModified
          const year = ts ? new Date(ts * 1000).getFullYear().toString() : 'Unknown'
          byYear[year] = (byYear[year] || 0) + 1
        }
        const stats: Stats = { total: merged.length, duplicates: 0, byDomain, byYear }
        set({ rawItems: merged, mergedItems: merged, stats, needsMerge: false })
        createSearchIndex(merged)
      }
    } catch (error) {
      console.error('Failed to load bookmarks from DB:', error)
    } finally {
      set({ loading: false })
    }
  },
  async clear() {
    resetSearchIndex()
    set({ rawItems: [], mergedItems: [], duplicates: {}, needsMerge: false, stats: { total: 0, duplicates: 0, byDomain: {}, byYear: {} } })
    try {
      await clearBookmarks()
    } catch (error) {
      console.error('Failed to clear bookmarks from DB:', error)
    }
  },
  exportHTML() {
    const { mergedItems } = get()
    return exportAsNetscapeHTML(mergedItems)
  },
  search(query: string) {
    return searchBookmarks(query)
  }
}))

export default useBookmarksStore
