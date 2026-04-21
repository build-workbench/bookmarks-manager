/**
 * Worker-based Bookmarks Store
 * Replaces the synchronous processing with Web Worker for better performance
 */

import { create } from 'zustand'
import { parseNetscapeBookmarks, type Bookmark } from '@/utils/bookmarkParser'
import { exportAsNetscapeHTML } from '@/utils/exporters'
import { normalizePath } from '@/utils/folders'
import { normalizeUrl } from '@/utils/url'
import { clearBookmarks, saveBookmarks, loadBookmarks, type StoredBookmark } from '@/utils/db'
import { createSearchIndex, resetSearchIndex, search as searchBookmarks, type SearchResultItem } from '@/utils/search'
import { getWorkerClient, terminateWorker } from '@/workers/bookmarkWorkerClient'

type Stats = { total: number; duplicates: number; byDomain: Record<string, number>; byYear: Record<string, number> }

interface State {
  rawItems: Bookmark[]
  restoredItems: Bookmark[]
  mergedItems: Bookmark[]
  duplicates: Record<string, Bookmark[]>
  importing: boolean
  merging: boolean
  loading: boolean
  needsMerge: boolean
  hasFullMergeData: boolean
  stage: string
  stats: Stats
  useWorker: boolean // Feature toggle
  
  // Actions
  importFiles: (files: FileList | File[]) => Promise<void>
  removeSourceFile: (sourceFile: string) => void
  mergeAndDedup: () => Promise<void>
  clear: () => Promise<void>
  exportHTML: () => string
  exportAsFormat: (format: 'html' | 'json' | 'csv' | 'markdown', options?: Record<string, unknown>) => Promise<string>
  loadFromDB: () => Promise<void>
  search: (query: string) => SearchResultItem[]
  toggleWorker: () => void
}

const emptyStats: Stats = { total: 0, duplicates: 0, byDomain: {}, byYear: {} }

// Check if Worker is supported
const isWorkerSupported = typeof Worker !== 'undefined'

export const useBookmarksStoreWithWorker = create<State>((set, get) => {
  const invalidateDerivedData = () => {
    resetSearchIndex()
    set({
      restoredItems: [],
      mergedItems: [],
      duplicates: {},
      needsMerge: true,
      hasFullMergeData: false,
      stats: emptyStats
    })
  }

  // Traditional synchronous parse (fallback)
  const parseFilesTraditional = async (list: File[]): Promise<Bookmark[]> => {
    const all: Bookmark[] = []
    for (let i = 0; i < list.length; i++) {
      const f = list[i]
      set({ stage: `正在解析 ${f.name} (${i + 1}/${list.length})...` })
      const text = await f.text()
      const items = parseNetscapeBookmarks(text, f.name).map(it => ({ ...it, path: normalizePath(it.path) }))
      all.push(...items)
    }
    return all
  }

  // Worker-based parse
  const parseFilesWithWorker = async (list: File[]): Promise<Bookmark[]> => {
    const worker = getWorkerClient()
    const files = await Promise.all(
      list.map(async (f) => ({
        name: f.name,
        content: await f.text()
      }))
    )

    const result = await worker.parseFiles(files, (current, total, fileName) => {
      set({ stage: `正在解析 ${fileName} (${current}/${total})... (Worker)` })
    })

    if (result.errors.length > 0) {
      console.warn('Parse errors:', result.errors)
    }

    return result.bookmarks
  }

  return {
    rawItems: [],
    restoredItems: [],
    mergedItems: [],
    duplicates: {},
    importing: false,
    merging: false,
    loading: false,
    needsMerge: false,
    hasFullMergeData: false,
    stage: '',
    stats: emptyStats,
    useWorker: isWorkerSupported, // Auto-enable if supported

    async importFiles(files) {
      set({ importing: true, stage: '正在导入与解析...' })
      
      try {
        const list = Array.isArray(files) ? files : Array.from(files)
        const useWorker = get().useWorker && isWorkerSupported && list.length > 5 // Use worker for many files

        let all: Bookmark[]
        if (useWorker) {
          all = await parseFilesWithWorker(list)
        } else {
          all = await parseFilesTraditional(list)
        }

        if (all.length === 0) return

        const hadDerivedData = get().mergedItems.length > 0 || get().restoredItems.length > 0 || get().hasFullMergeData
        set((state) => ({ rawItems: state.rawItems.concat(all) }))

        if (hadDerivedData) {
          invalidateDerivedData()
        } else {
          set({ needsMerge: true })
        }
      } finally {
        set({ importing: false, stage: '' })
      }
    },

    removeSourceFile(sourceFile: string) {
      const { rawItems } = get()
      const next = rawItems.filter((it) => (it.sourceFile || 'Unknown') !== sourceFile)
      if (next.length === rawItems.length) return

      if (next.length === 0) {
        void get().clear()
        return
      }

      set({ rawItems: next })
      invalidateDerivedData()
    },

    async mergeAndDedup() {
      set({ merging: true, stage: '正在合并去重...' })
      
      try {
        const raw = get().rawItems
        const useWorker = get().useWorker && isWorkerSupported && raw.length > 1000 // Use worker for large datasets

        if (useWorker) {
          set({ stage: 'Worker 正在处理...' })
          const worker = getWorkerClient()
          const result = await worker.mergeAndDedup(raw, (stage) => {
            set({ stage })
          })

          set({
            restoredItems: [],
            mergedItems: result.merged,
            duplicates: result.duplicates,
            stats: result.stats,
            needsMerge: false,
            hasFullMergeData: true
          })

          // Save to DB
          set({ stage: '正在保存到本地数据库...' })
          const storedItems: StoredBookmark[] = result.merged.map(it => ({
            ...it,
            normalized: '' // Will be computed by DB normalization
          }))
          await saveBookmarks(storedItems)

          // Build search index
          set({ stage: 'Worker 正在构建搜索索引...' })
          await worker.buildSearchIndex(result.merged)
          createSearchIndex(result.merged) // Also build in main thread for immediate use
        } else {
          // Traditional synchronous processing (fallback)
          set({ stage: '正在归一化 URL...' })
          const groups = new Map<string, Bookmark[]>()
          
          for (const it of raw) {
            const key = normalizeUrl(it.url)
            const arr = groups.get(key) || []
            arr.push(it)
            groups.set(key, arr)
          }

          set({ stage: '正在计算重复簇与保留项...' })
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

          // Compute stats
          set({ stage: '正在生成统计数据...' })
          const byDomain: Record<string, number> = {}
          const byYear: Record<string, number> = {}
          for (const it of merged) {
            const host = it.url ? new URL(it.url).hostname : 'unknown'
            byDomain[host] = (byDomain[host] || 0) + 1
            const ts = it.addDate || it.lastModified
            const year = ts ? new Date(ts * 1000).getFullYear().toString() : 'Unknown'
            byYear[year] = (byYear[year] || 0) + 1
          }
          const stats = { total: merged.length, duplicates: raw.length - merged.length, byDomain, byYear }

          set({
            restoredItems: [],
            mergedItems: merged,
            duplicates: dups,
            stats,
            needsMerge: false,
            hasFullMergeData: true
          })

          // Save to DB
          set({ stage: '正在保存到本地数据库...' })
          const storedItems: StoredBookmark[] = merged.map(it => ({
            ...it,
            normalized: normalizeUrl(it.url)
          }))
          await saveBookmarks(storedItems)

          // Build search index
          set({ stage: '正在构建搜索索引...' })
          createSearchIndex(merged)
        }
      } catch (error) {
        console.error('Merge failed:', error)
        // Fallback to traditional method on worker error
        if (get().useWorker) {
          // eslint-disable-next-line no-console
          console.log('Falling back to traditional merge...')
          set({ useWorker: false })
          await get().mergeAndDedup()
          set({ useWorker: isWorkerSupported })
        } else {
          throw error
        }
      } finally {
        set({ merging: false, stage: '' })
      }
    },

    async loadFromDB() {
      set({ loading: true, stage: '正在从本地数据库恢复数据...' })
      try {
        const stored = await loadBookmarks()
        if (stored.length > 0) {
          const restored = stored.map(({ normalized: _normalized, ...rest }) => rest)
          
          // Compute stats
          const byDomain: Record<string, number> = {}
          const byYear: Record<string, number> = {}
          for (const it of restored) {
            const host = it.url ? new URL(it.url).hostname : 'unknown'
            byDomain[host] = (byDomain[host] || 0) + 1
            const ts = it.addDate || it.lastModified
            const year = ts ? new Date(ts * 1000).getFullYear().toString() : 'Unknown'
            byYear[year] = (byYear[year] || 0) + 1
          }
          const stats = { 
            total: restored.length, 
            duplicates: 0, 
            byDomain, 
            byYear 
          }

          set({
            rawItems: [],
            restoredItems: restored,
            mergedItems: restored,
            duplicates: {},
            stats,
            needsMerge: false,
            hasFullMergeData: false
          })
          createSearchIndex(restored)
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
      set({
        rawItems: [],
        restoredItems: [],
        mergedItems: [],
        duplicates: {},
        needsMerge: false,
        hasFullMergeData: false,
        stats: emptyStats
      })
      try {
        await clearBookmarks()
        terminateWorker() // Terminate worker on clear
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

    async exportAsFormat(format: 'html' | 'json' | 'csv' | 'markdown', options?: Record<string, unknown>) {
      const { mergedItems } = get()
      // Dynamic import to avoid circular dependency
      const { exportBookmarks } = await import('@/utils/exporters')
      return exportBookmarks(mergedItems, format, options)
    },

    search(query: string) {
      return searchBookmarks(query)
    },

    toggleWorker() {
      set({ useWorker: !get().useWorker })
    }
  }
})
