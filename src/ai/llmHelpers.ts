/**
 * Shared LLM helper functions
 * Used by both aiService.ts and cleanupAnalysis.ts
 */

import type { LLMConfig, LLMRequest, LLMResponse } from './types'
import { AIErrorCode, AIServiceError } from './types'
import { createAdapter } from './adapters'
import { usageService } from './usageService'
import { MAX_RETRIES, RETRY_DELAY_MS } from './constants'

// Rate limiting state
let lastRequestTime = 0
const MIN_REQUEST_INTERVAL_MS = 100

/**
 * Sleep for a specified duration
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Ensure minimum interval between requests
 */
export async function enforceRateLimit(): Promise<void> {
  const now = Date.now()
  const elapsed = now - lastRequestTime
  if (elapsed < MIN_REQUEST_INTERVAL_MS) {
    await sleep(MIN_REQUEST_INTERVAL_MS - elapsed)
  }
  lastRequestTime = Date.now()
}

/**
 * Make an LLM API call with retry logic and usage recording
 */
export async function callLLM(
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
export function parseJSONResponse<T>(content: string): T {
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
export async function processBatches<T, R>(
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
