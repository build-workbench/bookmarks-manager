import { describe, it, expect, beforeEach } from 'vitest'
import useBookmarksStore from './useBookmarksStore'
import { db } from '@/utils/db'
import type { StoredBookmark } from '@/utils/db'
import type { Bookmark } from '@/utils/bookmarkParser'

const bookmark = (overrides: Partial<Bookmark> = {}): Bookmark => ({
  id: crypto.randomUUID(),
  title: 'Example',
  url: 'https://example.com',
  path: ['Root'],
  sourceFile: 'bookmarks.html',
  addDate: 1700000000,
  ...overrides
})

const storedBookmark = (overrides: Partial<StoredBookmark> = {}): StoredBookmark => ({
  ...bookmark(),
  normalized: 'https://example.com/',
  ...overrides
})

describe('useBookmarksStore', () => {
  beforeEach(async () => {
    await db.bookmarks.clear()
    useBookmarksStore.setState({
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
      stats: { total: 0, duplicates: 0, byDomain: {}, byYear: {} }
    })
  })

  it('loadFromDB restores only merged snapshot state', async () => {
    await db.bookmarks.bulkAdd([
      storedBookmark({ id: '1', url: 'https://a.com', normalized: 'https://a.com/' }),
      storedBookmark({ id: '2', url: 'https://b.com', normalized: 'https://b.com/' })
    ])

    await useBookmarksStore.getState().loadFromDB()
    const state = useBookmarksStore.getState()

    expect(state.rawItems).toEqual([])
    expect(state.restoredItems).toHaveLength(2)
    expect(state.mergedItems).toHaveLength(2)
    expect(state.hasFullMergeData).toBe(false)
    expect(state.needsMerge).toBe(false)
    expect(state.duplicates).toEqual({})
    expect(state.stats.total).toBe(2)
  })

  it('removeSourceFile invalidates stale derived data', () => {
    const first = bookmark({ id: '1', sourceFile: 'a.html', url: 'https://a.com' })
    const second = bookmark({ id: '2', sourceFile: 'b.html', url: 'https://b.com' })

    useBookmarksStore.setState({
      rawItems: [first, second],
      restoredItems: [],
      mergedItems: [first],
      duplicates: { dup: [first, second] },
      needsMerge: false,
      hasFullMergeData: true,
      stats: { total: 1, duplicates: 1, byDomain: { 'a.com': 1 }, byYear: { '2023': 1 } }
    })

    useBookmarksStore.getState().removeSourceFile('a.html')
    const state = useBookmarksStore.getState()

    expect(state.rawItems).toEqual([second])
    expect(state.mergedItems).toEqual([])
    expect(state.duplicates).toEqual({})
    expect(state.needsMerge).toBe(true)
    expect(state.hasFullMergeData).toBe(false)
    expect(state.stats.total).toBe(0)
  })

  it('clear resets restored snapshot state too', async () => {
    const saved = storedBookmark({ id: '1', normalized: 'https://example.com/' })
    await db.bookmarks.add(saved)

    useBookmarksStore.setState({
      rawItems: [bookmark({ id: 'raw-1' })],
      restoredItems: [bookmark({ id: 'restored-1' })],
      mergedItems: [bookmark({ id: 'merged-1' })],
      duplicates: { dup: [bookmark({ id: 'd1' }), bookmark({ id: 'd2' })] },
      needsMerge: true,
      hasFullMergeData: true,
      stats: { total: 1, duplicates: 1, byDomain: { 'example.com': 1 }, byYear: { '2023': 1 } }
    })

    await useBookmarksStore.getState().clear()
    const state = useBookmarksStore.getState()

    expect(state.rawItems).toEqual([])
    expect(state.restoredItems).toEqual([])
    expect(state.mergedItems).toEqual([])
    expect(state.duplicates).toEqual({})
    expect(state.needsMerge).toBe(false)
    expect(state.hasFullMergeData).toBe(false)
    expect(state.stats.total).toBe(0)
    expect(await db.bookmarks.count()).toBe(0)
  })
})
