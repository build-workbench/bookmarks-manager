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

// AI-related interfaces
export interface AIConfig {
  id: string // 'default'
  provider: 'openai' | 'claude' | 'custom'
  apiKey: string
  model: string
  baseUrl?: string
  maxTokens: number
  temperature: number
  updatedAt: number
}

export interface AICache {
  id: string // `${type}:${bookmarkId}` or `${type}:${hash}`
  type: 'category' | 'summary' | 'duplicate' | 'health' | 'report'
  data: unknown
  bookmarkHash: string
  createdAt: number
  expiresAt: number
}

export interface AIUsage {
  id?: number
  timestamp: number
  operation: string
  promptTokens: number
  completionTokens: number
  totalTokens: number
  estimatedCost: number
  model: string
}

export interface AIPrompt {
  id: string
  name: string
  description: string
  template: string
  variables: string[]
  isDefault: boolean
  isCustomized: boolean
  createdAt: number
  updatedAt: number
}

export interface AIUsageLimits {
  id: string // 'default'
  dailyTokenLimit?: number
  monthlyTokenLimit?: number
  dailyCostLimit?: number
  monthlyCostLimit?: number
  updatedAt: number
}

// Cleanup Session for workflow persistence
export interface CleanupSessionRecord {
  id: string
  sessionData: string // JSON stringified CleanupSession
  createdAt: number
  updatedAt: number
}

class BookmarksDB extends Dexie {
  bookmarks!: Table<StoredBookmark, string>
  settings!: Table<AppSettings, string>
  aiConfig!: Table<AIConfig, string>
  aiCache!: Table<AICache, string>
  aiUsage!: Table<AIUsage, number>
  aiPrompts!: Table<AIPrompt, string>
  aiUsageLimits!: Table<AIUsageLimits, string>
  cleanupSessions!: Table<CleanupSessionRecord, string>

  constructor() {
    super('BookmarksDB')

    // Version 1: Original schema
    this.version(1).stores({
      bookmarks: 'id, url, normalized, title, sourceFile',
      settings: 'id'
    })

    // Version 2: Add AI-related tables
    this.version(2).stores({
      bookmarks: 'id, url, normalized, title, sourceFile',
      settings: 'id',
      aiConfig: 'id',
      aiCache: 'id, type, expiresAt',
      aiUsage: '++id, timestamp, operation',
      aiPrompts: 'id, isDefault',
      aiUsageLimits: 'id'
    })

    // Version 3: Add cleanup sessions table
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

// AI Config functions
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

// AI Cache functions
export async function getAICache(id: string): Promise<AICache | undefined> {
  const entry = await db.aiCache.get(id)
  if (entry && entry.expiresAt > Date.now()) {
    return entry
  }
  return undefined
}

export async function setAICache(entry: Omit<AICache, 'createdAt'>): Promise<void> {
  await db.aiCache.put({
    ...entry,
    createdAt: Date.now()
  })
}

export async function clearExpiredCache(): Promise<void> {
  const now = Date.now()
  await db.aiCache.where('expiresAt').below(now).delete()
}

export async function clearAllAICache(): Promise<void> {
  await db.aiCache.clear()
}

// AI Usage functions
export async function recordAIUsage(usage: Omit<AIUsage, 'id'>): Promise<void> {
  await db.aiUsage.add(usage)
}

export async function getAIUsage(startDate?: Date, endDate?: Date): Promise<AIUsage[]> {
  let query = db.aiUsage.orderBy('timestamp')

  if (startDate) {
    query = query.filter(u => u.timestamp >= startDate.getTime())
  }
  if (endDate) {
    query = query.filter(u => u.timestamp <= endDate.getTime())
  }

  return await query.toArray()
}

export async function clearAIUsage(): Promise<void> {
  await db.aiUsage.clear()
}

// AI Prompts functions
export async function getAIPrompt(id: string): Promise<AIPrompt | undefined> {
  return await db.aiPrompts.get(id)
}

export async function getAllAIPrompts(): Promise<AIPrompt[]> {
  return await db.aiPrompts.toArray()
}

export async function saveAIPrompt(prompt: AIPrompt): Promise<void> {
  await db.aiPrompts.put(prompt)
}

export async function deleteAIPrompt(id: string): Promise<void> {
  await db.aiPrompts.delete(id)
}

// AI Usage Limits functions
export async function getAIUsageLimits(): Promise<AIUsageLimits | undefined> {
  return await db.aiUsageLimits.get('default')
}

export async function saveAIUsageLimits(limits: Omit<AIUsageLimits, 'id' | 'updatedAt'>): Promise<void> {
  await db.aiUsageLimits.put({
    ...limits,
    id: 'default',
    updatedAt: Date.now()
  })
}


// Cleanup Session functions
export async function saveCleanupSession(session: CleanupSessionRecord): Promise<void> {
  await db.cleanupSessions.put({
    ...session,
    updatedAt: Date.now()
  })
}

export async function loadCleanupSession(id: string): Promise<CleanupSessionRecord | undefined> {
  return await db.cleanupSessions.get(id)
}

export async function getLatestCleanupSession(): Promise<CleanupSessionRecord | undefined> {
  const sessions = await db.cleanupSessions.orderBy('updatedAt').reverse().limit(1).toArray()
  return sessions[0]
}

export async function deleteCleanupSession(id: string): Promise<void> {
  await db.cleanupSessions.delete(id)
}

export async function clearAllCleanupSessions(): Promise<void> {
  await db.cleanupSessions.clear()
}

// Bookmark deletion functions for cleanup workflow
export async function deleteBookmarksByIds(ids: string[]): Promise<void> {
  await db.bookmarks.bulkDelete(ids)
}

export async function updateBookmarkPath(id: string, newPath: string[]): Promise<void> {
  await db.bookmarks.update(id, { path: newPath })
}

export async function bulkUpdateBookmarkPaths(updates: Array<{ id: string; path: string[] }>): Promise<void> {
  await db.transaction('rw', db.bookmarks, async () => {
    for (const update of updates) {
      await db.bookmarks.update(update.id, { path: update.path })
    }
  })
}

export async function restoreBookmarks(bookmarks: StoredBookmark[]): Promise<void> {
  await db.bookmarks.bulkPut(bookmarks)
}
