/**
 * AI Module Type Definitions
 * Core interfaces for LLM integration and AI analysis features
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

// AI Analysis Types
export interface CategorySuggestion {
  bookmarkId: string
  suggestedCategory: string
  confidence: number
  reasoning: string
}

export interface BookmarkSummary {
  bookmarkId: string
  summary: string
  keywords: string[]
  generatedAt: number
}

export interface DuplicateRecommendation {
  groupId: string
  keepBookmarkId: string
  reasoning: string
  factors: string[]
}

export interface HealthIssue {
  bookmarkId: string
  issueType: 'outdated' | 'low_value' | 'broken_pattern' | 'redundant'
  description: string
  suggestion: string
  dismissed: boolean
}

export interface CollectionReport {
  generatedAt: number
  totalBookmarks: number
  categoryDistribution: Record<string, number>
  domainPatterns: Array<{ domain: string; count: number }>
  timelineTrends: Array<{ period: string; count: number }>
  recommendations: string[]
  insights: string[]
}

// Prompt Template Types
export interface PromptTemplate {
  id: string
  name: string
  description: string
  template: string
  variables: string[]
  isDefault: boolean
  createdAt: number
  updatedAt: number
}

// Cache Types
export interface CacheEntry<T> {
  key: string
  value: T
  createdAt: number
  expiresAt: number
  bookmarkHash: string
}

// Usage Types
export interface UsageRecord {
  id?: string
  timestamp: number
  operation: string
  promptTokens: number
  completionTokens: number
  totalTokens: number
  estimatedCost: number
  model: string
}

export interface UsageStats {
  totalTokens: number
  totalCost: number
  operationBreakdown: Record<string, { tokens: number; cost: number }>
  dailyUsage: Array<{ date: string; tokens: number; cost: number }>
}

export interface UsageLimits {
  dailyTokenLimit?: number
  monthlyTokenLimit?: number
  dailyCostLimit?: number
  monthlyCostLimit?: number
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

// Natural Language Search Types
export interface QueryInterpretation {
  matchedIds: string[]
  interpretation: string
  suggestions?: string[]
}
