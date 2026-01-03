/**
 * LLM Adapter Tests
 * Feature: ai-bookmark-analysis
 * Property 2: Provider Adapter Validity
 * Property 3: Invalid API Key Error Handling
 * Validates: Requirements 1.4, 1.5
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import * as fc from 'fast-check'
import { createAdapter, OpenAIAdapter, ClaudeAdapter, CustomAdapter } from './index'
import { AIServiceError, AIErrorCode } from '../types'
import type { LLMConfig } from '../types'
import { PBT_CONFIG } from '../../test/generators'

// Mock fetch globally
const mockFetch = vi.fn()
// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(globalThis as any).fetch = mockFetch

describe('LLM Adapters', () => {
  beforeEach(() => {
    mockFetch.mockReset()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('createAdapter factory', () => {
    /**
     * Feature: ai-bookmark-analysis, Property 2: Provider Adapter Validity
     * For any supported provider type (openai, claude, custom), the LLM adapter
     * should correctly construct API requests according to that provider's specification.
     * Validates: Requirements 1.5
     */
    it('should create correct adapter type for each provider', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('openai', 'claude', 'custom') as fc.Arbitrary<'openai' | 'claude' | 'custom'>,
          (provider) => {
            const config: LLMConfig = {
              provider,
              apiKey: 'test-key',
              model: 'test-model',
              baseUrl: provider === 'custom' ? 'https://custom.api.com/v1' : undefined
            }

            const adapter = createAdapter(config)

            switch (provider) {
              case 'openai':
                expect(adapter).toBeInstanceOf(OpenAIAdapter)
                break
              case 'claude':
                expect(adapter).toBeInstanceOf(ClaudeAdapter)
                break
              case 'custom':
                expect(adapter).toBeInstanceOf(CustomAdapter)
                break
            }
          }
        ),
        { numRuns: PBT_CONFIG.numRuns }
      )
    })

    it('should throw for unknown provider', () => {
      const config = {
        provider: 'unknown' as 'openai',
        apiKey: 'test-key',
        model: 'test-model'
      }

      expect(() => createAdapter(config)).toThrow(AIServiceError)
    })
  })

  describe('OpenAI Adapter', () => {
    const createOpenAIConfig = (apiKey: string): LLMConfig => ({
      provider: 'openai',
      apiKey,
      model: 'gpt-4o-mini'
    })

    /**
     * Feature: ai-bookmark-analysis, Property 3: Invalid API Key Error Handling
     * For any API key that fails validation, the system should return an error object
     * with a descriptive message rather than throwing an unhandled exception.
     * Validates: Requirements 1.4
     */
    it('should handle 401 error with INVALID_API_KEY code', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: async () => JSON.stringify({ error: { message: 'Invalid API key' } })
      })

      const adapter = new OpenAIAdapter(createOpenAIConfig('invalid-key'))

      await expect(
        adapter.chat({
          messages: [{ role: 'user', content: 'Hello' }]
        })
      ).rejects.toMatchObject({
        code: AIErrorCode.INVALID_API_KEY,
        retryable: false
      })
    })

    it('should handle 429 rate limit error', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 429,
        text: async () => JSON.stringify({ error: { message: 'Rate limited', retry_after: 30 } })
      })

      const adapter = new OpenAIAdapter(createOpenAIConfig('test-key'))

      await expect(
        adapter.chat({
          messages: [{ role: 'user', content: 'Hello' }]
        })
      ).rejects.toMatchObject({
        code: AIErrorCode.RATE_LIMITED,
        retryable: true
      })
    })

    it('should parse successful response correctly', async () => {
      const mockResponse = {
        id: 'chatcmpl-123',
        object: 'chat.completion',
        created: 1677652288,
        model: 'gpt-4o-mini',
        choices: [{
          index: 0,
          message: { role: 'assistant', content: 'Hello! How can I help?' },
          finish_reason: 'stop'
        }],
        usage: {
          prompt_tokens: 10,
          completion_tokens: 20,
          total_tokens: 30
        }
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => JSON.stringify(mockResponse)
      })

      const adapter = new OpenAIAdapter(createOpenAIConfig('test-key'))
      const response = await adapter.chat({
        messages: [{ role: 'user', content: 'Hello' }]
      })

      expect(response.content).toBe('Hello! How can I help?')
      expect(response.usage.totalTokens).toBe(30)
      expect(response.model).toBe('gpt-4o-mini')
    })

    it('should validate API key correctly', async () => {
      // Valid key
      mockFetch.mockResolvedValueOnce({ ok: true })
      const validAdapter = new OpenAIAdapter(createOpenAIConfig('valid-key'))
      expect(await validAdapter.validateApiKey()).toBe(true)

      // Invalid key
      mockFetch.mockResolvedValueOnce({ ok: false, status: 401 })
      const invalidAdapter = new OpenAIAdapter(createOpenAIConfig('invalid-key'))
      expect(await invalidAdapter.validateApiKey()).toBe(false)
    })
  })

  describe('Claude Adapter', () => {
    const createClaudeConfig = (apiKey: string): LLMConfig => ({
      provider: 'claude',
      apiKey,
      model: 'claude-3-5-sonnet-20241022'
    })

    it('should handle 401 error with INVALID_API_KEY code', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: async () => JSON.stringify({ error: { message: 'Invalid API key' } })
      })

      const adapter = new ClaudeAdapter(createClaudeConfig('invalid-key'))

      await expect(
        adapter.chat({
          messages: [{ role: 'user', content: 'Hello' }]
        })
      ).rejects.toMatchObject({
        code: AIErrorCode.INVALID_API_KEY,
        retryable: false
      })
    })

    it('should parse successful response correctly', async () => {
      const mockResponse = {
        id: 'msg_123',
        type: 'message',
        role: 'assistant',
        content: [{ type: 'text', text: 'Hello! How can I help?' }],
        model: 'claude-3-5-sonnet-20241022',
        stop_reason: 'end_turn',
        usage: {
          input_tokens: 10,
          output_tokens: 20
        }
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => JSON.stringify(mockResponse)
      })

      const adapter = new ClaudeAdapter(createClaudeConfig('test-key'))
      const response = await adapter.chat({
        messages: [{ role: 'user', content: 'Hello' }]
      })

      expect(response.content).toBe('Hello! How can I help?')
      expect(response.usage.totalTokens).toBe(30)
      expect(response.model).toBe('claude-3-5-sonnet-20241022')
    })

    it('should handle system messages correctly', async () => {
      const mockResponse = {
        id: 'msg_123',
        type: 'message',
        role: 'assistant',
        content: [{ type: 'text', text: 'Response' }],
        model: 'claude-3-5-sonnet-20241022',
        stop_reason: 'end_turn',
        usage: { input_tokens: 10, output_tokens: 5 }
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => JSON.stringify(mockResponse)
      })

      const adapter = new ClaudeAdapter(createClaudeConfig('test-key'))
      await adapter.chat({
        messages: [
          { role: 'system', content: 'You are helpful' },
          { role: 'user', content: 'Hello' }
        ]
      })

      // Verify the request was made with system message in the correct format
      const requestBody = JSON.parse(mockFetch.mock.calls[0][1].body)
      expect(requestBody.system).toBe('You are helpful')
      expect(requestBody.messages).toHaveLength(1)
      expect(requestBody.messages[0].role).toBe('user')
    })
  })

  describe('Custom Adapter', () => {
    const createCustomConfig = (apiKey: string): LLMConfig => ({
      provider: 'custom',
      apiKey,
      model: 'local-model',
      baseUrl: 'https://custom.api.com/v1'
    })

    it('should throw if baseUrl is not provided', () => {
      expect(() => new CustomAdapter({
        provider: 'custom',
        apiKey: 'test',
        model: 'test'
      })).toThrow(AIServiceError)
    })

    it('should handle successful response', async () => {
      const mockResponse = {
        model: 'local-model',
        choices: [{
          index: 0,
          message: { role: 'assistant', content: 'Hello!' },
          finish_reason: 'stop'
        }],
        usage: {
          prompt_tokens: 5,
          completion_tokens: 10,
          total_tokens: 15
        }
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => JSON.stringify(mockResponse)
      })

      const adapter = new CustomAdapter(createCustomConfig('test-key'))
      const response = await adapter.chat({
        messages: [{ role: 'user', content: 'Hello' }]
      })

      expect(response.content).toBe('Hello!')
      expect(response.usage.totalTokens).toBe(15)
    })

    it('should handle response without usage data', async () => {
      const mockResponse = {
        model: 'local-model',
        choices: [{
          index: 0,
          message: { role: 'assistant', content: 'Hello!' }
        }]
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => JSON.stringify(mockResponse)
      })

      const adapter = new CustomAdapter(createCustomConfig('test-key'))
      const response = await adapter.chat({
        messages: [{ role: 'user', content: 'Hello' }]
      })

      expect(response.content).toBe('Hello!')
      expect(response.usage.totalTokens).toBe(0)
    })
  })

  describe('Cost Estimation', () => {
    it('should estimate cost correctly for known models', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 100000 }),
          (tokens) => {
            const adapter = new OpenAIAdapter({
              provider: 'openai',
              apiKey: 'test',
              model: 'gpt-4o-mini'
            })

            const cost = adapter.estimateCost(tokens)
            
            // Cost should be non-negative
            expect(cost).toBeGreaterThanOrEqual(0)
            
            // Cost should scale with tokens
            if (tokens > 0) {
              expect(cost).toBeGreaterThan(0)
            }
          }
        ),
        { numRuns: PBT_CONFIG.numRuns }
      )
    })

    it('should provide default cost for unknown models', () => {
      const adapter = new OpenAIAdapter({
        provider: 'openai',
        apiKey: 'test',
        model: 'unknown-model'
      })

      const cost = adapter.estimateCost(1000)
      expect(cost).toBeGreaterThan(0)
    })
  })
})
