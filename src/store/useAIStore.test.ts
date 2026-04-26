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
    useAIStore.getState().reset()
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
    expect(state.isConfigured).toBe(true)
  })

  it('saves config and updates state', async () => {
    const mockConfig: LLMConfig = {
      provider: 'claude',
      apiKey: 'new-key',
      model: 'claude-3-5-sonnet-20241022'
    }

    vi.mocked(configService.saveConfig).mockResolvedValue({ success: true })

    await useAIStore.getState().saveConfig(mockConfig)

    const state = useAIStore.getState()
    expect(state.config).toEqual(mockConfig)
    expect(state.isConfigured).toBe(true)
    expect(state.connectionStatus).toBe('idle')
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

    useAIStore.setState({
      config: mockConfig,
      isConfigured: true
    })
    vi.mocked(createAdapter).mockReturnValue({
      chat,
      validateApiKey,
      estimateCost
    })

    await expect(useAIStore.getState().testConnection()).resolves.toBe(true)

    expect(validateApiKey).toHaveBeenCalledOnce()
    expect(useAIStore.getState().connectionStatus).toBe('connected')
  })

  it('sets an error when testing connection without config', async () => {
    await expect(useAIStore.getState().testConnection()).resolves.toBe(false)

    const state = useAIStore.getState()
    expect(state.connectionStatus).toBe('error')
    expect(state.connectionError).toBe('未配置 API')
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

  it('resets the configuration surface to initial values', () => {
    useAIStore.setState({
      config: { provider: 'openai', apiKey: 'test', model: 'gpt-4o-mini' },
      isConfigured: true,
      connectionStatus: 'connected',
      connectionError: 'error'
    })

    useAIStore.getState().reset()

    const state = useAIStore.getState()
    expect(state.config).toBeNull()
    expect(state.isConfigured).toBe(false)
    expect(state.connectionStatus).toBe('idle')
    expect(state.connectionError).toBeNull()
  })
})
