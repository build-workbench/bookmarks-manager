/**
 * Config Service Tests
 * Feature: ai-bookmark-analysis
 * Property 1: Configuration Round-Trip
 * Validates: Requirements 1.2, 1.6
 */

import { describe, it, expect, beforeEach } from 'vitest'
import * as fc from 'fast-check'
import { configService } from './configService'
import type { LLMConfig } from './types'
import { db } from '../utils/db'
import { PBT_CONFIG } from '../test/generators'

describe('Config Service', () => {
  beforeEach(async () => {
    // Clear the database before each test
    await db.aiConfig.clear()
  })

  /**
   * Feature: ai-bookmark-analysis, Property 1: Configuration Round-Trip
   * For any valid LLM configuration (provider, apiKey, model, baseUrl),
   * saving the configuration to IndexedDB and then loading it should
   * return an equivalent configuration object.
   * Validates: Requirements 1.2, 1.6
   */
  describe('Property 1: Configuration Round-Trip', () => {
    it('should save and load OpenAI config correctly', async () => {
      const configArb = fc.record({
        provider: fc.constant('openai' as const),
        apiKey: fc.string({ minLength: 10, maxLength: 100 }),
        model: fc.constantFrom('gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo'),
        maxTokens: fc.integer({ min: 100, max: 4000 }),
        temperature: fc.float({ min: 0, max: 2, noNaN: true })
      })

      await fc.assert(
        fc.asyncProperty(configArb, async (config) => {
          // Clear before each iteration
          await db.aiConfig.clear()

          // Save
          const saveResult = await configService.saveConfig(config)
          expect(saveResult.success).toBe(true)

          // Load
          const loaded = await configService.getConfig()
          expect(loaded).not.toBeNull()
          expect(loaded!.provider).toBe(config.provider)
          expect(loaded!.apiKey).toBe(config.apiKey)
          expect(loaded!.model).toBe(config.model)
          expect(loaded!.maxTokens).toBe(config.maxTokens)
          // Float comparison with tolerance
          expect(loaded!.temperature).toBeCloseTo(config.temperature, 5)
        }),
        { numRuns: PBT_CONFIG.numRuns }
      )
    })

    it('should save and load Claude config correctly', async () => {
      const configArb = fc.record({
        provider: fc.constant('claude' as const),
        apiKey: fc.string({ minLength: 10, maxLength: 100 }),
        model: fc.constantFrom('claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022'),
        maxTokens: fc.integer({ min: 100, max: 4000 }),
        temperature: fc.float({ min: 0, max: 2, noNaN: true })
      })

      await fc.assert(
        fc.asyncProperty(configArb, async (config) => {
          await db.aiConfig.clear()

          const saveResult = await configService.saveConfig(config)
          expect(saveResult.success).toBe(true)

          const loaded = await configService.getConfig()
          expect(loaded).not.toBeNull()
          expect(loaded!.provider).toBe(config.provider)
          expect(loaded!.apiKey).toBe(config.apiKey)
          expect(loaded!.model).toBe(config.model)
        }),
        { numRuns: PBT_CONFIG.numRuns }
      )
    })

    it('should save and load custom endpoint config correctly', async () => {
      const configArb = fc.record({
        provider: fc.constant('custom' as const),
        apiKey: fc.string({ minLength: 10, maxLength: 100 }),
        model: fc.string({ minLength: 1, maxLength: 50 }),
        baseUrl: fc.webUrl(),
        maxTokens: fc.integer({ min: 100, max: 4000 }),
        temperature: fc.float({ min: 0, max: 2, noNaN: true })
      })

      await fc.assert(
        fc.asyncProperty(configArb, async (config) => {
          await db.aiConfig.clear()

          const saveResult = await configService.saveConfig(config)
          expect(saveResult.success).toBe(true)

          const loaded = await configService.getConfig()
          expect(loaded).not.toBeNull()
          expect(loaded!.provider).toBe(config.provider)
          expect(loaded!.apiKey).toBe(config.apiKey)
          expect(loaded!.model).toBe(config.model)
          expect(loaded!.baseUrl).toBe(config.baseUrl)
        }),
        { numRuns: PBT_CONFIG.numRuns }
      )
    })
  })

  describe('Validation', () => {
    it('should reject config without provider', async () => {
      const config = {
        provider: '' as 'openai',
        apiKey: 'test-key',
        model: 'gpt-4o-mini'
      }

      const result = await configService.saveConfig(config)
      expect(result.success).toBe(false)
      expect(result.error).toContain('Provider')
    })

    it('should reject config without API key', async () => {
      const config: LLMConfig = {
        provider: 'openai',
        apiKey: '',
        model: 'gpt-4o-mini'
      }

      const result = await configService.saveConfig(config)
      expect(result.success).toBe(false)
      expect(result.error).toContain('API key')
    })

    it('should reject config without model', async () => {
      const config: LLMConfig = {
        provider: 'openai',
        apiKey: 'test-key',
        model: ''
      }

      const result = await configService.saveConfig(config)
      expect(result.success).toBe(false)
      expect(result.error).toContain('Model')
    })

    it('should reject custom provider without baseUrl', async () => {
      const config: LLMConfig = {
        provider: 'custom',
        apiKey: 'test-key',
        model: 'local-model'
      }

      const result = await configService.saveConfig(config)
      expect(result.success).toBe(false)
      expect(result.error).toContain('Base URL')
    })
  })

  describe('isConfigured', () => {
    it('should return false when no config exists', async () => {
      const result = await configService.isConfigured()
      expect(result).toBe(false)
    })

    it('should return true when valid config exists', async () => {
      await configService.saveConfig({
        provider: 'openai',
        apiKey: 'test-key-12345',
        model: 'gpt-4o-mini'
      })

      const result = await configService.isConfigured()
      expect(result).toBe(true)
    })
  })

  describe('getModelsForProvider', () => {
    it('should return models for OpenAI', () => {
      const models = configService.getModelsForProvider('openai')
      expect(models).toContain('gpt-4o')
      expect(models).toContain('gpt-4o-mini')
    })

    it('should return models for Claude', () => {
      const models = configService.getModelsForProvider('claude')
      expect(models).toContain('claude-3-5-sonnet-20241022')
    })

    it('should return empty array for custom', () => {
      const models = configService.getModelsForProvider('custom')
      expect(models).toEqual([])
    })
  })

  describe('clearConfig', () => {
    it('should clear the configuration', async () => {
      // First save a config
      await configService.saveConfig({
        provider: 'openai',
        apiKey: 'test-key-12345',
        model: 'gpt-4o-mini'
      })

      // Verify it's saved
      expect(await configService.isConfigured()).toBe(true)

      // Clear it
      await configService.clearConfig()

      // Verify it's cleared
      expect(await configService.isConfigured()).toBe(false)
    })
  })
})
