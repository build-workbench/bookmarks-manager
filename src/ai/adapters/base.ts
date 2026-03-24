/**
 * Base LLM Adapter
 * Abstract base class for all LLM provider adapters
 */

import type { LLMAdapter, LLMConfig, LLMRequest, LLMResponse } from '@/ai/types'
import { AIServiceError, AIErrorCode } from '@/ai/types'
import { TOKEN_COSTS } from '@/ai/constants'
import { parseJSONResponse } from '@/ai/llmHelpers'

export abstract class BaseLLMAdapter implements LLMAdapter {
  protected config: LLMConfig

  constructor(config: LLMConfig) {
    this.config = config
  }

  abstract chat(request: LLMRequest): Promise<LLMResponse>
  abstract validateApiKey(): Promise<boolean>

  /**
   * Estimate cost based on token count
   */
  estimateCost(tokens: number): number {
    const costs = TOKEN_COSTS[this.config.model]
    if (!costs) {
      // Default cost estimate for unknown models
      return tokens * 0.001 / 1000
    }
    // Assume roughly equal input/output for estimation
    const avgCost = (costs.input + costs.output) / 2
    return (tokens * avgCost) / 1000
  }

  /**
   * Calculate actual cost from usage
   */
  calculateCost(promptTokens: number, completionTokens: number): number {
    const costs = TOKEN_COSTS[this.config.model]
    if (!costs) {
      return (promptTokens + completionTokens) * 0.001 / 1000
    }
    return (promptTokens * costs.input + completionTokens * costs.output) / 1000
  }

  /**
   * Parse JSON from LLM response using the shared helper
   */
  protected parseJsonResponse<T>(content: string): T {
    return parseJSONResponse(content)
  }

  /**
   * Execute a single provider request without adapter-level retries.
   * Retries are owned by callLLM to avoid nested retry loops.
   */
  protected execute<T>(operation: () => Promise<T>): Promise<T> {
    return operation()
  }

  /**
   * Compatibility wrapper retained for existing adapters.
   * This intentionally does not retry.
   */
  protected withRetry<T>(operation: () => Promise<T>): Promise<T> {
    return this.execute(operation)
  }

  protected sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Handle HTTP errors and convert to AIServiceError
   */
  protected handleHttpError(status: number, body: string): never {
    switch (status) {
      case 401:
        throw new AIServiceError({
          code: AIErrorCode.INVALID_API_KEY,
          message: 'Invalid API key',
          retryable: false
        })
      case 429: {
        // Try to extract retry-after from response
        let retryAfterMs = 60000 // Default 1 minute
        try {
          const parsed = JSON.parse(body)
          if (parsed.error?.retry_after) {
            retryAfterMs = parsed.error.retry_after * 1000
          }
        } catch {
          // Use default
        }
        throw new AIServiceError({
          code: AIErrorCode.RATE_LIMITED,
          message: 'Rate limit exceeded',
          retryable: true,
          retryAfterMs
        })
      }
      case 402:
      case 403:
        throw new AIServiceError({
          code: AIErrorCode.QUOTA_EXCEEDED,
          message: 'API quota exceeded or access denied',
          retryable: false
        })
      case 500:
      case 502:
      case 503:
      case 504:
        throw new AIServiceError({
          code: AIErrorCode.PROVIDER_ERROR,
          message: `Provider error: ${status}`,
          retryable: true
        })
      default:
        throw new AIServiceError({
          code: AIErrorCode.NETWORK_ERROR,
          message: `HTTP error: ${status} - ${body.substring(0, 200)}`,
          retryable: status >= 500
        })
    }
  }
}
