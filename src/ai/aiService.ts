/**
 * AI Service - Core AI analysis functionality
 * Provides bookmark categorization, summarization, duplicate analysis,
 * health checks, natural language search, and report generation
 */

import type {
  LLMConfig,
  LLMRequest,
  LLMResponse,
  CategorySuggestion,
  BookmarkSummary,
  DuplicateRecommendation,
  HealthIssue,
  CollectionReport,
  QueryInterpretation,
  AIErrorCode
} from './types'
import { AIServiceError } from './types'
import { createAdapter } from './adapters'
import { promptService, renderPrompt } from './promptService'
import { cacheService, generateCacheKey, generateBookmarkHash } from './cacheService'
import { usageService } from './usageService'
import { SYSTEM_PROMPTS, DEFAULT_BATCH_SIZE, MAX_RETRIES, RETRY_DELAY_MS } from './constants'
import type { Bookmark } from '../utils/bookmarkParser'

// Rate limiting state
let lastRequestTime = 0
const MIN_REQUEST_INTERVAL_MS = 100

/**
 * Sleep for a specified duration
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Ensure minimum interval between requests
 */
async function enforceRateLimit(): Promise<void> {
  const now = Date.now()
  const elapsed = now - lastRequestTime
  if (elapsed < MIN_REQUEST_INTERVAL_MS) {
    await sleep(MIN_REQUEST_INTERVAL_MS - elapsed)
  }
  lastRequestTime = Date.now()
}


/**
 * Make an LLM API call with retry logic
 */
async function callLLM(
  config: LLMConfig,
  request: LLMRequest,
  operation: string
): Promise<LLMResponse> {
  // Check usage limits first
  const limitCheck = await usageService.checkLimits()
  if (limitCheck.exceeded) {
    throw new AIServiceError({
      code: AIErrorCode.USAGE_LIMIT_REACHED,
      message: limitCheck.message || 'Usage limit exceeded',
      retryable: false
    })
  }

  const adapter = createAdapter(config)
  let lastError: Error | null = null

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      await enforceRateLimit()
      const response = await adapter.chat(request)

      // Record usage
      await usageService.recordUsage({
        timestamp: Date.now(),
        operation,
        promptTokens: response.usage.promptTokens,
        completionTokens: response.usage.completionTokens,
        totalTokens: response.usage.totalTokens,
        estimatedCost: usageService.estimateCost(
          config.model,
          response.usage.promptTokens,
          response.usage.completionTokens
        ),
        model: response.model
      })

      return response
    } catch (error) {
      lastError = error as Error
      
      if (error instanceof AIServiceError) {
        if (!error.retryable) {
          throw error
        }
        if (error.retryAfterMs) {
          await sleep(error.retryAfterMs)
        } else {
          await sleep(RETRY_DELAY_MS * Math.pow(2, attempt))
        }
      } else {
        await sleep(RETRY_DELAY_MS * Math.pow(2, attempt))
      }
    }
  }

  throw lastError || new Error('Unknown error during LLM call')
}

/**
 * Parse JSON from LLM response, handling potential formatting issues
 */
function parseJSONResponse<T>(content: string): T {
  // Try to extract JSON from the response
  const jsonMatch = content.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    throw new AIServiceError({
      code: AIErrorCode.INVALID_RESPONSE,
      message: 'No JSON found in response',
      retryable: false
    })
  }

  try {
    return JSON.parse(jsonMatch[0]) as T
  } catch {
    throw new AIServiceError({
      code: AIErrorCode.INVALID_RESPONSE,
      message: 'Failed to parse JSON response',
      retryable: false
    })
  }
}

/**
 * Process items in batches
 */
async function processBatches<T, R>(
  items: T[],
  batchSize: number,
  processor: (batch: T[]) => Promise<R[]>,
  onProgress?: (processed: number, total: number) => void
): Promise<R[]> {
  const results: R[] = []
  
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize)
    const batchResults = await processor(batch)
    results.push(...batchResults)
    
    if (onProgress) {
      onProgress(Math.min(i + batchSize, items.length), items.length)
    }
  }

  return results
}


/**
 * Categorize bookmarks using AI
 */
export async function categorizeBookmarks(
  config: LLMConfig,
  bookmarks: Bookmark[],
  options?: {
    batchSize?: number
    forceRefresh?: boolean
    onProgress?: (processed: number, total: number) => void
  }
): Promise<CategorySuggestion[]> {
  const batchSize = options?.batchSize || DEFAULT_BATCH_SIZE

  const processBatch = async (batch: Bookmark[]): Promise<CategorySuggestion[]> => {
    const cacheKey = generateCacheKey('category', generateBookmarkHash(batch.map(b => b.id)))
    
    const result = await cacheService.getOrCompute(
      cacheKey,
      'category',
      generateBookmarkHash(batch),
      async () => {
        const template = await promptService.getTemplate('categorize')
        if (!template) throw new Error('Categorize template not found')

        const bookmarksText = batch.map(b => 
          `ID: ${b.id}\nTitle: ${b.title}\nURL: ${b.url}\nPath: ${b.path.join('/')}`
        ).join('\n\n')

        const prompt = renderPrompt(template.template, { bookmarks: bookmarksText })

        const request: LLMRequest = {
          messages: [
            { role: 'system', content: SYSTEM_PROMPTS.categorize },
            { role: 'user', content: prompt }
          ],
          maxTokens: config.maxTokens,
          temperature: config.temperature
        }

        const response = await callLLM(config, request, 'categorize')
        const parsed = parseJSONResponse<{ suggestions: CategorySuggestion[] }>(response.content)
        
        return parsed.suggestions.map(s => ({
          ...s,
          confidence: Math.max(0, Math.min(1, s.confidence))
        }))
      },
      undefined,
      options?.forceRefresh
    )

    return result.value
  }

  return processBatches(bookmarks, batchSize, processBatch, options?.onProgress)
}

/**
 * Generate summary for a single bookmark
 */
export async function summarizeBookmark(
  config: LLMConfig,
  bookmark: Bookmark,
  options?: { forceRefresh?: boolean }
): Promise<BookmarkSummary> {
  const cacheKey = generateCacheKey('summary', bookmark.id)
  const bookmarkHash = generateBookmarkHash({ id: bookmark.id, title: bookmark.title, url: bookmark.url })

  const result = await cacheService.getOrCompute(
    cacheKey,
    'summary',
    bookmarkHash,
    async () => {
      const template = await promptService.getTemplate('summarize')
      if (!template) throw new Error('Summarize template not found')

      const prompt = renderPrompt(template.template, {
        title: bookmark.title,
        url: bookmark.url,
        path: bookmark.path.join('/')
      })

      const request: LLMRequest = {
        messages: [
          { role: 'system', content: SYSTEM_PROMPTS.summarize },
          { role: 'user', content: prompt }
        ],
        maxTokens: config.maxTokens,
        temperature: config.temperature
      }

      try {
        const response = await callLLM(config, request, 'summarize')
        const parsed = parseJSONResponse<{ summary: string; keywords: string[] }>(response.content)
        
        return {
          bookmarkId: bookmark.id,
          summary: parsed.summary,
          keywords: parsed.keywords || [],
          generatedAt: Date.now()
        }
      } catch {
        // Return fallback summary on error
        return {
          bookmarkId: bookmark.id,
          summary: '无法生成摘要',
          keywords: [],
          generatedAt: Date.now()
        }
      }
    },
    undefined,
    options?.forceRefresh
  )

  return result.value
}

/**
 * Generate summaries for multiple bookmarks
 */
export async function summarizeBookmarks(
  config: LLMConfig,
  bookmarks: Bookmark[],
  options?: {
    batchSize?: number
    forceRefresh?: boolean
    onProgress?: (processed: number, total: number) => void
  }
): Promise<BookmarkSummary[]> {
  const results: BookmarkSummary[] = []
  
  for (let i = 0; i < bookmarks.length; i++) {
    const summary = await summarizeBookmark(config, bookmarks[i], { forceRefresh: options?.forceRefresh })
    results.push(summary)
    
    if (options?.onProgress) {
      options.onProgress(i + 1, bookmarks.length)
    }
  }

  return results
}


/**
 * Analyze duplicate bookmark groups and recommend which to keep
 */
export async function analyzeDuplicates(
  config: LLMConfig,
  duplicateGroups: Bookmark[][],
  options?: {
    forceRefresh?: boolean
    onProgress?: (processed: number, total: number) => void
  }
): Promise<DuplicateRecommendation[]> {
  const results: DuplicateRecommendation[] = []

  for (let i = 0; i < duplicateGroups.length; i++) {
    const group = duplicateGroups[i]
    if (group.length < 2) continue

    const groupId = generateBookmarkHash(group.map(b => b.id))
    const cacheKey = generateCacheKey('duplicate', groupId)

    const result = await cacheService.getOrCompute(
      cacheKey,
      'duplicate',
      generateBookmarkHash(group),
      async () => {
        const template = await promptService.getTemplate('duplicate_analysis')
        if (!template) throw new Error('Duplicate analysis template not found')

        const duplicatesText = group.map(b => 
          `ID: ${b.id}\nTitle: ${b.title}\nURL: ${b.url}\nPath: ${b.path.join('/')}\nAdded: ${new Date((b.addDate || 0) * 1000).toISOString()}`
        ).join('\n\n')

        const prompt = renderPrompt(template.template, { duplicates: duplicatesText })

        const request: LLMRequest = {
          messages: [
            { role: 'system', content: SYSTEM_PROMPTS.duplicate },
            { role: 'user', content: prompt }
          ],
          maxTokens: config.maxTokens,
          temperature: config.temperature
        }

        try {
          const response = await callLLM(config, request, 'duplicate_analysis')
          const parsed = parseJSONResponse<{ keepId: string; reasoning: string; factors: string[] }>(response.content)
          
          // Validate keepId is in the group
          const validKeepId = group.some(b => b.id === parsed.keepId)
          
          return {
            groupId,
            keepBookmarkId: validKeepId ? parsed.keepId : group[0].id,
            reasoning: parsed.reasoning || '基于时间戳和标题质量的默认推荐',
            factors: parsed.factors || ['添加时间', '标题质量']
          }
        } catch {
          // Fallback: keep the earliest bookmark
          const earliest = group.reduce((a, b) => 
            (a.addDate || 0) < (b.addDate || 0) ? a : b
          )
          return {
            groupId,
            keepBookmarkId: earliest.id,
            reasoning: '默认保留最早添加的书签',
            factors: ['添加时间']
          }
        }
      },
      undefined,
      options?.forceRefresh
    )

    results.push(result.value)

    if (options?.onProgress) {
      options.onProgress(i + 1, duplicateGroups.length)
    }
  }

  return results
}

/**
 * Analyze bookmark health and identify potential issues
 */
export async function analyzeHealth(
  config: LLMConfig,
  bookmarks: Bookmark[],
  options?: {
    batchSize?: number
    forceRefresh?: boolean
    onProgress?: (processed: number, total: number) => void
  }
): Promise<HealthIssue[]> {
  const batchSize = options?.batchSize || DEFAULT_BATCH_SIZE

  const processBatch = async (batch: Bookmark[]): Promise<HealthIssue[]> => {
    const cacheKey = generateCacheKey('health', generateBookmarkHash(batch.map(b => b.id)))

    const result = await cacheService.getOrCompute(
      cacheKey,
      'health',
      generateBookmarkHash(batch),
      async () => {
        const template = await promptService.getTemplate('health_check')
        if (!template) throw new Error('Health check template not found')

        const bookmarksText = batch.map(b => 
          `ID: ${b.id}\nTitle: ${b.title}\nURL: ${b.url}\nPath: ${b.path.join('/')}`
        ).join('\n\n')

        const prompt = renderPrompt(template.template, { bookmarks: bookmarksText })

        const request: LLMRequest = {
          messages: [
            { role: 'system', content: SYSTEM_PROMPTS.health },
            { role: 'user', content: prompt }
          ],
          maxTokens: config.maxTokens,
          temperature: config.temperature
        }

        try {
          const response = await callLLM(config, request, 'health_check')
          const parsed = parseJSONResponse<{ issues: HealthIssue[] }>(response.content)
          
          return parsed.issues.map(issue => ({
            ...issue,
            dismissed: false
          }))
        } catch {
          return []
        }
      },
      undefined,
      options?.forceRefresh
    )

    return result.value
  }

  return processBatches(bookmarks, batchSize, processBatch, options?.onProgress)
}


/**
 * Interpret a natural language query and find matching bookmarks
 */
export async function interpretQuery(
  config: LLMConfig,
  query: string,
  bookmarks: Bookmark[],
  options?: { forceRefresh?: boolean }
): Promise<QueryInterpretation> {
  // For very large bookmark sets, we need to be selective
  const maxBookmarksForContext = 100
  const bookmarksForContext = bookmarks.length > maxBookmarksForContext
    ? bookmarks.slice(0, maxBookmarksForContext)
    : bookmarks

  const cacheKey = generateCacheKey('report', generateBookmarkHash({ query, bookmarkIds: bookmarksForContext.map(b => b.id) }))

  const result = await cacheService.getOrCompute(
    cacheKey,
    'report',
    generateBookmarkHash({ query }),
    async () => {
      const template = await promptService.getTemplate('natural_search')
      if (!template) throw new Error('Natural search template not found')

      const bookmarksText = bookmarksForContext.map(b => 
        `ID: ${b.id} | ${b.title} | ${b.url}`
      ).join('\n')

      const prompt = renderPrompt(template.template, {
        query,
        bookmarks: bookmarksText
      })

      const request: LLMRequest = {
        messages: [
          { role: 'system', content: SYSTEM_PROMPTS.search },
          { role: 'user', content: prompt }
        ],
        maxTokens: config.maxTokens,
        temperature: config.temperature
      }

      try {
        const response = await callLLM(config, request, 'natural_search')
        const parsed = parseJSONResponse<QueryInterpretation>(response.content)
        
        // Validate matched IDs exist in bookmarks
        const validIds = new Set(bookmarks.map(b => b.id))
        const validMatchedIds = (parsed.matchedIds || []).filter(id => validIds.has(id))

        return {
          matchedIds: validMatchedIds,
          interpretation: parsed.interpretation || '搜索查询',
          suggestions: validMatchedIds.length === 0 ? (parsed.suggestions || ['尝试更具体的关键词']) : undefined
        }
      } catch {
        return {
          matchedIds: [],
          interpretation: '无法解析查询',
          suggestions: ['尝试使用不同的关键词', '检查拼写是否正确']
        }
      }
    },
    undefined,
    options?.forceRefresh
  )

  return result.value
}

/**
 * Generate a comprehensive report for the bookmark collection
 */
export async function generateReport(
  config: LLMConfig,
  bookmarks: Bookmark[],
  stats: {
    domainStats: Record<string, number>
    yearStats: Record<string, number>
    folderStats: Record<string, number>
  },
  options?: { forceRefresh?: boolean }
): Promise<CollectionReport> {
  const cacheKey = generateCacheKey('report', generateBookmarkHash({ count: bookmarks.length, ...stats }))

  const result = await cacheService.getOrCompute(
    cacheKey,
    'report',
    generateBookmarkHash(stats),
    async () => {
      const template = await promptService.getTemplate('collection_report')
      if (!template) throw new Error('Collection report template not found')

      // Format stats for the prompt
      const topDomains = Object.entries(stats.domainStats)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20)
        .map(([domain, count]) => `${domain}: ${count}`)
        .join(', ')

      const yearDistribution = Object.entries(stats.yearStats)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([year, count]) => `${year}: ${count}`)
        .join(', ')

      const topFolders = Object.entries(stats.folderStats)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([folder, count]) => `${folder}: ${count}`)
        .join(', ')

      const prompt = renderPrompt(template.template, {
        totalCount: bookmarks.length.toString(),
        domainStats: topDomains,
        timeStats: yearDistribution,
        folderStats: topFolders
      })

      const request: LLMRequest = {
        messages: [
          { role: 'system', content: SYSTEM_PROMPTS.report },
          { role: 'user', content: prompt }
        ],
        maxTokens: config.maxTokens,
        temperature: config.temperature
      }

      try {
        const response = await callLLM(config, request, 'report')
        const parsed = parseJSONResponse<{
          insights: string[]
          recommendations: string[]
          highlights?: {
            topCategories?: string[]
            growthTrend?: string
            organizationScore?: number
            organizationFeedback?: string
          }
        }>(response.content)

        // Build domain patterns from stats
        const domainPatterns = Object.entries(stats.domainStats)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 20)
          .map(([domain, count]) => ({ domain, count }))

        // Build timeline trends from year stats
        const timelineTrends = Object.entries(stats.yearStats)
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(([period, count]) => ({ period, count }))

        // Build category distribution (simplified)
        const categoryDistribution: Record<string, number> = {}
        for (const [folder, count] of Object.entries(stats.folderStats)) {
          const category = folder.split('/')[0] || '未分类'
          categoryDistribution[category] = (categoryDistribution[category] || 0) + count
        }

        return {
          generatedAt: Date.now(),
          totalBookmarks: bookmarks.length,
          categoryDistribution,
          domainPatterns,
          timelineTrends,
          recommendations: parsed.recommendations || [],
          insights: parsed.insights || []
        }
      } catch {
        // Return basic report on error
        return {
          generatedAt: Date.now(),
          totalBookmarks: bookmarks.length,
          categoryDistribution: stats.folderStats,
          domainPatterns: Object.entries(stats.domainStats)
            .slice(0, 10)
            .map(([domain, count]) => ({ domain, count })),
          timelineTrends: Object.entries(stats.yearStats)
            .map(([period, count]) => ({ period, count })),
          recommendations: ['无法生成 AI 建议，请检查 API 配置'],
          insights: ['基础统计报告']
        }
      }
    },
    undefined,
    options?.forceRefresh
  )

  return result.value
}

/**
 * Export report to Markdown format
 */
export function exportReportToMarkdown(report: CollectionReport): string {
  const lines: string[] = [
    '# 书签集合分析报告',
    '',
    `生成时间: ${new Date(report.generatedAt).toLocaleString()}`,
    '',
    '## 概览',
    '',
    `- 书签总数: ${report.totalBookmarks}`,
    '',
    '## 洞察',
    '',
    ...report.insights.map(i => `- ${i}`),
    '',
    '## 建议',
    '',
    ...report.recommendations.map(r => `- ${r}`),
    '',
    '## 域名分布 (Top 10)',
    '',
    '| 域名 | 数量 |',
    '|------|------|',
    ...report.domainPatterns.slice(0, 10).map(d => `| ${d.domain} | ${d.count} |`),
    '',
    '## 时间趋势',
    '',
    '| 年份 | 数量 |',
    '|------|------|',
    ...report.timelineTrends.map(t => `| ${t.period} | ${t.count} |`),
    ''
  ]

  return lines.join('\n')
}

/**
 * Export report to HTML format
 */
export function exportReportToHTML(report: CollectionReport): string {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>书签集合分析报告</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
    h1 { color: #333; }
    h2 { color: #666; border-bottom: 1px solid #eee; padding-bottom: 10px; }
    ul { padding-left: 20px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f5f5f5; }
    .meta { color: #999; font-size: 14px; }
  </style>
</head>
<body>
  <h1>书签集合分析报告</h1>
  <p class="meta">生成时间: ${new Date(report.generatedAt).toLocaleString()}</p>
  
  <h2>概览</h2>
  <p>书签总数: <strong>${report.totalBookmarks}</strong></p>
  
  <h2>洞察</h2>
  <ul>
    ${report.insights.map(i => `<li>${i}</li>`).join('\n    ')}
  </ul>
  
  <h2>建议</h2>
  <ul>
    ${report.recommendations.map(r => `<li>${r}</li>`).join('\n    ')}
  </ul>
  
  <h2>域名分布 (Top 10)</h2>
  <table>
    <tr><th>域名</th><th>数量</th></tr>
    ${report.domainPatterns.slice(0, 10).map(d => `<tr><td>${d.domain}</td><td>${d.count}</td></tr>`).join('\n    ')}
  </table>
  
  <h2>时间趋势</h2>
  <table>
    <tr><th>年份</th><th>数量</th></tr>
    ${report.timelineTrends.map(t => `<tr><td>${t.period}</td><td>${t.count}</td></tr>`).join('\n    ')}
  </table>
</body>
</html>`
}

// Export as a service object
export const aiService = {
  categorizeBookmarks,
  summarizeBookmark,
  summarizeBookmarks,
  analyzeDuplicates,
  analyzeHealth,
  interpretQuery,
  generateReport,
  exportReportToMarkdown,
  exportReportToHTML
}
