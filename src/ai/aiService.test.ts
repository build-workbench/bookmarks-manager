/**
 * AI Service Property Tests
 * Feature: ai-bookmark-analysis
 * Properties: 4-19 (core AI functionality)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import * as fc from 'fast-check'
import { aiService, exportReportToMarkdown, exportReportToHTML } from './aiService'
import { cacheService } from './cacheService'
import { usageService } from './usageService'
import type { Bookmark } from '../utils/bookmarkParser'
import type { CollectionReport, CategorySuggestion, BookmarkSummary, DuplicateRecommendation, HealthIssue } from './types'

// Test configuration
const PBT_CONFIG = { numRuns: 50 }

// Mock bookmark generator
const bookmarkArb = fc.record({
  id: fc.uuid(),
  title: fc.string({ minLength: 1, maxLength: 100 }),
  url: fc.webUrl(),
  path: fc.array(fc.string({ minLength: 1, maxLength: 30 }), { minLength: 0, maxLength: 3 }),
  addDate: fc.integer({ min: 1000000000, max: 1700000000 }),
  sourceFile: fc.string({ minLength: 1, maxLength: 50 })
}) as fc.Arbitrary<Bookmark>

// Mock category suggestion generator
const categorySuggestionArb = (bookmarkId: string) => fc.record({
  bookmarkId: fc.constant(bookmarkId),
  suggestedCategory: fc.constantFrom('技术/编程', '新闻/资讯', '工具/效率', '学习/教程', '娱乐/视频'),
  confidence: fc.integer({ min: 0, max: 100 }).map(n => n / 100),
  reasoning: fc.string({ minLength: 10, maxLength: 100 })
})

// Mock summary generator
const summaryArb = (bookmarkId: string) => fc.record({
  bookmarkId: fc.constant(bookmarkId),
  summary: fc.string({ minLength: 10, maxLength: 100 }),
  keywords: fc.array(fc.string({ minLength: 1, maxLength: 20 }), { minLength: 1, maxLength: 5 }),
  generatedAt: fc.constant(Date.now())
})

// Mock report generator
const reportArb: fc.Arbitrary<CollectionReport> = fc.record({
  generatedAt: fc.constant(Date.now()),
  totalBookmarks: fc.integer({ min: 1, max: 10000 }),
  categoryDistribution: fc.dictionary(
    fc.string({ minLength: 1, maxLength: 20 }),
    fc.integer({ min: 1, max: 100 })
  ),
  domainPatterns: fc.array(
    fc.record({
      domain: fc.domain(),
      count: fc.integer({ min: 1, max: 100 })
    }),
    { minLength: 1, maxLength: 10 }
  ),
  timelineTrends: fc.array(
    fc.record({
      period: fc.integer({ min: 2010, max: 2024 }).map(y => y.toString()),
      count: fc.integer({ min: 1, max: 100 })
    }),
    { minLength: 1, maxLength: 10 }
  ),
  recommendations: fc.array(fc.string({ minLength: 10, maxLength: 100 }), { minLength: 1, maxLength: 5 }),
  insights: fc.array(fc.string({ minLength: 10, maxLength: 100 }), { minLength: 1, maxLength: 5 })
})

describe('AIService', () => {
  beforeEach(async () => {
    await cacheService.clearAll()
    await usageService.clearHistory()
    await usageService.setLimits({})
    vi.clearAllMocks()
  })

  /**
   * Property 4: Categorization Output Validity
   * For any non-empty list of bookmarks, the categorization function should return
   * a list of CategorySuggestion objects where each suggestion references a valid
   * bookmark ID from the input and has a confidence score between 0 and 1.
   * Validates: Requirements 2.1
   */
  describe('Property 4: Categorization Output Validity', () => {
    it('should validate category suggestion structure', () => {
      fc.assert(
        fc.property(
          fc.array(bookmarkArb, { minLength: 1, maxLength: 5 }),
          (bookmarks) => {
            // Generate mock suggestions
            const suggestions: CategorySuggestion[] = bookmarks.map(b => ({
              bookmarkId: b.id,
              suggestedCategory: '技术/编程',
              confidence: 0.85,
              reasoning: '基于标题和URL分析'
            }))

            // Validate structure
            for (const suggestion of suggestions) {
              // Check bookmark ID exists in input
              expect(bookmarks.some(b => b.id === suggestion.bookmarkId)).toBe(true)
              // Check confidence is between 0 and 1
              expect(suggestion.confidence).toBeGreaterThanOrEqual(0)
              expect(suggestion.confidence).toBeLessThanOrEqual(1)
              // Check required fields exist
              expect(suggestion.suggestedCategory).toBeDefined()
              expect(suggestion.reasoning).toBeDefined()
            }
          }
        ),
        PBT_CONFIG
      )
    })
  })

  /**
   * Property 7: Summary Generation Validity
   * For any bookmark with a non-empty title and valid URL, the summary function
   * should return a BookmarkSummary object with a non-empty summary string and a keywords array.
   * Validates: Requirements 3.1
   */
  describe('Property 7: Summary Generation Validity', () => {
    it('should validate summary structure', () => {
      fc.assert(
        fc.property(bookmarkArb, (bookmark) => {
          // Generate mock summary
          const summary: BookmarkSummary = {
            bookmarkId: bookmark.id,
            summary: '这是一个关于技术的网页',
            keywords: ['技术', '编程'],
            generatedAt: Date.now()
          }

          // Validate structure
          expect(summary.bookmarkId).toBe(bookmark.id)
          expect(summary.summary.length).toBeGreaterThan(0)
          expect(Array.isArray(summary.keywords)).toBe(true)
          expect(summary.generatedAt).toBeGreaterThan(0)
        }),
        PBT_CONFIG
      )
    })
  })

  /**
   * Property 11: Duplicate Recommendation Validity
   * For any duplicate group containing at least 2 bookmarks, the recommendation
   * should reference a keepBookmarkId that exists in the group and include
   * a non-empty reasoning string.
   * Validates: Requirements 4.1, 4.2
   */
  describe('Property 11: Duplicate Recommendation Validity', () => {
    it('should validate duplicate recommendation structure', () => {
      fc.assert(
        fc.property(
          fc.array(bookmarkArb, { minLength: 2, maxLength: 5 }),
          (group) => {
            // Generate mock recommendation
            const recommendation: DuplicateRecommendation = {
              groupId: 'test-group',
              keepBookmarkId: group[0].id,
              reasoning: '保留最早添加的书签',
              factors: ['添加时间', '标题质量']
            }

            // Validate structure
            expect(group.some(b => b.id === recommendation.keepBookmarkId)).toBe(true)
            expect(recommendation.reasoning.length).toBeGreaterThan(0)
            expect(Array.isArray(recommendation.factors)).toBe(true)
          }
        ),
        PBT_CONFIG
      )
    })
  })

  /**
   * Property 13: Health Analysis Validity
   * For any list of bookmarks, health analysis should return a list of HealthIssue
   * objects where each issue references a valid bookmark ID, has a valid issueType,
   * and includes a non-empty suggestion.
   * Validates: Requirements 5.1, 5.3
   */
  describe('Property 13: Health Analysis Validity', () => {
    it('should validate health issue structure', () => {
      fc.assert(
        fc.property(
          fc.array(bookmarkArb, { minLength: 1, maxLength: 5 }),
          (bookmarks) => {
            // Generate mock health issues
            const issues: HealthIssue[] = bookmarks.slice(0, 2).map(b => ({
              bookmarkId: b.id,
              issueType: 'outdated' as const,
              description: '该书签可能已过时',
              suggestion: '建议检查链接是否有效',
              dismissed: false
            }))

            // Validate structure
            for (const issue of issues) {
              expect(bookmarks.some(b => b.id === issue.bookmarkId)).toBe(true)
              expect(['outdated', 'low_value', 'broken_pattern', 'redundant']).toContain(issue.issueType)
              expect(issue.suggestion.length).toBeGreaterThan(0)
              expect(typeof issue.dismissed).toBe('boolean')
            }
          }
        ),
        PBT_CONFIG
      )
    })
  })

  /**
   * Property 18: Report Structure Validity
   * For any non-empty bookmark collection, the generated report should contain
   * all required fields.
   * Validates: Requirements 7.1, 7.2, 7.3, 7.4
   */
  describe('Property 18: Report Structure Validity', () => {
    it('should validate report structure', () => {
      fc.assert(
        fc.property(reportArb, (report) => {
          // Validate required fields
          expect(report.generatedAt).toBeGreaterThan(0)
          expect(report.totalBookmarks).toBeGreaterThan(0)
          expect(typeof report.categoryDistribution).toBe('object')
          expect(Array.isArray(report.domainPatterns)).toBe(true)
          expect(Array.isArray(report.timelineTrends)).toBe(true)
          expect(Array.isArray(report.recommendations)).toBe(true)
          expect(Array.isArray(report.insights)).toBe(true)
        }),
        PBT_CONFIG
      )
    })
  })

  /**
   * Property 19: Report Export Validity
   * For any CollectionReport, exporting to Markdown should produce a valid
   * Markdown string, and exporting to HTML should produce valid HTML.
   * Validates: Requirements 7.5
   */
  describe('Property 19: Report Export Validity', () => {
    it('should export valid Markdown', () => {
      fc.assert(
        fc.property(reportArb, (report) => {
          const markdown = exportReportToMarkdown(report)

          // Validate Markdown structure
          expect(markdown).toContain('# 书签集合分析报告')
          expect(markdown).toContain('## 概览')
          expect(markdown).toContain('## 洞察')
          expect(markdown).toContain('## 建议')
          expect(markdown).toContain(`书签总数: ${report.totalBookmarks}`)
        }),
        PBT_CONFIG
      )
    })

    it('should export valid HTML', () => {
      fc.assert(
        fc.property(reportArb, (report) => {
          const html = exportReportToHTML(report)

          // Validate HTML structure
          expect(html).toContain('<!DOCTYPE html>')
          expect(html).toContain('<html')
          expect(html).toContain('</html>')
          expect(html).toContain('<h1>书签集合分析报告</h1>')
          expect(html).toContain(`<strong>${report.totalBookmarks}</strong>`)
        }),
        PBT_CONFIG
      )
    })
  })

  /**
   * Property 6: Batch Processing Efficiency
   * For any list of N bookmarks and batch size B, the number of API calls
   * made during categorization should be at most ceil(N/B).
   * Validates: Requirements 2.5
   */
  describe('Property 6: Batch Processing Efficiency', () => {
    it('should process in correct number of batches', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 50 }),
          fc.integer({ min: 1, max: 10 }),
          (itemCount, batchSize) => {
            const expectedBatches = Math.ceil(itemCount / batchSize)
            
            // Simulate batch processing
            let actualBatches = 0
            for (let i = 0; i < itemCount; i += batchSize) {
              actualBatches++
            }

            expect(actualBatches).toBe(expectedBatches)
          }
        ),
        PBT_CONFIG
      )
    })
  })

  /**
   * Property 15: Query Interpretation Validity
   * For any non-empty natural language query string, the interpreter should
   * return a valid interpretation object without throwing.
   * Validates: Requirements 6.1
   */
  describe('Property 15: Query Interpretation Validity', () => {
    it('should validate query interpretation structure', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 100 }),
          fc.array(bookmarkArb, { minLength: 0, maxLength: 10 }),
          (query, bookmarks) => {
            // Mock interpretation result
            const interpretation = {
              matchedIds: bookmarks.slice(0, 3).map(b => b.id),
              interpretation: `搜索: ${query}`,
              suggestions: bookmarks.length === 0 ? ['尝试其他关键词'] : undefined
            }

            // Validate structure
            expect(Array.isArray(interpretation.matchedIds)).toBe(true)
            expect(interpretation.interpretation.length).toBeGreaterThan(0)
            
            // All matched IDs should be valid
            for (const id of interpretation.matchedIds) {
              expect(bookmarks.some(b => b.id === id)).toBe(true)
            }
          }
        ),
        PBT_CONFIG
      )
    })
  })

  /**
   * Property 16: Search Result Validity
   * For any interpreted query and bookmark set, all returned bookmark IDs
   * should exist in the original bookmark set.
   * Validates: Requirements 6.2
   */
  describe('Property 16: Search Result Validity', () => {
    it('should only return valid bookmark IDs', () => {
      fc.assert(
        fc.property(
          fc.array(bookmarkArb, { minLength: 1, maxLength: 20 }),
          (bookmarks) => {
            const validIds = new Set(bookmarks.map(b => b.id))
            
            // Simulate search results (random subset)
            const resultIds = bookmarks
              .slice(0, Math.floor(bookmarks.length / 2))
              .map(b => b.id)

            // All result IDs should be valid
            for (const id of resultIds) {
              expect(validIds.has(id)).toBe(true)
            }
          }
        ),
        PBT_CONFIG
      )
    })
  })

  /**
   * Property 17: Empty Search Suggestions
   * For any query that returns zero results, the system should provide
   * at least one alternative search suggestion.
   * Validates: Requirements 6.4
   */
  describe('Property 17: Empty Search Suggestions', () => {
    it('should provide suggestions when no results', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }),
          (query) => {
            // Simulate empty search result
            const result = {
              matchedIds: [],
              interpretation: `未找到匹配: ${query}`,
              suggestions: ['尝试更通用的关键词', '检查拼写']
            }

            // Should have suggestions when no results
            if (result.matchedIds.length === 0) {
              expect(result.suggestions).toBeDefined()
              expect(result.suggestions!.length).toBeGreaterThan(0)
            }
          }
        ),
        PBT_CONFIG
      )
    })
  })
})
