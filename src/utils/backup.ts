/**
 * Backup and Restore Service
 * Provides full data backup (bookmarks, AI config, settings) and restore functionality
 */

import { db, type StoredBookmark, type AIConfig, type AICache, type AIUsage, type AIPrompt, type AIUsageLimits, type CleanupSessionRecord } from './db'

export interface BackupData {
  version: number
  exportedAt: string
  bookmarks: StoredBookmark[]
  aiConfig?: AIConfig
  aiCache: AICache[]
  aiUsage: AIUsage[]
  aiPrompts: AIPrompt[]
  aiUsageLimits?: AIUsageLimits
  cleanupSessions: CleanupSessionRecord[]
}

export interface BackupOptions {
  includeBookmarks?: boolean
  includeAIConfig?: boolean
  includeAICache?: boolean
  includeAIUsage?: boolean
  includeAIPrompts?: boolean
  includeCleanupSessions?: boolean
}

const CURRENT_SCHEMA_VERSION = 1

/**
 * Create a full backup of all application data
 */
export async function createBackup(options: BackupOptions = {}): Promise<BackupData> {
  const {
    includeBookmarks = true,
    includeAIConfig = true,
    includeAICache = false, // Default false as cache can be large
    includeAIUsage = true,
    includeAIPrompts = true,
    includeCleanupSessions = true,
  } = options

  const backup: BackupData = {
    version: CURRENT_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    bookmarks: includeBookmarks ? await db.bookmarks.toArray() : [],
    aiCache: includeAICache ? await db.aiCache.toArray() : [],
    aiUsage: includeAIUsage ? await db.aiUsage.toArray() : [],
    aiPrompts: includeAIPrompts ? await db.aiPrompts.toArray() : [],
    cleanupSessions: includeCleanupSessions ? await db.cleanupSessions.toArray() : [],
  }

  if (includeAIConfig) {
    backup.aiConfig = await db.aiConfig.get('default')
  }

  // Get AI usage limits if AI config is included
  if (includeAIConfig) {
    backup.aiUsageLimits = await db.aiUsageLimits.get('default')
  }

  return backup
}

/**
 * Export backup as JSON string
 */
export async function exportBackupAsJSON(options?: BackupOptions): Promise<string> {
  const backup = await createBackup(options)
  return JSON.stringify(backup, null, 2)
}

/**
 * Validate backup data structure
 */
export function validateBackup(data: unknown): { valid: boolean; error?: string } {
  if (typeof data !== 'object' || data === null) {
    return { valid: false, error: '备份数据格式无效' }
  }

  const backup = data as Partial<BackupData>

  if (backup.version !== CURRENT_SCHEMA_VERSION) {
    return { valid: false, error: `不支持的备份版本: ${backup.version}` }
  }

  if (!Array.isArray(backup.bookmarks)) {
    return { valid: false, error: '书签数据格式无效' }
  }

  // Validate bookmark structure
  for (const bookmark of backup.bookmarks) {
    if (!bookmark.id || !bookmark.url) {
      return { valid: false, error: '书签数据不完整' }
    }
  }

  return { valid: true }
}

/**
 * Parse and validate backup from JSON string
 */
export function parseBackup(jsonString: string): { success: boolean; data?: BackupData; error?: string } {
  try {
    const parsed = JSON.parse(jsonString)
    const validation = validateBackup(parsed)

    if (!validation.valid) {
      return { success: false, error: validation.error }
    }

    return { success: true, data: parsed as BackupData }
  } catch {
    return { success: false, error: 'JSON 解析失败，文件可能已损坏' }
  }
}

/**
 * Restore data from backup
 * @param strategy 'merge' to merge with existing data, 'replace' to replace all data
 */
export async function restoreFromBackup(
  backup: BackupData,
  strategy: 'merge' | 'replace' = 'replace'
): Promise<{ success: boolean; stats: RestoreStats; error?: string }> {
  const stats: RestoreStats = {
    bookmarksRestored: 0,
    aiConfigRestored: false,
    aiCacheRestored: 0,
    aiUsageRestored: 0,
    aiPromptsRestored: 0,
    cleanupSessionsRestored: 0,
  }

  try {
    if (strategy === 'replace') {
      // Clear existing data first
      await db.bookmarks.clear()
      await db.aiCache.clear()
      await db.aiUsage.clear()
      await db.cleanupSessions.clear()
      // Note: we don't clear prompts to preserve user customizations
    }

    // Restore bookmarks
    if (backup.bookmarks.length > 0) {
      if (strategy === 'merge') {
        // Use bulkPut to update existing or add new
        await db.bookmarks.bulkPut(backup.bookmarks)
      } else {
        await db.bookmarks.bulkAdd(backup.bookmarks)
      }
      stats.bookmarksRestored = backup.bookmarks.length
    }

    // Restore AI config
    if (backup.aiConfig) {
      await db.aiConfig.put(backup.aiConfig)
      stats.aiConfigRestored = true
    }

    // Restore AI usage limits
    if (backup.aiUsageLimits) {
      await db.aiUsageLimits.put(backup.aiUsageLimits)
    }

    // Restore AI cache
    if (backup.aiCache.length > 0) {
      if (strategy === 'merge') {
        await db.aiCache.bulkPut(backup.aiCache)
      } else {
        await db.aiCache.bulkAdd(backup.aiCache)
      }
      stats.aiCacheRestored = backup.aiCache.length
    }

    // Restore AI usage
    if (backup.aiUsage.length > 0) {
      await db.aiUsage.bulkAdd(backup.aiUsage)
      stats.aiUsageRestored = backup.aiUsage.length
    }

    // Restore AI prompts (merge strategy to avoid overwriting defaults)
    if (backup.aiPrompts.length > 0) {
      for (const prompt of backup.aiPrompts) {
        const existing = await db.aiPrompts.get(prompt.id)
        if (!existing || (existing.isCustomized && !prompt.isCustomized)) {
          // Only restore if not exists or if backup has more recent customized version
          await db.aiPrompts.put(prompt)
          stats.aiPromptsRestored++
        }
      }
    }

    // Restore cleanup sessions
    if (backup.cleanupSessions.length > 0) {
      await db.cleanupSessions.bulkPut(backup.cleanupSessions)
      stats.cleanupSessionsRestored = backup.cleanupSessions.length
    }

    return { success: true, stats }
  } catch (error) {
    return { success: false, stats, error: String(error) }
  }
}

export interface RestoreStats {
  bookmarksRestored: number
  aiConfigRestored: boolean
  aiCacheRestored: number
  aiUsageRestored: number
  aiPromptsRestored: number
  cleanupSessionsRestored: number
}

/**
 * Get backup size estimate
 */
export async function estimateBackupSize(options?: BackupOptions): Promise<number> {
  const backup = await createBackup(options)
  const json = JSON.stringify(backup)
  return new Blob([json]).size
}

/**
 * Format bytes to human readable string
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
