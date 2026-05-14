/**
 * Custom Endpoint LLM Adapter
 * Extends OpenAI adapter for OpenAI-compatible custom endpoints
 * (e.g., local LLMs, self-hosted models, or other compatible APIs)
 */

import type { LLMConfig } from '@/ai/types'
import { AIServiceError, AIErrorCode } from '@/ai/types'
import { OpenAIAdapter } from './openai'

export class CustomAdapter extends OpenAIAdapter {
  constructor(config: LLMConfig) {
    super(config)
    if (!config.baseUrl) {
      throw new AIServiceError({
        code: AIErrorCode.INVALID_API_KEY,
        message: 'Custom endpoint requires a base URL',
        retryable: false
      })
    }
  }

  override async validateApiKey(): Promise<boolean> {
    try {
      const headers: Record<string, string> = {}
      if (this.config.apiKey) {
        headers['Authorization'] = `Bearer ${this.config.apiKey}`
      }

      // First try the models endpoint
      const modelsResponse = await fetch(`${this.baseUrl}/models`, {
        method: 'GET',
        headers
      })

      if (modelsResponse.ok) {
        return true
      }

      // If models endpoint doesn't exist, try a minimal chat request
      const chatResponse = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.config.model || 'default',
          messages: [{ role: 'user', content: 'Hi' }],
          max_tokens: 1
        })
      })

      // 401/403 means auth issue, other errors might be acceptable
      return chatResponse.status !== 401 && chatResponse.status !== 403
    } catch {
      return false
    }
  }
}
