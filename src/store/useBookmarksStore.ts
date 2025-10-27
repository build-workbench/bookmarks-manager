import { create } from 'zustand'
import { parseNetscapeBookmarks, type Bookmark } from '../utils/bookmarkParser'
import { normalizeUrl, getHostname } from '../utils/url'
import { exportAsNetscapeHTML } from '../utils/exporter'
import { normalizePath } from '../utils/folders'

type Stats = { total: number, duplicates: number, byDomain: Record<string, number>, byYear: Record<string, number> }

type State = {
  rawItems: Bookmark[]
  mergedItems: Bookmark[]
  duplicates: Record<string, Bookmark[]>
  importing: boolean
  stats: Stats
  importFiles: (files: FileList | File[]) => Promise<void>
  mergeAndDedup: () => Promise<void>
  clear: () => void
  exportHTML: () => string
}

const useBookmarksStore = create<State>((set: any, get: any) => ({
  rawItems: [],
  mergedItems: [],
  duplicates: {},
  importing: false,
  stats: { total: 0, duplicates: 0, byDomain: {}, byYear: {} },
  async importFiles(files) {
    set({ importing: true })
    const list = Array.from(files as any as File[])
    const all: Bookmark[] = []
    for (const f of list) {
      const text = await f.text()
      const items = parseNetscapeBookmarks(text, f.name).map(it => ({ ...it, path: normalizePath(it.path) }))
      all.push(...items)
    }
    set(state => ({ rawItems: state.rawItems.concat(all), importing: false }))
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
    for (const [k, arr] of groups) {
      if (arr.length > 1) dups[k] = arr
      let best = arr[0]
      for (const it of arr) {
        const tBest = best.addDate || best.lastModified || 0
        const t = it.addDate || it.lastModified || 0
        if (t < tBest) best = it
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
    set({ mergedItems: merged, duplicates: dups, stats })
  },
  clear() {
    set({ rawItems: [], mergedItems: [], duplicates: {}, stats: { total: 0, duplicates: 0, byDomain: {}, byYear: {} } })
  },
  exportHTML() {
    const { mergedItems } = get()
    return exportAsNetscapeHTML(mergedItems)
  }
}))

export default useBookmarksStore
