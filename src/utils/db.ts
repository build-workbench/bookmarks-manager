import Dexie, { type Table } from 'dexie'
import type { Bookmark } from './bookmarkParser'

export interface StoredBookmark extends Bookmark {
  normalized: string
}

export interface AppSettings {
  id: string
  apiKey?: string
  lastUpdated: number
}

class BookmarksDB extends Dexie {
  bookmarks!: Table<StoredBookmark, string>
  settings!: Table<AppSettings, string>

  constructor() {
    super('BookmarksDB')
    this.version(1).stores({
      bookmarks: 'id, url, normalized, title, sourceFile',
      settings: 'id'
    })
  }
}

export const db = new BookmarksDB()

export async function clearBookmarks() {
  await db.bookmarks.clear()
}

export async function saveBookmarks(items: StoredBookmark[]) {
  await db.bookmarks.clear()
  await db.bookmarks.bulkAdd(items)
}

export async function loadBookmarks(): Promise<StoredBookmark[]> {
  return await db.bookmarks.toArray()
}

export async function getSetting(key: string): Promise<string | undefined> {
  const item = await db.settings.get(key)
  return item?.apiKey
}

export async function setSetting(key: string, value: string) {
  await db.settings.put({ id: key, apiKey: value, lastUpdated: Date.now() })
}
