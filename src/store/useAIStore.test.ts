import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createAdapter } from '@/ai/adapters'
import { configService } from '@/ai/configService'
import type { LLMConfig } from '@/ai/types'
import { useAIStore } from './useAIStore'

vi.mock('@/ai/configService', () => ({
  configService: {
    getConfig: vi.fn(),
    saveConfig: vi.fn()
  }
}))

vi.mock('@/ai/adapters', () => ({
  createAdapter: vi.fn()
}))

describe('useAIStore', () => {
  beforeEach(() => {
    useAIStore.setState({ config: null, connectionStatus: 'idle', connectionError: null })
    vi.clearAllMocks()
  })

  it('loads config successfully', async () => {
    const mockConfig: LLMConfig = {
      provider: 'openai',
      apiKey: 'test-key',
      model: 'gpt-4o-mini'
    }

    vi.mocked(configService.getConfig).mockResolvedValue(mockConfig)

    await useAIStore.getState().loadConfig()

    const state = useAIStore.getState()
    expect(state.config).toEqual(mockConfig)
  })

  it('saves config through the store seam and updates local state', async () => {
    const mockConfig: LLMConfig = {
      provider: 'openai',
      apiKey: 'saved-key',
      model: 'gpt-4o-mini'
    }

    vi.mocked(configService.saveConfig).mockResolvedValue({ success: true })

    await expect(useAIStore.getState().saveConfig(mockConfig)).resolves.toEqual({ success: true })

    expect(configService.saveConfig).toHaveBeenCalledWith(mockConfig)
    expect(useAIStore.getState().config).toEqual(mockConfig)
  })

  it('tests connection with the configured adapter', async () => {
    const mockConfig: LLMConfig = {
      provider: 'openai',
      apiKey: 'test-key',
      model: 'gpt-4o-mini'
    }
    const validateApiKey = vi.fn().mockResolvedValue(true)
    const chat = vi.fn()
    const estimateCost = vi.fn().mockReturnValue(0)

    vi.mocked(createAdapter).mockReturnValue({
      chat,
      validateApiKey,
      estimateCost
    })

    await expect(useAIStore.getState().testConnection(mockConfig)).resolves.toBe(true)

    expect(validateApiKey).toHaveBeenCalledOnce()
    expect(useAIStore.getState().connectionStatus).toBe('connected')
    expect(useAIStore.getState().config).toEqual(mockConfig)
  })

  it('sets an error when connection test fails', async () => {
    const mockConfig: LLMConfig = {
      provider: 'openai',
      apiKey: 'invalid-key',
      model: 'gpt-4o-mini'
    }
    const validateApiKey = vi.fn().mockResolvedValue(false)
    const chat = vi.fn()
    const estimateCost = vi.fn().mockReturnValue(0)

    vi.mocked(createAdapter).mockReturnValue({
      chat,
      validateApiKey,
      estimateCost
    })

    await expect(useAIStore.getState().testConnection(mockConfig)).resolves.toBe(false)

    const state = useAIStore.getState()
    expect(state.connectionStatus).toBe('error')
    expect(state.connectionError).toBe('API Key 无效')
  })

  it('handles connection test exceptions', async () => {
    const mockConfig: LLMConfig = {
      provider: 'openai',
      apiKey: 'test-key',
      model: 'gpt-4o-mini'
    }

    vi.mocked(createAdapter).mockImplementation(() => {
      throw new Error('Network error')
    })

    await expect(useAIStore.getState().testConnection(mockConfig)).resolves.toBe(false)

    const state = useAIStore.getState()
    expect(state.connectionStatus).toBe('error')
    expect(state.connectionError).toBe('Network error')
  })

  it('does not expose retired AI analysis operations', () => {
    const state = useAIStore.getState()

    expect('categorizeBookmarks' in state).toBe(false)
    expect('summarizeBookmarks' in state).toBe(false)
    expect('analyzeDuplicates' in state).toBe(false)
    expect('analyzeHealth' in state).toBe(false)
    expect('searchWithAI' in state).toBe(false)
    expect('generateReport' in state).toBe(false)
    expect('refreshUsageStats' in state).toBe(false)
    expect('setUsageLimits' in state).toBe(false)
    expect('clearCache' in state).toBe(false)
    expect('usageStats' in state).toBe(false)
    expect('usageLimits' in state).toBe(false)
  })
})
