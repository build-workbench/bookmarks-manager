import { describe, it, expect, beforeEach } from 'vitest'
import { cacheService, generateCacheKey } from './cacheService'
import { db } from '@/utils/db'

describe('cacheService boundaries', () => {
  beforeEach(async () => {
    await cacheService.clearAll()
  })

  it('clears entries that expire exactly at now', async () => {
    const key = generateCacheKey('report', 'exact-now')
    const now = Date.now()

    await db.aiCache.put({
      id: key,
      type: 'report',
      data: { ok: true },
      bookmarkHash: 'hash-1',
      createdAt: now - 1,
      expiresAt: now
    })

    expect(await cacheService.get(key)).toBeNull()
    expect(await cacheService.clearExpired()).toBe(1)
  })
})
