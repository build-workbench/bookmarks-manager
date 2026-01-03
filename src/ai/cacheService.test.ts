/**
 * Cache Service Property Tests
 * Feature: ai-bookmark-analysis
 * Properties: 26, 27, 28
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import * as fc from 'fast-check'
import { cacheService, CacheType, generateCacheKey, generateBookmarkHash } from './cacheService'
import { db } from '../utils/db'

// Test configuration
const PBT_CONFIG = { numRuns: 100 }

// Arbitraries for test data generation
const cacheTypeArb = fc.constantFrom<CacheType>('category', 'summary', 'duplicate', 'health', 'report')

const cacheValueArb = fc.oneof(
  fc.string(),
  fc.integer(),
  fc.record({
    id: fc.uuid(),
    data: fc.string(),
    count: fc.integer({ min: 0, max: 1000 })
  }),
  fc.array(fc.string(), { maxLength: 10 })
)

const cacheKeyArb = fc.tuple(cacheTypeArb, fc.uuid()).map(([type, id]) => generateCacheKey(type, id))

const bookmarkDataArb = fc.record({
  id: fc.uuid(),
  title: fc.string({ minLength: 1, maxLength: 100 }),
  url: fc.webUrl()
})

describe('CacheService', () => {
  beforeEach(async () => {
    // Clear cache before each test
    await cacheService.clearAll()
  })

  afterEach(async () => {
    // Clean up after each test
    await cacheService.clearAll()
  })

  describe('generateCacheKey', () => {
    it('should generate consistent keys for same inputs', () => {
      fc.assert(
        fc.property(cacheTypeArb, fc.uuid(), (type, id) => {
          const key1 = generateCacheKey(type, id)
          const key2 = generateCacheKey(type, id)
          expect(key1).toBe(key2)
        }),
        PBT_CONFIG
      )
    })

    it('should generate different keys for different inputs', () => {
      fc.assert(
        fc.property(
          cacheTypeArb,
          fc.uuid(),
          fc.uuid().filter(id2 => true),
          (type, id1, id2) => {
            fc.pre(id1 !== id2)
            const key1 = generateCacheKey(type, id1)
            const key2 = generateCacheKey(type, id2)
            expect(key1).not.toBe(key2)
          }
        ),
        PBT_CONFIG
      )
    })
  })

  describe('generateBookmarkHash', () => {
    it('should generate consistent hashes for same data', () => {
      fc.assert(
        fc.property(bookmarkDataArb, (data) => {
          const hash1 = generateBookmarkHash(data)
          const hash2 = generateBookmarkHash(data)
          expect(hash1).toBe(hash2)
        }),
        PBT_CONFIG
      )
    })

    it('should generate different hashes for different data', () => {
      fc.assert(
        fc.property(bookmarkDataArb, bookmarkDataArb, (data1, data2) => {
          fc.pre(JSON.stringify(data1) !== JSON.stringify(data2))
          const hash1 = generateBookmarkHash(data1)
          const hash2 = generateBookmarkHash(data2)
          expect(hash1).not.toBe(hash2)
        }),
        PBT_CONFIG
      )
    })
  })

  /**
   * Property 26: Cache Round-Trip
   * For any AI analysis result, caching it and then requesting the same analysis
   * should return the cached result without making a new API call.
   * Validates: Requirements 10.1, 10.2
   */
  describe('Property 26: Cache Round-Trip', () => {
    it('should return cached value after setting', async () => {
      await fc.assert(
        fc.asyncProperty(
          cacheTypeArb,
          fc.uuid(),
          cacheValueArb,
          async (type, id, value) => {
            const key = generateCacheKey(type, id)
            const hash = generateBookmarkHash({ id })

            // Set the value
            await cacheService.set(key, value, type, hash)

            // Get the value back
            const retrieved = await cacheService.get(key)

            // Should match the original value
            expect(retrieved).toEqual(value)
          }
        ),
        PBT_CONFIG
      )
    })

    it('should return cached value with metadata', async () => {
      await fc.assert(
        fc.asyncProperty(
          cacheTypeArb,
          fc.uuid(),
          cacheValueArb,
          async (type, id, value) => {
            const key = generateCacheKey(type, id)
            const hash = generateBookmarkHash({ id })
            const ttl = 60000 // 1 minute

            const beforeSet = Date.now()
            await cacheService.set(key, value, type, hash, ttl)
            const afterSet = Date.now()

            const result = await cacheService.getWithMeta(key)

            expect(result).not.toBeNull()
            expect(result!.value).toEqual(value)
            expect(result!.createdAt).toBeGreaterThanOrEqual(beforeSet)
            expect(result!.createdAt).toBeLessThanOrEqual(afterSet)
            expect(result!.expiresAt).toBeGreaterThan(result!.createdAt)
          }
        ),
        PBT_CONFIG
      )
    })

    it('should use getOrCompute to return cached value without recomputing', async () => {
      await fc.assert(
        fc.asyncProperty(
          cacheTypeArb,
          fc.uuid(),
          cacheValueArb,
          async (type, id, value) => {
            const key = generateCacheKey(type, id)
            const hash = generateBookmarkHash({ id })
            let computeCount = 0

            const compute = async () => {
              computeCount++
              return value
            }

            // First call should compute
            const result1 = await cacheService.getOrCompute(key, type, hash, compute)
            expect(result1.fromCache).toBe(false)
            expect(result1.value).toEqual(value)
            expect(computeCount).toBe(1)

            // Second call should use cache
            const result2 = await cacheService.getOrCompute(key, type, hash, compute)
            expect(result2.fromCache).toBe(true)
            expect(result2.value).toEqual(value)
            expect(computeCount).toBe(1) // Should not have computed again
          }
        ),
        PBT_CONFIG
      )
    })
  })

  /**
   * Property 27: Cache Bypass on Force Refresh
   * For any cached analysis, requesting a fresh analysis with force-refresh flag
   * should bypass the cache and make a new API call.
   * Validates: Requirements 10.4
   */
  describe('Property 27: Cache Bypass on Force Refresh', () => {
    it('should bypass cache when forceRefresh is true', async () => {
      await fc.assert(
        fc.asyncProperty(
          cacheTypeArb,
          fc.uuid(),
          cacheValueArb,
          cacheValueArb,
          async (type, id, oldValue, newValue) => {
            fc.pre(JSON.stringify(oldValue) !== JSON.stringify(newValue))

            const key = generateCacheKey(type, id)
            const hash = generateBookmarkHash({ id })
            let computeCount = 0

            // First compute returns oldValue
            const compute1 = async () => {
              computeCount++
              return computeCount === 1 ? oldValue : newValue
            }

            // Cache the old value
            const result1 = await cacheService.getOrCompute(key, type, hash, compute1)
            expect(result1.fromCache).toBe(false)
            expect(result1.value).toEqual(oldValue)

            // Force refresh should bypass cache and get new value
            const result2 = await cacheService.getOrCompute(key, type, hash, compute1, undefined, true)
            expect(result2.fromCache).toBe(false)
            expect(result2.value).toEqual(newValue)
            expect(computeCount).toBe(2)
          }
        ),
        PBT_CONFIG
      )
    })

    it('should recompute when bookmark hash changes', async () => {
      await fc.assert(
        fc.asyncProperty(
          cacheTypeArb,
          fc.uuid(),
          cacheValueArb,
          cacheValueArb,
          async (type, id, value1, value2) => {
            const key = generateCacheKey(type, id)
            const hash1 = generateBookmarkHash({ id, version: 1 })
            const hash2 = generateBookmarkHash({ id, version: 2 })
            let computeCount = 0

            const compute = async () => {
              computeCount++
              return computeCount === 1 ? value1 : value2
            }

            // Cache with hash1
            await cacheService.getOrCompute(key, type, hash1, compute)
            expect(computeCount).toBe(1)

            // Request with different hash should recompute
            const result = await cacheService.getOrCompute(key, type, hash2, compute)
            expect(result.fromCache).toBe(false)
            expect(computeCount).toBe(2)
          }
        ),
        PBT_CONFIG
      )
    })
  })

  /**
   * Property 28: Cache Management Operations
   * For any cache state, clearing the cache should result in an empty cache,
   * and setting cache duration should affect expiration of new entries.
   * Validates: Requirements 10.5
   */
  describe('Property 28: Cache Management Operations', () => {
    it('should clear all cache entries', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.tuple(cacheTypeArb, fc.uuid(), cacheValueArb),
            { minLength: 1, maxLength: 10 }
          ),
          async (entries) => {
            // Add multiple entries
            for (const [type, id, value] of entries) {
              const key = generateCacheKey(type, id)
              const hash = generateBookmarkHash({ id })
              await cacheService.set(key, value, type, hash)
            }

            // Verify entries exist
            const statsBefore = await cacheService.getStats()
            expect(statsBefore.entries).toBeGreaterThan(0)

            // Clear all
            await cacheService.clearAll()

            // Verify empty
            const statsAfter = await cacheService.getStats()
            expect(statsAfter.entries).toBe(0)
          }
        ),
        PBT_CONFIG
      )
    })

    it('should clear cache entries by type', async () => {
      await fc.assert(
        fc.asyncProperty(
          cacheTypeArb,
          fc.array(fc.uuid(), { minLength: 1, maxLength: 5 }),
          cacheValueArb,
          async (targetType, ids, value) => {
            // Clear cache first to ensure clean state
            await cacheService.clearAll()

            // Use unique IDs to avoid duplicates
            const uniqueIds = [...new Set(ids)]

            // Add entries of target type
            for (const id of uniqueIds) {
              const key = generateCacheKey(targetType, id)
              const hash = generateBookmarkHash({ id })
              await cacheService.set(key, value, targetType, hash)
            }

            // Add one entry of different type
            const otherTypes: CacheType[] = ['category', 'summary', 'duplicate', 'health', 'report']
            const otherType = otherTypes.find(t => t !== targetType) || 'category'
            const otherKey = generateCacheKey(otherType, 'other-id')
            await cacheService.set(otherKey, value, otherType, 'other-hash')

            // Clear by type
            const cleared = await cacheService.clearByType(targetType)
            expect(cleared).toBe(uniqueIds.length)

            // Verify target type entries are gone
            for (const id of uniqueIds) {
              const key = generateCacheKey(targetType, id)
              const exists = await cacheService.has(key)
              expect(exists).toBe(false)
            }

            // Verify other type entry still exists
            const otherExists = await cacheService.has(otherKey)
            expect(otherExists).toBe(true)
          }
        ),
        PBT_CONFIG
      )
    })

    it('should remove individual cache entries', async () => {
      await fc.assert(
        fc.asyncProperty(
          cacheTypeArb,
          fc.uuid(),
          cacheValueArb,
          async (type, id, value) => {
            const key = generateCacheKey(type, id)
            const hash = generateBookmarkHash({ id })

            // Set value
            await cacheService.set(key, value, type, hash)
            expect(await cacheService.has(key)).toBe(true)

            // Remove
            await cacheService.remove(key)
            expect(await cacheService.has(key)).toBe(false)
          }
        ),
        PBT_CONFIG
      )
    })

    it('should track cache statistics correctly', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.tuple(cacheTypeArb, fc.uuid(), cacheValueArb),
            { minLength: 1, maxLength: 10 }
          ),
          async (entries) => {
            // Clear first
            await cacheService.clearAll()

            // Add entries
            const typeCount: Record<CacheType, number> = {
              category: 0,
              summary: 0,
              duplicate: 0,
              health: 0,
              report: 0
            }

            for (const [type, id, value] of entries) {
              const key = generateCacheKey(type, id)
              const hash = generateBookmarkHash({ id })
              await cacheService.set(key, value, type, hash)
              typeCount[type]++
            }

            // Check stats
            const stats = await cacheService.getStats()
            expect(stats.entries).toBe(entries.length)
            expect(stats.sizeBytes).toBeGreaterThan(0)

            // Check type breakdown
            for (const type of Object.keys(typeCount) as CacheType[]) {
              expect(stats.byType[type]).toBe(typeCount[type])
            }
          }
        ),
        PBT_CONFIG
      )
    })

    it('should validate hash for cached entries', async () => {
      await fc.assert(
        fc.asyncProperty(
          cacheTypeArb,
          fc.uuid(),
          cacheValueArb,
          async (type, id, value) => {
            const key = generateCacheKey(type, id)
            const hash1 = generateBookmarkHash({ id, version: 1 })
            const hash2 = generateBookmarkHash({ id, version: 2 })

            // Set with hash1
            await cacheService.set(key, value, type, hash1)

            // Should be valid for hash1
            expect(await cacheService.isValidForHash(key, hash1)).toBe(true)

            // Should be invalid for hash2
            expect(await cacheService.isValidForHash(key, hash2)).toBe(false)
          }
        ),
        PBT_CONFIG
      )
    })
  })

  describe('Edge Cases', () => {
    it('should return null for non-existent keys', async () => {
      const result = await cacheService.get('non-existent-key')
      expect(result).toBeNull()
    })

    it('should handle empty cache gracefully', async () => {
      await cacheService.clearAll()
      const stats = await cacheService.getStats()
      expect(stats.entries).toBe(0)
      expect(stats.sizeBytes).toBe(0)
    })

    it('should handle clearing already empty cache', async () => {
      await cacheService.clearAll()
      await cacheService.clearAll() // Should not throw
      const stats = await cacheService.getStats()
      expect(stats.entries).toBe(0)
    })
  })
})
