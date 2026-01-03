/**
 * Usage Service Property Tests
 * Feature: ai-bookmark-analysis
 * Properties: 23, 24, 25
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import * as fc from 'fast-check'
import { usageService } from './usageService'
import type { UsageLimits } from './types'

// Test configuration
const PBT_CONFIG = { numRuns: 100 }

// Arbitraries for test data generation
const operationArb = fc.constantFrom(
  'categorize',
  'summarize',
  'duplicate_analysis',
  'health_check',
  'natural_search',
  'report'
)

const modelArb = fc.constantFrom(
  'gpt-4o',
  'gpt-4o-mini',
  'gpt-3.5-turbo',
  'claude-3-5-sonnet-20241022'
)

const usageRecordArb = fc.record({
  timestamp: fc.integer({ min: Date.now() - 86400000, max: Date.now() }),
  operation: operationArb,
  promptTokens: fc.integer({ min: 10, max: 5000 }),
  completionTokens: fc.integer({ min: 10, max: 2000 }),
  totalTokens: fc.integer({ min: 20, max: 7000 }),
  estimatedCost: fc.integer({ min: 1, max: 10000 }).map(n => n / 10000), // 0.0001 to 1
  model: modelArb
})

const usageLimitsArb = fc.record({
  dailyTokenLimit: fc.option(fc.integer({ min: 1000, max: 1000000 })),
  monthlyTokenLimit: fc.option(fc.integer({ min: 10000, max: 10000000 })),
  dailyCostLimit: fc.option(fc.integer({ min: 10, max: 10000 }).map(n => n / 100)), // 0.1 to 100
  monthlyCostLimit: fc.option(fc.integer({ min: 100, max: 100000 }).map(n => n / 100)) // 1 to 1000
})

describe('UsageService', () => {
  beforeEach(async () => {
    // Clear usage data before each test
    await usageService.clearHistory()
    await usageService.setLimits({})
  })

  afterEach(async () => {
    // Clean up after each test
    await usageService.clearHistory()
    await usageService.setLimits({})
  })

  /**
   * Property 23: Usage Tracking Round-Trip
   * For any API call that completes, a usage record should be created and persisted,
   * and the record should be retrievable after page reload.
   * Validates: Requirements 9.1, 9.5
   */
  describe('Property 23: Usage Tracking Round-Trip', () => {
    it('should persist usage records and retrieve them', async () => {
      await fc.assert(
        fc.asyncProperty(usageRecordArb, async (record) => {
          // Clear first to ensure clean state
          await usageService.clearHistory()

          // Record usage
          await usageService.recordUsage(record)

          // Retrieve recent records
          const records = await usageService.getRecentRecords(10)

          // Should find the record
          const found = records.find(
            r =>
              r.operation === record.operation &&
              r.totalTokens === record.totalTokens &&
              r.model === record.model
          )
          expect(found).toBeDefined()
        }),
        PBT_CONFIG
      )
    })

    it('should accumulate usage in statistics', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(usageRecordArb, { minLength: 1, maxLength: 10 }),
          async (records) => {
            // Clear first
            await usageService.clearHistory()

            // Record all
            for (const record of records) {
              await usageService.recordUsage(record)
            }

            // Get stats
            const stats = await usageService.getStats()

            // Total tokens should match sum
            const expectedTokens = records.reduce((sum, r) => sum + r.totalTokens, 0)
            expect(stats.totalTokens).toBe(expectedTokens)

            // Total cost should match sum (approximately due to floating point)
            const expectedCost = records.reduce((sum, r) => sum + r.estimatedCost, 0)
            expect(stats.totalCost).toBeCloseTo(expectedCost, 4)
          }
        ),
        PBT_CONFIG
      )
    })

    it('should track usage by operation', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(usageRecordArb, { minLength: 1, maxLength: 10 }),
          async (records) => {
            await usageService.clearHistory()

            for (const record of records) {
              await usageService.recordUsage(record)
            }

            const stats = await usageService.getStats()

            // Check operation breakdown
            for (const record of records) {
              expect(stats.operationBreakdown[record.operation]).toBeDefined()
            }

            // Sum of operation tokens should equal total
            const operationTotal = Object.values(stats.operationBreakdown).reduce(
              (sum, op) => sum + op.tokens,
              0
            )
            expect(operationTotal).toBe(stats.totalTokens)
          }
        ),
        PBT_CONFIG
      )
    })

    it('should persist limits and retrieve them', async () => {
      await fc.assert(
        fc.asyncProperty(usageLimitsArb, async (limits) => {
          // Set limits
          await usageService.setLimits(limits)

          // Retrieve limits
          const retrieved = await usageService.getLimits()

          // Should match (handling undefined vs null)
          if (limits.dailyTokenLimit !== undefined) {
            expect(retrieved.dailyTokenLimit).toBe(limits.dailyTokenLimit)
          }
          if (limits.monthlyTokenLimit !== undefined) {
            expect(retrieved.monthlyTokenLimit).toBe(limits.monthlyTokenLimit)
          }
          if (limits.dailyCostLimit !== undefined) {
            expect(retrieved.dailyCostLimit).toBeCloseTo(limits.dailyCostLimit!, 4)
          }
          if (limits.monthlyCostLimit !== undefined) {
            expect(retrieved.monthlyCostLimit).toBeCloseTo(limits.monthlyCostLimit!, 4)
          }
        }),
        PBT_CONFIG
      )
    })
  })

  /**
   * Property 24: Usage Limit Warning
   * For any usage that reaches 80% of a configured limit,
   * the system should trigger a warning notification.
   * Validates: Requirements 9.3
   */
  describe('Property 24: Usage Limit Warning', () => {
    it('should warn when daily token usage reaches 80%', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1000, max: 100000 }),
          async (limit) => {
            await usageService.clearHistory()

            // Set limit
            await usageService.setLimits({ dailyTokenLimit: limit })

            // Add usage at 85% of limit
            const usageTokens = Math.floor(limit * 0.85)
            await usageService.recordUsage({
              timestamp: Date.now(),
              operation: 'test',
              promptTokens: Math.floor(usageTokens * 0.7),
              completionTokens: Math.floor(usageTokens * 0.3),
              totalTokens: usageTokens,
              estimatedCost: 0.01,
              model: 'gpt-4o-mini'
            })

            // Check limits
            const result = await usageService.checkLimits()

            // Should have warning but not exceeded
            expect(result.warning).toBe(true)
            expect(result.exceeded).toBe(false)
            expect(result.details?.dailyTokens?.percentage).toBeGreaterThanOrEqual(0.8)
          }
        ),
        { numRuns: 50 }
      )
    })

    it('should warn when monthly cost reaches 80%', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 100, max: 10000 }).map(n => n / 100), // 1 to 100
          async (limit) => {
            await usageService.clearHistory()

            // Set limit
            await usageService.setLimits({ monthlyCostLimit: limit })

            // Add usage at 85% of limit
            const usageCost = limit * 0.85
            await usageService.recordUsage({
              timestamp: Date.now(),
              operation: 'test',
              promptTokens: 1000,
              completionTokens: 500,
              totalTokens: 1500,
              estimatedCost: usageCost,
              model: 'gpt-4o-mini'
            })

            // Check limits
            const result = await usageService.checkLimits()

            // Should have warning
            expect(result.warning).toBe(true)
            expect(result.details?.monthlyCost?.percentage).toBeGreaterThanOrEqual(0.8)
          }
        ),
        { numRuns: 50 }
      )
    })

    it('should not warn when usage is below 80%', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 10000, max: 100000 }),
          async (limit) => {
            await usageService.clearHistory()

            // Set limit
            await usageService.setLimits({ dailyTokenLimit: limit })

            // Add usage at 50% of limit
            const usageTokens = Math.floor(limit * 0.5)
            await usageService.recordUsage({
              timestamp: Date.now(),
              operation: 'test',
              promptTokens: Math.floor(usageTokens * 0.7),
              completionTokens: Math.floor(usageTokens * 0.3),
              totalTokens: usageTokens,
              estimatedCost: 0.01,
              model: 'gpt-4o-mini'
            })

            // Check limits
            const result = await usageService.checkLimits()

            // Should not have warning
            expect(result.warning).toBe(false)
            expect(result.exceeded).toBe(false)
          }
        ),
        { numRuns: 50 }
      )
    })
  })

  /**
   * Property 25: Usage Limit Blocking
   * For any AI operation attempted when usage has reached 100% of a configured limit,
   * the operation should be blocked and return an error indicating the limit has been reached.
   * Validates: Requirements 9.4
   */
  describe('Property 25: Usage Limit Blocking', () => {
    it('should indicate exceeded when daily token limit is reached', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 1000, max: 100000 }),
          async (limit) => {
            await usageService.clearHistory()

            // Set limit
            await usageService.setLimits({ dailyTokenLimit: limit })

            // Add usage at 105% of limit
            const usageTokens = Math.floor(limit * 1.05)
            await usageService.recordUsage({
              timestamp: Date.now(),
              operation: 'test',
              promptTokens: Math.floor(usageTokens * 0.7),
              completionTokens: Math.floor(usageTokens * 0.3),
              totalTokens: usageTokens,
              estimatedCost: 0.01,
              model: 'gpt-4o-mini'
            })

            // Check limits
            const result = await usageService.checkLimits()

            // Should be exceeded
            expect(result.exceeded).toBe(true)
            expect(result.message).toBeDefined()
            expect(result.details?.dailyTokens?.percentage).toBeGreaterThanOrEqual(1)
          }
        ),
        { numRuns: 50 }
      )
    })

    it('should indicate exceeded when monthly cost limit is reached', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 100, max: 10000 }).map(n => n / 100), // 1 to 100
          async (limit) => {
            await usageService.clearHistory()

            // Set limit
            await usageService.setLimits({ monthlyCostLimit: limit })

            // Add usage at 105% of limit
            const usageCost = limit * 1.05
            await usageService.recordUsage({
              timestamp: Date.now(),
              operation: 'test',
              promptTokens: 1000,
              completionTokens: 500,
              totalTokens: 1500,
              estimatedCost: usageCost,
              model: 'gpt-4o-mini'
            })

            // Check limits
            const result = await usageService.checkLimits()

            // Should be exceeded
            expect(result.exceeded).toBe(true)
            expect(result.message).toBeDefined()
          }
        ),
        { numRuns: 50 }
      )
    })

    it('should not indicate exceeded when no limits are set', async () => {
      await fc.assert(
        fc.asyncProperty(usageRecordArb, async (record) => {
          await usageService.clearHistory()
          await usageService.setLimits({})

          // Add any amount of usage
          await usageService.recordUsage(record)

          // Check limits
          const result = await usageService.checkLimits()

          // Should not be exceeded (no limits set)
          expect(result.exceeded).toBe(false)
          expect(result.warning).toBe(false)
        }),
        PBT_CONFIG
      )
    })
  })

  describe('Cost Estimation', () => {
    it('should estimate cost correctly for known models', () => {
      // GPT-4o-mini: input $0.00015/1K, output $0.0006/1K
      const cost = usageService.estimateCost('gpt-4o-mini', 1000, 1000)
      const expected = (1000 * 0.00015 + 1000 * 0.0006) / 1000
      expect(cost).toBeCloseTo(expected, 6)
    })

    it('should use default pricing for unknown models', () => {
      const cost = usageService.estimateCost('unknown-model', 1000, 1000)
      // Should use gpt-4o-mini default pricing
      const expected = (1000 * 0.00015 + 1000 * 0.0006) / 1000
      expect(cost).toBeCloseTo(expected, 6)
    })
  })

  describe('History Management', () => {
    it('should clear all history', async () => {
      // Add some records
      for (let i = 0; i < 5; i++) {
        await usageService.recordUsage({
          timestamp: Date.now(),
          operation: 'test',
          promptTokens: 100,
          completionTokens: 50,
          totalTokens: 150,
          estimatedCost: 0.001,
          model: 'gpt-4o-mini'
        })
      }

      // Clear
      await usageService.clearHistory()

      // Verify empty
      const records = await usageService.getRecentRecords()
      expect(records.length).toBe(0)
    })

    it('should get recent records in reverse chronological order', async () => {
      await usageService.clearHistory()

      // Add records with different timestamps
      const timestamps = [
        Date.now() - 3000,
        Date.now() - 2000,
        Date.now() - 1000,
        Date.now()
      ]

      for (const ts of timestamps) {
        await usageService.recordUsage({
          timestamp: ts,
          operation: 'test',
          promptTokens: 100,
          completionTokens: 50,
          totalTokens: 150,
          estimatedCost: 0.001,
          model: 'gpt-4o-mini'
        })
      }

      const records = await usageService.getRecentRecords(10)

      // Should be in reverse order (most recent first)
      for (let i = 1; i < records.length; i++) {
        expect(records[i - 1].timestamp).toBeGreaterThanOrEqual(records[i].timestamp)
      }
    })
  })
})
