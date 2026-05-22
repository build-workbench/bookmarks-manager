import { create } from 'zustand'
import { parseNetscapeBookmarks, type Bookmark } from '@/utils/bookmarkParser'
import { normalizeUrl } from '@/utils/url'
import { exportBookmarks, type ExportFormat, type ExportOptions } from '@/utils/exporters'
import { normalizePath } from '@/utils/folders'
import { clearBookmarks, saveBookmarks, loadBookmarks, type StoredBookmark } from '@/utils/db'
import {
  createBookmarkStats,
  processBookmarks,
  type BookmarkStats
} from '@/utils/bookmarkProcessing'
import {
  createSearchIndex,
  resetSearchIndex,
  search as searchBookmarks,
  type SearchResultItem
} from '@/utils/search'
import { getWorkerClient, terminateWorker } from '@/workers/bookmarkWorkerClient'
import { t } from '@/locales'

type State = {
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
  stats: BookmarkStats
  useWorker: boolean // Worker toggle
  importFiles: (files: FileList | File[]) => Promise<void>
  removeSourceFile: (sourceFile: string) => void
  mergeAndDedup: () => Promise<void>
  clear: () => Promise<void>
  exportHTML: () => string
  exportAsFormat: (format: ExportFormat, options?: ExportOptions) => string
  loadFromDB: () => Promise<void>
  search: (query: string) => SearchResultItem[]
  toggleWorker: () => void
}

const emptyStats: BookmarkStats = { total: 0, duplicates: 0, byDomain: {}, byYear: {} }

const useBookmarksStore = create<State>((set, get) => {
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
    useWorker: typeof Worker !== 'undefined', // Auto-enable if supported
    async importFiles(files) {
      set({ importing: true, stage: t('stage.importing') })
      try {
        const list = Array.isArray(files) ? files : Array.from(files)
        const all: Bookmark[] = []
        for (let i = 0; i < list.length; i++) {
          const f = list[i]
          set({ stage: t('stage.parsing', { file: f.name, current: i + 1, total: list.length }) })
          const text = await f.text()
          const items = parseNetscapeBookmarks(text, f.name).map((it) => ({
            ...it,
            path: normalizePath(it.path)
          }))
          all.push(...items)
        }
        if (all.length === 0) return

        const hadDerivedData =
          get().mergedItems.length > 0 || get().restoredItems.length > 0 || get().hasFullMergeData
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
      set({ merging: true, stage: t('stage.merging') })
      try {
        const raw = get().rawItems
        const useWorker = get().useWorker && typeof Worker !== 'undefined' && raw.length > 500

        if (useWorker) {
          // Use Web Worker for large datasets
          set({ stage: t('stage.workerProcessing') })
          const worker = getWorkerClient()
          try {
            const result = await worker.mergeAndDedup(raw, (stageMsg) => {
              // Translate worker stage messages
              const translated =
                stageMsg === 'normalizing'
                  ? t('stage.normalizing')
                  : stageMsg === 'computing'
                    ? t('stage.computingDuplicates')
                    : stageMsg
              set({ stage: translated })
            })

            set({
              restoredItems: [],
              mergedItems: result.merged,
              duplicates: result.duplicates,
              stats: result.stats,
              needsMerge: false,
              hasFullMergeData: true
            })

            set({ stage: t('stage.saving') })
            const storedItems: StoredBookmark[] = result.merged.map((it) => ({
              ...it,
              normalized: normalizeUrl(it.url)
            }))
            await saveBookmarks(storedItems)

            set({ stage: t('stage.buildingIndex') })
            createSearchIndex(result.merged)
            return
          } catch (workerError) {
            console.error('Worker failed, falling back to main thread:', workerError)
            set({ useWorker: false })
            set({ stage: t('stage.workerFallback') })
          }
        }

        set({ stage: t('stage.computingClusters') })
        const result = processBookmarks(raw)
        set({
          restoredItems: [],
          mergedItems: result.merged,
          duplicates: result.duplicates,
          stats: result.stats,
          needsMerge: false,
          hasFullMergeData: true
        })

        set({ stage: t('stage.saving') })
        const storedItems: StoredBookmark[] = result.merged.map((it) => ({
          ...it,
          normalized: normalizeUrl(it.url)
        }))
        await saveBookmarks(storedItems)

        set({ stage: t('stage.buildingIndex') })
        createSearchIndex(result.merged)
      } finally {
        set({ merging: false, stage: '' })
      }
    },
    async loadFromDB() {
      set({ loading: true, stage: t('stage.restoring') })
      try {
        const stored = await loadBookmarks()
        if (stored.length > 0) {
          const restored = stored.map(({ normalized: _normalized, ...rest }) => rest)
          const stats = createBookmarkStats(restored, 0)
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
      set({ stage: t('stage.clearing') })
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
        terminateWorker() // Clean up worker
      } catch (error) {
        console.error('Failed to clear bookmarks from DB:', error)
      } finally {
        set({ stage: '' })
      }
    },
    exportHTML() {
      const { mergedItems } = get()
      return exportBookmarks(mergedItems, 'html')
    },
    exportAsFormat(format: ExportFormat, options?: ExportOptions) {
      const { mergedItems } = get()
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

export default useBookmarksStore
