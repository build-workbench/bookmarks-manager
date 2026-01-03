/**
 * LLM Adapters Index
 * Factory function to create the appropriate adapter based on provider
 */

import type { LLMAdapter, LLMConfig } from '../types'
import { AIServiceError, AIErrorCode } from '../types'
import { OpenAIAdapter } from './openai'
import { ClaudeAdapter } from './claude'
import { CustomAdapter } from './custom'

export { BaseLLMAdapter } from './base'
export { OpenAIAdapter } from './openai'
export { ClaudeAdapter } from './claude'
export { CustomAdapter } from './custom'

/**
 * Create an LLM adapter based on the provider configuration
 */
export function createAdapter(config: LLMConfig): LLMAdapter {
  switch (config.provider) {
    case 'openai':
      return new OpenAIAdapter(config)
    case 'claude':
      return new ClaudeAdapter(config)
    case 'custom':
      return new CustomAdapter(config)
    default:
      throw new AIServiceError({
        code: AIErrorCode.INVALID_API_KEY,
        message: `Unknown provider: ${config.provider}`,
        retryable: false
      })
  }
}
