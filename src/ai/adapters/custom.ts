/**
 * Custom Endpoint LLM Adapter
 * Implements the LLM adapter interface for OpenAI-compatible custom endpoints
 * (e.g., local LLMs, self-hosted models, or other compatible APIs)
 */

import type { LLMConfig, LLMRequest, LLMResponse } from '../types'
import { AIServiceError, AIErrorCode } from '../types'
import { DEFAULT_MAX_TOKENS, DEFAULT_TEMPERATURE } from '../constants'
import { BaseLLMAdapter } from './base'

interface OpenAICompatibleMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface OpenAICompatibleRequest {
  model: string
  messages: OpenAICompatibleMessage[]
  max_tokens?: number
  temperature?: number
  stream?: boolean
}

interface OpenAICompatibleResponse {
  id?: string
  object?: string
  created?: number
  model: string
  choices: Array<{
    index: number
    message: {
      role: string
      content: string
    }
    finish_reason?: string
  }>
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export class CustomAdapter extends BaseLLMAdapter {
  private baseUrl: string

  constructor(config: LLMConfig) {
    super(config)
    if (!config.baseUrl) {
      throw new AIServiceError({
        code: AIErrorCode.INVALID_API_KEY,
        message: 'Custom endpoint requires a base URL',
        retryable: false
      })
    }
    this.baseUrl = config.baseUrl
  }

  async chat(request: LLMRequest): Promise<LLMResponse> {
    return this.withRetry(async () => {
      const customRequest: OpenAICompatibleRequest = {
        model: this.config.model,
        messages: request.messages.map(m => ({
          role: m.role,
          content: m.content
        })),
        max_tokens: request.maxTokens ?? this.config.maxTokens ?? DEFAULT_MAX_TOKENS,
        temperature: request.temperature ?? this.config.temperature ?? DEFAULT_TEMPERATURE,
        stream: false
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }

      // Add authorization header if API key is provided
      if (this.config.apiKey) {
        headers['Authorization'] = `Bearer ${this.config.apiKey}`
      }

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers,
        body: JSON.stringify(customRequest)
      })

      const body = await response.text()

      if (!response.ok) {
        this.handleHttpError(response.status, body)
      }

      let data: OpenAICompatibleResponse
      try {
        data = JSON.parse(body)
      } catch {
        throw new AIServiceError({
          code: AIErrorCode.INVALID_RESPONSE,
          message: 'Failed to parse custom endpoint response',
          retryable: false
        })
      }

      if (!data.choices || data.choices.length === 0) {
        throw new AIServiceError({
          code: AIErrorCode.INVALID_RESPONSE,
          message: 'No choices in custom endpoint response',
          retryable: false
        })
      }

      // Handle cases where usage might not be provided
      const usage = data.usage || {
        prompt_tokens: 0,
        completion_tokens: 0,
        total_tokens: 0
      }

      return {
        content: data.choices[0].message.content,
        usage: {
          promptTokens: usage.prompt_tokens,
          completionTokens: usage.completion_tokens,
          totalTokens: usage.total_tokens
        },
        model: data.model || this.config.model
      }
    })
  }

  async validateApiKey(): Promise<boolean> {
    try {
      // Try to list models or make a simple request
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
