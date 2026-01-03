/**
 * OpenAI LLM Adapter
 * Implements the LLM adapter interface for OpenAI API
 */

import type { LLMConfig, LLMRequest, LLMResponse } from '../types'
import { AIServiceError, AIErrorCode } from '../types'
import { LLM_PROVIDERS, DEFAULT_MAX_TOKENS, DEFAULT_TEMPERATURE } from '../constants'
import { BaseLLMAdapter } from './base'

interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface OpenAIChatRequest {
  model: string
  messages: OpenAIMessage[]
  max_tokens?: number
  temperature?: number
}

interface OpenAIChatResponse {
  id: string
  object: string
  created: number
  model: string
  choices: Array<{
    index: number
    message: {
      role: string
      content: string
    }
    finish_reason: string
  }>
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export class OpenAIAdapter extends BaseLLMAdapter {
  private baseUrl: string

  constructor(config: LLMConfig) {
    super(config)
    this.baseUrl = config.baseUrl || LLM_PROVIDERS.openai.baseUrl
  }

  async chat(request: LLMRequest): Promise<LLMResponse> {
    return this.withRetry(async () => {
      const openaiRequest: OpenAIChatRequest = {
        model: this.config.model,
        messages: request.messages.map(m => ({
          role: m.role,
          content: m.content
        })),
        max_tokens: request.maxTokens ?? this.config.maxTokens ?? DEFAULT_MAX_TOKENS,
        temperature: request.temperature ?? this.config.temperature ?? DEFAULT_TEMPERATURE
      }

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify(openaiRequest)
      })

      const body = await response.text()

      if (!response.ok) {
        this.handleHttpError(response.status, body)
      }

      let data: OpenAIChatResponse
      try {
        data = JSON.parse(body)
      } catch {
        throw new AIServiceError({
          code: AIErrorCode.INVALID_RESPONSE,
          message: 'Failed to parse OpenAI response',
          retryable: false
        })
      }

      if (!data.choices || data.choices.length === 0) {
        throw new AIServiceError({
          code: AIErrorCode.INVALID_RESPONSE,
          message: 'No choices in OpenAI response',
          retryable: false
        })
      }

      return {
        content: data.choices[0].message.content,
        usage: {
          promptTokens: data.usage.prompt_tokens,
          completionTokens: data.usage.completion_tokens,
          totalTokens: data.usage.total_tokens
        },
        model: data.model
      }
    })
  }

  async validateApiKey(): Promise<boolean> {
    try {
      // Make a minimal request to validate the API key
      const response = await fetch(`${this.baseUrl}/models`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`
        }
      })

      return response.ok
    } catch {
      return false
    }
  }
}
