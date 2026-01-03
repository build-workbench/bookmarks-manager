/**
 * AI Configuration Service
 * Manages AI configuration storage and retrieval
 */

import type { LLMConfig } from './types'
import { getAIConfig, saveAIConfig, type AIConfig } from '../utils/db'
import { LLM_PROVIDERS, DEFAULT_MAX_TOKENS, DEFAULT_TEMPERATURE } from './constants'
import { createAdapter } from './adapters'

export interface ConfigServiceResult {
  success: boolean
  error?: string
}

/**
 * Get the current AI configuration
 */
export async function getConfig(): Promise<LLMConfig | null> {
  const stored = await getAIConfig()
  if (!stored) {
    return null
  }

  return {
    provider: stored.provider,
    apiKey: stored.apiKey,
    model: stored.model,
    baseUrl: stored.baseUrl,
    maxTokens: stored.maxTokens,
    temperature: stored.temperature
  }
}

/**
 * Save AI configuration
 */
export async function saveConfig(config: LLMConfig): Promise<ConfigServiceResult> {
  try {
    // Validate required fields
    if (!config.provider) {
      return { success: false, error: 'Provider is required' }
    }
    if (!config.apiKey) {
      return { success: false, error: 'API key is required' }
    }
    if (!config.model) {
      return { success: false, error: 'Model is required' }
    }
    if (config.provider === 'custom' && !config.baseUrl) {
      return { success: false, error: 'Base URL is required for custom provider' }
    }

    await saveAIConfig({
      provider: config.provider,
      apiKey: config.apiKey,
      model: config.model,
      baseUrl: config.baseUrl,
      maxTokens: config.maxTokens ?? DEFAULT_MAX_TOKENS,
      temperature: config.temperature ?? DEFAULT_TEMPERATURE
    })

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save configuration'
    }
  }
}

/**
 * Test the API connection with current configuration
 */
export async function testConnection(config: LLMConfig): Promise<ConfigServiceResult> {
  try {
    const adapter = createAdapter(config)
    const isValid = await adapter.validateApiKey()

    if (isValid) {
      return { success: true }
    } else {
      return { success: false, error: 'API key validation failed' }
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Connection test failed'
    }
  }
}

/**
 * Check if AI is configured
 */
export async function isConfigured(): Promise<boolean> {
  const config = await getConfig()
  return config !== null && !!config.apiKey
}

/**
 * Get available models for a provider
 */
export function getModelsForProvider(provider: 'openai' | 'claude' | 'custom'): string[] {
  const providerInfo = LLM_PROVIDERS[provider]
  return providerInfo?.models ?? []
}

/**
 * Get default model for a provider
 */
export function getDefaultModel(provider: 'openai' | 'claude' | 'custom'): string {
  const providerInfo = LLM_PROVIDERS[provider]
  return providerInfo?.defaultModel ?? ''
}

/**
 * Clear AI configuration
 */
export async function clearConfig(): Promise<void> {
  // Save empty config to clear
  await saveAIConfig({
    provider: 'openai',
    apiKey: '',
    model: '',
    maxTokens: DEFAULT_MAX_TOKENS,
    temperature: DEFAULT_TEMPERATURE
  })
}

// Export as a service object for convenience
export const configService = {
  getConfig,
  saveConfig,
  testConnection,
  isConfigured,
  getModelsForProvider,
  getDefaultModel,
  clearConfig
}
