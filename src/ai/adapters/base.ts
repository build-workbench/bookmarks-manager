/**
 * Base LLM Adapter
 * Abstract base class for all LLM provider adapters
 */

import type { LLMAdapter, LLMConfig, LLMRequest, LLMResponse } from '../types'
import { AIServiceError, AIErrorCode } from '../types'
import { TOKEN_COSTS, MAX_RETRIES, RETRY_DELAY_MS } from '../constants'

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
   * Retry logic with exponential backoff
   */
  protected async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = MAX_RETRIES
  ): Promise<T> {
    let lastError: Error | null = null
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error as Error
        
        // Check if error is retryable
        if (error instanceof AIServiceError && !error.retryable) {
          throw error
        }
        
        // Wait before retry with exponential backoff
        if (attempt < maxRetries - 1) {
          const delay = RETRY_DELAY_MS * Math.pow(2, attempt)
          await this.sleep(delay)
        }
      }
    }
    
    throw lastError
  }

  protected sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * Parse JSON from LLM response, handling markdown code blocks
   */
  protected parseJsonResponse<T>(content: string): T {
    // Remove markdown code blocks if present
    let jsonStr = content.trim()
    
    // Handle ```json ... ``` format
    const jsonBlockMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/)
    if (jsonBlockMatch) {
      jsonStr = jsonBlockMatch[1].trim()
    }
    
    try {
      return JSON.parse(jsonStr) as T
    } catch {
      throw new AIServiceError({
        code: AIErrorCode.INVALID_RESPONSE,
        message: `Failed to parse JSON response: ${content.substring(0, 100)}...`,
        retryable: false
      })
    }
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
      case 429:
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
