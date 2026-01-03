/**
 * Claude (Anthropic) LLM Adapter
 * Implements the LLM adapter interface for Anthropic Claude API
 */

import type { LLMConfig, LLMRequest, LLMResponse } from '../types'
import { AIServiceError, AIErrorCode } from '../types'
import { LLM_PROVIDERS, DEFAULT_MAX_TOKENS, DEFAULT_TEMPERATURE } from '../constants'
import { BaseLLMAdapter } from './base'

interface ClaudeMessage {
  role: 'user' | 'assistant'
  content: string
}

interface ClaudeChatRequest {
  model: string
  max_tokens: number
  messages: ClaudeMessage[]
  system?: string
  temperature?: number
}

interface ClaudeChatResponse {
  id: string
  type: string
  role: string
  content: Array<{
    type: string
    text: string
  }>
  model: string
  stop_reason: string
  usage: {
    input_tokens: number
    output_tokens: number
  }
}

export class ClaudeAdapter extends BaseLLMAdapter {
  private baseUrl: string
  private apiVersion = '2023-06-01'

  constructor(config: LLMConfig) {
    super(config)
    this.baseUrl = config.baseUrl || LLM_PROVIDERS.claude.baseUrl
  }

  async chat(request: LLMRequest): Promise<LLMResponse> {
    return this.withRetry(async () => {
      // Extract system message if present
      let systemMessage: string | undefined
      const messages: ClaudeMessage[] = []

      for (const msg of request.messages) {
        if (msg.role === 'system') {
          systemMessage = msg.content
        } else {
          messages.push({
            role: msg.role as 'user' | 'assistant',
            content: msg.content
          })
        }
      }

      const claudeRequest: ClaudeChatRequest = {
        model: this.config.model,
        max_tokens: request.maxTokens ?? this.config.maxTokens ?? DEFAULT_MAX_TOKENS,
        messages,
        temperature: request.temperature ?? this.config.temperature ?? DEFAULT_TEMPERATURE
      }

      if (systemMessage) {
        claudeRequest.system = systemMessage
      }

      const response = await fetch(`${this.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.config.apiKey,
          'anthropic-version': this.apiVersion
        },
        body: JSON.stringify(claudeRequest)
      })

      const body = await response.text()

      if (!response.ok) {
        this.handleHttpError(response.status, body)
      }

      let data: ClaudeChatResponse
      try {
        data = JSON.parse(body)
      } catch {
        throw new AIServiceError({
          code: AIErrorCode.INVALID_RESPONSE,
          message: 'Failed to parse Claude response',
          retryable: false
        })
      }

      if (!data.content || data.content.length === 0) {
        throw new AIServiceError({
          code: AIErrorCode.INVALID_RESPONSE,
          message: 'No content in Claude response',
          retryable: false
        })
      }

      // Extract text content
      const textContent = data.content
        .filter(c => c.type === 'text')
        .map(c => c.text)
        .join('')

      return {
        content: textContent,
        usage: {
          promptTokens: data.usage.input_tokens,
          completionTokens: data.usage.output_tokens,
          totalTokens: data.usage.input_tokens + data.usage.output_tokens
        },
        model: data.model
      }
    })
  }

  async validateApiKey(): Promise<boolean> {
    try {
      // Make a minimal request to validate the API key
      // Claude doesn't have a simple models endpoint, so we make a minimal chat request
      const response = await fetch(`${this.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.config.apiKey,
          'anthropic-version': this.apiVersion
        },
        body: JSON.stringify({
          model: this.config.model || LLM_PROVIDERS.claude.defaultModel,
          max_tokens: 1,
          messages: [{ role: 'user', content: 'Hi' }]
        })
      })

      // 401 means invalid key, other errors might be rate limits etc.
      return response.status !== 401
    } catch {
      return false
    }
  }
}
