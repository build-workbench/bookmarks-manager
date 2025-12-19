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
  merging: boolean
  loading: boolean
  needsMerge: boolean
  stage: string
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
  merging: false,
  loading: false,
  needsMerge: false,
  stage: '',
  stats: { total: 0, duplicates: 0, byDomain: {}, byYear: {} },
  async importFiles(files) {
    set({ importing: true, stage: '正在导入与解析...' })
    try {
      const list = Array.isArray(files) ? files : Array.from(files)
      const all: Bookmark[] = []
      for (let i = 0; i < list.length; i++) {
        const f = list[i]
        set({ stage: `正在解析 ${f.name} (${i + 1}/${list.length})...` })
        const text = await f.text()
        const items = parseNetscapeBookmarks(text, f.name).map(it => ({ ...it, path: normalizePath(it.path) }))
        all.push(...items)
      }
      set((state) => ({ rawItems: state.rawItems.concat(all), needsMerge: true }))
    } finally {
      set({ importing: false, stage: '' })
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
    set({ merging: true, stage: '正在合并去重...' })
    try {
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

      set({ stage: '正在计算重复簇与保留项...' })
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
      set({ stage: '正在生成统计数据...' })
      for (const it of merged) {
        const host = getHostname(it.url) || 'unknown'
        byDomain[host] = (byDomain[host] || 0) + 1
        const ts = it.addDate || it.lastModified
        const year = ts ? new Date(ts * 1000).getFullYear().toString() : 'Unknown'
        byYear[year] = (byYear[year] || 0) + 1
      }
      const stats: Stats = { total: merged.length, duplicates: raw.length - merged.length, byDomain, byYear }
      set({ mergedItems: merged, duplicates: dups, stats, needsMerge: false })
      
      set({ stage: '正在保存到本地数据库...' })
      const storedItems: StoredBookmark[] = merged.map(it => ({
        ...it,
        normalized: normalizeUrl(it.url)
      }))
      await saveBookmarks(storedItems)

      set({ stage: '正在构建搜索索引...' })
      createSearchIndex(merged)
    } finally {
      set({ merging: false, stage: '' })
    }
  },
  async loadFromDB() {
    set({ loading: true, stage: '正在从本地数据库恢复数据...' })
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
      set({ loading: false, stage: '' })
    }
  },
  async clear() {
    resetSearchIndex()
    set({ stage: '正在清空本地数据...' })
    set({ rawItems: [], mergedItems: [], duplicates: {}, needsMerge: false, stats: { total: 0, duplicates: 0, byDomain: {}, byYear: {} } })
    try {
      await clearBookmarks()
    } catch (error) {
      console.error('Failed to clear bookmarks from DB:', error)
    } finally {
      set({ stage: '' })
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
