import { describe, it, expect, beforeEach } from 'vitest'
import { usageService } from './usageService'

describe('usageService boundaries', () => {
  beforeEach(async () => {
    await usageService.clearHistory()
    await usageService.setLimits({})
  })

  it('buckets daily usage by local date consistently with today stats', async () => {
    const now = new Date()
    const todayEarly = new Date(now)
    todayEarly.setHours(0, 10, 0, 0)

    const yesterdayLate = new Date(todayEarly)
    yesterdayLate.setDate(yesterdayLate.getDate() - 1)
    yesterdayLate.setHours(23, 50, 0, 0)

    await usageService.recordUsage({
      timestamp: todayEarly.getTime(),
      operation: 'report',
      promptTokens: 100,
      completionTokens: 50,
      totalTokens: 150,
      estimatedCost: 0.01,
      model: 'gpt-4o-mini'
    })

    await usageService.recordUsage({
      timestamp: yesterdayLate.getTime(),
      operation: 'search',
      promptTokens: 40,
      completionTokens: 10,
      totalTokens: 50,
      estimatedCost: 0.002,
      model: 'gpt-4o-mini'
    })

    const stats = await usageService.getStats()
    const today = await usageService.getTodayStats()
    const todayKey = `${todayEarly.getFullYear()}-${String(todayEarly.getMonth() + 1).padStart(2, '0')}-${String(todayEarly.getDate()).padStart(2, '0')}`

    expect(stats.dailyUsage.find((entry) => entry.date === todayKey)?.tokens).toBe(150)
    expect(today.tokens).toBe(150)
    expect(today.cost).toBeCloseTo(0.01, 6)
  })
})
