/**
 * AI Module Type Definitions
 * Core interfaces for the retained optional BYOK configuration surface
 */

// LLM Provider Types
export interface LLMProvider {
  name: string
  models: string[]
  defaultModel: string
  baseUrl: string
}

export interface LLMConfig {
  provider: 'openai' | 'claude' | 'custom'
  apiKey: string
  model: string
  baseUrl?: string
  maxTokens?: number
  temperature?: number
}

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface LLMRequest {
  messages: LLMMessage[]
  maxTokens?: number
  temperature?: number
}

export interface LLMResponse {
  content: string
  usage: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  model: string
}

export interface LLMAdapter {
  chat(request: LLMRequest): Promise<LLMResponse>
  validateApiKey(): Promise<boolean>
  estimateCost(tokens: number): number
}

// Error Types
export enum AIErrorCode {
  INVALID_API_KEY = 'INVALID_API_KEY',
  RATE_LIMITED = 'RATE_LIMITED',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  INVALID_RESPONSE = 'INVALID_RESPONSE',
  USAGE_LIMIT_REACHED = 'USAGE_LIMIT_REACHED',
  PROVIDER_ERROR = 'PROVIDER_ERROR'
}

export interface AIError {
  code: AIErrorCode
  message: string
  retryable: boolean
  retryAfterMs?: number
}

export class AIServiceError extends Error {
  code: AIErrorCode
  retryable: boolean
  retryAfterMs?: number

  constructor(error: AIError) {
    super(error.message)
    this.name = 'AIServiceError'
    this.code = error.code
    this.retryable = error.retryable
    this.retryAfterMs = error.retryAfterMs
  }
}
