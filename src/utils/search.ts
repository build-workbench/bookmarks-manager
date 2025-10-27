import MiniSearch from 'minisearch'
import type { Bookmark } from './bookmarkParser'

let searchIndex: MiniSearch<Bookmark> | null = null

export function createSearchIndex(bookmarks: Bookmark[]): MiniSearch<Bookmark> {
  searchIndex = new MiniSearch({
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
      return (document as any)[fieldName]
    }
  })

  searchIndex.addAll(bookmarks)
  return searchIndex
}

export function search(query: string, limit = 50): any[] {
  if (!searchIndex || !query.trim()) return []
  const results = searchIndex.search(query)
  return results.slice(0, limit)
}

export function getSearchIndex(): MiniSearch<Bookmark> | null {
  return searchIndex
}
