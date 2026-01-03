/**
 * AI Cache Service
 * Manages caching of AI analysis results
 */

import { db, getAICache, setAICache, clearExpiredCache, clearAllAICache } from '../utils/db'
import { DEFAULT_CACHE_TTL_MS } from './constants'

export type CacheType = 'category' | 'summary' | 'duplicate' | 'health' | 'report'

export interface CacheStats {
  entries: number
  sizeBytes: number
  byType: Record<CacheType, number>
}

/**
 * Generate a cache key for a specific operation and data
 */
export function generateCacheKey(type: CacheType, identifier: string): string {
  return `${type}:${identifier}`
}

/**
 * Generate a hash for bookmark data to detect changes
 */
export function generateBookmarkHash(data: unknown): string {
  const str = JSON.stringify(data)
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16).padStart(8, '0')
}

/**
 * Get a cached value
 */
export async function get<T>(key: string): Promise<T | null> {
  const entry = await getAICache(key)
  if (!entry) {
    return null
  }
  return entry.data as T
}

/**
 * Get a cached value with metadata
 */
export async function getWithMeta<T>(key: string): Promise<{
  value: T
  createdAt: number
  expiresAt: number
} | null> {
  const entry = await getAICache(key)
  if (!entry) {
    return null
  }
  return {
    value: entry.data as T,
    createdAt: entry.createdAt,
    expiresAt: entry.expiresAt
  }
}

/**
 * Set a cached value
 */
export async function set<T>(
  key: string,
  value: T,
  type: CacheType,
  bookmarkHash: string,
  ttlMs: number = DEFAULT_CACHE_TTL_MS
): Promise<void> {
  await setAICache({
    id: key,
    type,
    data: value,
    bookmarkHash,
    expiresAt: Date.now() + ttlMs
  })
}

/**
 * Check if a key exists in cache and is not expired
 */
export async function has(key: string): Promise<boolean> {
  const entry = await getAICache(key)
  return entry !== undefined
}

/**
 * Delete a specific cache entry
 */
export async function remove(key: string): Promise<void> {
  await db.aiCache.delete(key)
}

/**
 * Clear all expired cache entries
 */
export async function clearExpired(): Promise<number> {
  const now = Date.now()
  const expired = await db.aiCache.where('expiresAt').below(now).toArray()
  await clearExpiredCache()
  return expired.length
}

/**
 * Clear all cache entries
 */
export async function clearAll(): Promise<void> {
  await clearAllAICache()
}

/**
 * Clear cache entries by type
 */
export async function clearByType(type: CacheType): Promise<number> {
  const entries = await db.aiCache.where('type').equals(type).toArray()
  await db.aiCache.where('type').equals(type).delete()
  return entries.length
}

/**
 * Get cache statistics
 */
export async function getStats(): Promise<CacheStats> {
  const entries = await db.aiCache.toArray()
  
  const byType: Record<CacheType, number> = {
    category: 0,
    summary: 0,
    duplicate: 0,
    health: 0,
    report: 0
  }

  let sizeBytes = 0
  for (const entry of entries) {
    byType[entry.type]++
    sizeBytes += JSON.stringify(entry.data).length * 2 // Rough estimate
  }

  return {
    entries: entries.length,
    sizeBytes,
    byType
  }
}

/**
 * Check if cached data is still valid for given bookmark hash
 */
export async function isValidForHash(key: string, currentHash: string): Promise<boolean> {
  const entry = await db.aiCache.get(key)
  if (!entry) {
    return false
  }
  return entry.bookmarkHash === currentHash && entry.expiresAt > Date.now()
}

/**
 * Get or compute a cached value
 */
export async function getOrCompute<T>(
  key: string,
  type: CacheType,
  bookmarkHash: string,
  compute: () => Promise<T>,
  ttlMs: number = DEFAULT_CACHE_TTL_MS,
  forceRefresh: boolean = false
): Promise<{ value: T; fromCache: boolean }> {
  // Check cache first (unless force refresh)
  if (!forceRefresh) {
    const cached = await getAICache(key)
    if (cached && cached.bookmarkHash === bookmarkHash) {
      return { value: cached.data as T, fromCache: true }
    }
  }

  // Compute new value
  const value = await compute()

  // Cache the result
  await set(key, value, type, bookmarkHash, ttlMs)

  return { value, fromCache: false }
}

// Export as a service object for convenience
export const cacheService = {
  generateCacheKey,
  generateBookmarkHash,
  get,
  getWithMeta,
  set,
  has,
  remove,
  clearExpired,
  clearAll,
  clearByType,
  getStats,
  isValidForHash,
  getOrCompute
}
