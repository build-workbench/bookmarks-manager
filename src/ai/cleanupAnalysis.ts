/**
 * AI Cleanup Analysis Service
 * Provides AI-powered analysis for bookmark cleanup workflow
 */

import type { LLMConfig, LLMRequest, AIErrorCode } from './types'
import { AIServiceError } from './types'
import { createAdapter } from './adapters'
import { usageService } from './usageService'
import { cacheService, generateCacheKey, generateBookmarkHash } from './cacheService'
import { MAX_RETRIES, RETRY_DELAY_MS } from './constants'
import type { Bookmark } from '../utils/bookmarkParser'
import type {
    AICleanupRecommendation,
    SuggestedFolder,
    RecommendationType,
    ReasonType
} from '../cleanup/types'

// Rate limiting state
let lastRequestTime = 0
const MIN_REQUEST_INTERVAL_MS = 100

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
}

async function enforceRateLimit(): Promise<void> {
    const now = Date.now()
    const elapsed = now - lastRequestTime
    if (elapsed < MIN_REQUEST_INTERVAL_MS) {
        await sleep(MIN_REQUEST_INTERVAL_MS - elapsed)
    }
    lastRequestTime = Date.now()
}

// System prompts for cleanup analysis
const CLEANUP_SYSTEM_PROMPTS = {
    cleanup: `你是一个书签整理助手。分析用户的书签并提供清理建议。
对于每个书签，判断是否应该删除、保留或需要用户审查。
考虑以下因素：
- URL是否看起来有效（不是明显的死链接模式）
- 标题是否有意义
- 内容是否可能过时（如旧版本文档、已关闭的服务等）
- 是否是低质量内容（如广告、垃圾页面等）
- 是否是有价值的资源

返回JSON格式的分析结果。`,

    categorize: `你是一个书签分类助手。分析用户的书签并建议最佳的文件夹组织结构。
考虑以下因素：
- 书签的主题和内容类型
- 现有的文件夹结构
- 常见的分类模式（如：开发、学习、工具、娱乐等）

建议清晰、实用的文件夹结构，并说明每个建议的理由。
返回JSON格式的分类建议。`
}

/**
 * Make an LLM API call with retry logic
 */
async function callLLM(
    config: LLMConfig,
    request: LLMRequest,
    operation: string
): Promise<string> {
    const limitCheck = await usageService.checkLimits()
    if (limitCheck.exceeded) {
        throw new AIServiceError({
            code: 'USAGE_LIMIT_REACHED' as AIErrorCode,
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

            return response.content
        } catch (error) {
            lastError = error as Error

            if (error instanceof AIServiceError) {
                if (!error.retryable) throw error
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
 * Parse JSON from LLM response
 */
function parseJSONResponse<T>(content: string): T {
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
        throw new Error('No JSON found in response')
    }

    try {
        return JSON.parse(jsonMatch[0]) as T
    } catch {
        throw new Error('Failed to parse JSON response')
    }
}

/**
 * Validate recommendation type
 */
function validateRecommendationType(type: string): RecommendationType {
    if (type === 'delete' || type === 'keep' || type === 'review') {
        return type
    }
    return 'review'
}

/**
 * Validate reason type
 */
function validateReasonType(type: string): ReasonType {
    const validTypes: ReasonType[] = ['duplicate', 'broken', 'outdated', 'low_quality', 'valuable']
    if (validTypes.includes(type as ReasonType)) {
        return type as ReasonType
    }
    return 'low_quality'
}

/**
 * Analyze bookmarks for cleanup recommendations
 */
export async function analyzeForCleanup(
    config: LLMConfig,
    bookmarks: Bookmark[],
    options?: {
        batchSize?: number
        forceRefresh?: boolean
        onProgress?: (processed: number, total: number) => void
    }
): Promise<AICleanupRecommendation[]> {
    const batchSize = options?.batchSize || 20
    const results: AICleanupRecommendation[] = []

    for (let i = 0; i < bookmarks.length; i += batchSize) {
        const batch = bookmarks.slice(i, i + batchSize)
        const cacheKey = generateCacheKey('health', generateBookmarkHash(batch.map(b => b.id)))

        const batchResults = await cacheService.getOrCompute(
            cacheKey,
            'health',
            generateBookmarkHash(batch),
            async () => {
                const bookmarksText = batch.map(b =>
                    `ID: ${b.id}
标题: ${b.title}
URL: ${b.url}
路径: ${b.path.join(' > ') || '根目录'}
添加时间: ${b.addDate ? new Date(b.addDate * 1000).toLocaleDateString() : '未知'}`
                ).join('\n\n---\n\n')

                const prompt = `请分析以下书签，为每个书签提供清理建议：

${bookmarksText}

请返回JSON格式的分析结果，格式如下：
{
  "recommendations": [
    {
      "bookmarkId": "书签ID",
      "recommendation": "delete" | "keep" | "review",
      "reason": "建议理由的详细说明",
      "reasonType": "duplicate" | "broken" | "outdated" | "low_quality" | "valuable",
      "confidence": 0-100的置信度分数
    }
  ]
}

判断标准：
- delete: 明显无用、过时、或低质量的书签
- keep: 有价值、常用、或重要的资源
- review: 需要用户自行判断的书签`

                const request: LLMRequest = {
                    messages: [
                        { role: 'system', content: CLEANUP_SYSTEM_PROMPTS.cleanup },
                        { role: 'user', content: prompt }
                    ],
                    maxTokens: config.maxTokens || 2000,
                    temperature: config.temperature || 0.3
                }

                try {
                    const response = await callLLM(config, request, 'cleanup_analysis')
                    const parsed = parseJSONResponse<{
                        recommendations: Array<{
                            bookmarkId: string
                            recommendation: string
                            reason: string
                            reasonType: string
                            confidence: number
                        }>
                    }>(response)

                    return parsed.recommendations.map(r => ({
                        bookmarkId: r.bookmarkId,
                        recommendation: validateRecommendationType(r.recommendation),
                        reason: r.reason || '无具体理由',
                        reasonType: validateReasonType(r.reasonType),
                        confidence: Math.max(0, Math.min(100, r.confidence || 50))
                    }))
                } catch (error) {
                    // Return default recommendations on error
                    return batch.map(b => ({
                        bookmarkId: b.id,
                        recommendation: 'review' as RecommendationType,
                        reason: '无法分析，请手动审查',
                        reasonType: 'low_quality' as ReasonType,
                        confidence: 0
                    }))
                }
            },
            undefined,
            options?.forceRefresh
        )

        results.push(...batchResults.value)

        if (options?.onProgress) {
            options.onProgress(Math.min(i + batchSize, bookmarks.length), bookmarks.length)
        }
    }

    return results
}

/**
 * Suggest folder structure for bookmarks
 */
export async function suggestFolderStructure(
    config: LLMConfig,
    bookmarks: Bookmark[],
    existingFolders: string[],
    options?: {
        forceRefresh?: boolean
    }
): Promise<SuggestedFolder[]> {
    const cacheKey = generateCacheKey('category', generateBookmarkHash({
        bookmarkIds: bookmarks.map(b => b.id),
        existingFolders
    }))

    const result = await cacheService.getOrCompute(
        cacheKey,
        'category',
        generateBookmarkHash({ count: bookmarks.length }),
        async () => {
            // Sample bookmarks if too many
            const sampleSize = 50
            const sampledBookmarks = bookmarks.length > sampleSize
                ? bookmarks.slice(0, sampleSize)
                : bookmarks

            const bookmarksText = sampledBookmarks.map(b =>
                `ID: ${b.id} | ${b.title} | ${b.url} | 当前路径: ${b.path.join(' > ') || '根目录'}`
            ).join('\n')

            const prompt = `请分析以下书签并建议最佳的文件夹组织结构：

现有文件夹：
${existingFolders.length > 0 ? existingFolders.join('\n') : '（无）'}

书签列表：
${bookmarksText}

请返回JSON格式的分类建议，格式如下：
{
  "suggestions": [
    {
      "name": "文件夹名称",
      "path": ["父文件夹", "子文件夹"],
      "description": "这个文件夹的用途说明",
      "suggestedBookmarkIds": ["应该放入此文件夹的书签ID列表"]
    }
  ]
}

建议原则：
1. 文件夹名称应该简洁明了
2. 层级不要太深（最多2-3层）
3. 相似主题的书签应该归类到一起
4. 可以建议新建文件夹，也可以建议使用现有文件夹`

            const request: LLMRequest = {
                messages: [
                    { role: 'system', content: CLEANUP_SYSTEM_PROMPTS.categorize },
                    { role: 'user', content: prompt }
                ],
                maxTokens: config.maxTokens || 2000,
                temperature: config.temperature || 0.5
            }

            try {
                const response = await callLLM(config, request, 'folder_suggestion')
                const parsed = parseJSONResponse<{
                    suggestions: Array<{
                        name: string
                        path: string[]
                        description: string
                        suggestedBookmarkIds: string[]
                    }>
                }>(response)

                // Validate bookmark IDs exist
                const validIds = new Set(bookmarks.map(b => b.id))

                return parsed.suggestions.map(s => ({
                    name: s.name,
                    path: s.path || [s.name],
                    description: s.description || '',
                    suggestedBookmarkIds: (s.suggestedBookmarkIds || []).filter(id => validIds.has(id))
                }))
            } catch (error) {
                // Return empty suggestions on error
                return []
            }
        },
        undefined,
        options?.forceRefresh
    )

    return result.value
}

/**
 * Group recommendations by type
 */
export function groupRecommendationsByType(
    recommendations: AICleanupRecommendation[]
): Map<RecommendationType, AICleanupRecommendation[]> {
    const groups = new Map<RecommendationType, AICleanupRecommendation[]>()

    groups.set('delete', [])
    groups.set('keep', [])
    groups.set('review', [])

    for (const rec of recommendations) {
        const group = groups.get(rec.recommendation)
        if (group) {
            group.push(rec)
        }
    }

    return groups
}

/**
 * Get statistics from recommendations
 */
export function getRecommendationStats(recommendations: AICleanupRecommendation[]): {
    total: number
    delete: number
    keep: number
    review: number
    avgConfidence: number
} {
    const stats = {
        total: recommendations.length,
        delete: 0,
        keep: 0,
        review: 0,
        avgConfidence: 0
    }

    if (recommendations.length === 0) return stats

    let totalConfidence = 0
    for (const rec of recommendations) {
        stats[rec.recommendation]++
        totalConfidence += rec.confidence
    }

    stats.avgConfidence = Math.round(totalConfidence / recommendations.length)
    return stats
}

// Export as service object
export const cleanupAnalysisService = {
    analyzeForCleanup,
    suggestFolderStructure,
    groupRecommendationsByType,
    getRecommendationStats
}
