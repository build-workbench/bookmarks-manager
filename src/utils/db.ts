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

export interface AIConfig {
  id: string
  provider: 'openai' | 'claude' | 'custom'
  apiKey: string
  model: string
  baseUrl?: string
  maxTokens: number
  temperature: number
  updatedAt: number
}

class BookmarksDB extends Dexie {
  bookmarks!: Table<StoredBookmark, string>
  settings!: Table<AppSettings, string>
  aiConfig!: Table<AIConfig, string>

  constructor() {
    super('BookmarksDB')

    this.version(1).stores({
      bookmarks: 'id, url, normalized, title, sourceFile',
      settings: 'id'
    })

    this.version(2).stores({
      bookmarks: 'id, url, normalized, title, sourceFile',
      settings: 'id',
      aiConfig: 'id',
      aiCache: 'id, type, expiresAt',
      aiUsage: '++id, timestamp, operation',
      aiPrompts: 'id, isDefault',
      aiUsageLimits: 'id'
    })

    this.version(3).stores({
      bookmarks: 'id, url, normalized, title, sourceFile',
      settings: 'id',
      aiConfig: 'id',
      aiCache: 'id, type, expiresAt',
      aiUsage: '++id, timestamp, operation',
      aiPrompts: 'id, isDefault',
      aiUsageLimits: 'id',
      cleanupSessions: 'id, updatedAt'
    })

    this.version(4).stores({
      bookmarks: 'id, url, normalized, title, sourceFile',
      settings: 'id',
      aiConfig: 'id',
      aiCache: null,
      aiUsage: null,
      aiPrompts: null,
      aiUsageLimits: null,
      cleanupSessions: null
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

export async function getAIConfig(): Promise<AIConfig | undefined> {
  return await db.aiConfig.get('default')
}

export async function saveAIConfig(config: Omit<AIConfig, 'id' | 'updatedAt'>): Promise<void> {
  await db.aiConfig.put({
    ...config,
    id: 'default',
    updatedAt: Date.now()
  })
}
