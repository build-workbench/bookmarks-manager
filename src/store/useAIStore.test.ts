import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useAIStore } from './useAIStore'
import { configService } from '@/ai/configService'
import { usageService } from '@/ai/usageService'
import { cacheService } from '@/ai/cacheService'
import type { LLMConfig, UsageStats, UsageLimits } from '@/ai/types'

// Mock services
vi.mock('@/ai/configService', () => ({
  configService: {
    getConfig: vi.fn(),
    saveConfig: vi.fn(),
  },
}))

vi.mock('@/ai/usageService', () => ({
  usageService: {
    getStats: vi.fn(),
    getLimits: vi.fn(),
    setLimits: vi.fn(),
  },
}))

vi.mock('@/ai/cacheService', () => ({
  cacheService: {
    clearAll: vi.fn(),
  },
}))

vi.mock('@/ai/aiService', () => ({
  aiService: {
    categorizeBookmarks: vi.fn(),
    summarizeBookmarks: vi.fn(),
    analyzeDuplicates: vi.fn(),
    analyzeHealth: vi.fn(),
    interpretQuery: vi.fn(),
    generateReport: vi.fn(),
  },
}))

vi.mock('@/ai/adapters', () => ({
  createAdapter: vi.fn(),
}))

describe('useAIStore', () => {
  beforeEach(() => {
    // Reset store state
    useAIStore.getState().reset()
    vi.clearAllMocks()
  })

  describe('loadConfig', () => {
    it('loads config and limits successfully', async () => {
      const mockConfig: LLMConfig = {
        provider: 'openai',
        apiKey: 'test-key',
        model: 'gpt-4',
      }
      const mockLimits: UsageLimits = { dailyTokenLimit: 100000 }

      vi.mocked(configService.getConfig).mockResolvedValue(mockConfig)
      vi.mocked(usageService.getLimits).mockResolvedValue(mockLimits)

      await useAIStore.getState().loadConfig()

      const state = useAIStore.getState()
      expect(state.config).toEqual(mockConfig)
      expect(state.isConfigured).toBe(true)
      expect(state.usageLimits).toEqual(mockLimits)
    })

    it('handles no config gracefully', async () => {
      vi.mocked(configService.getConfig).mockResolvedValue(null)
      vi.mocked(usageService.getLimits).mockResolvedValue({})

      await useAIStore.getState().loadConfig()

      const state = useAIStore.getState()
      expect(state.config).toBeNull()
      expect(state.isConfigured).toBe(false)
    })
  })

  describe('saveConfig', () => {
    it('saves config and updates state', async () => {
      const mockConfig: LLMConfig = {
        provider: 'openai',
        apiKey: 'new-key',
        model: 'gpt-4',
      }

      vi.mocked(configService.saveConfig).mockResolvedValue({ success: true })

      await useAIStore.getState().saveConfig(mockConfig)

      const state = useAIStore.getState()
      expect(state.config).toEqual(mockConfig)
      expect(state.isConfigured).toBe(true)
      expect(state.connectionStatus).toBe('idle')
    })
  })

  describe('refreshUsageStats', () => {
    it('loads usage stats', async () => {
      const mockStats: UsageStats = {
        totalTokens: 5000,
        totalCost: 0.5,
        operationBreakdown: {},
        dailyUsage: [],
      }

      vi.mocked(usageService.getStats).mockResolvedValue(mockStats)

      await useAIStore.getState().refreshUsageStats()

      const state = useAIStore.getState()
      expect(state.usageStats).toEqual(mockStats)
    })
  })

  describe('setUsageLimits', () => {
    it('sets usage limits', async () => {
      const mockLimits: UsageLimits = { dailyTokenLimit: 50000, monthlyCostLimit: 10 }

      vi.mocked(usageService.setLimits).mockResolvedValue(undefined)

      await useAIStore.getState().setUsageLimits(mockLimits)

      const state = useAIStore.getState()
      expect(state.usageLimits).toEqual(mockLimits)
    })
  })

  describe('clearCache', () => {
    it('clears cache and resets analysis results', async () => {
      // Set some initial state
      useAIStore.setState({
        categorySuggestions: new Map([['1', { bookmarkId: '1', suggestedCategory: 'test', confidence: 90, reasoning: 'test' }]]),
        summaries: new Map([['2', { bookmarkId: '2', summary: 'test', keywords: [], generatedAt: Date.now() }]]),
        healthIssues: [{ bookmarkId: '3', issueType: 'outdated', description: 'test', suggestion: 'test', dismissed: false }],
      })

      vi.mocked(cacheService.clearAll).mockResolvedValue(undefined)

      await useAIStore.getState().clearCache()

      const state = useAIStore.getState()
      expect(state.categorySuggestions.size).toBe(0)
      expect(state.summaries.size).toBe(0)
      expect(state.healthIssues).toHaveLength(0)
    })
  })

  describe('dismissHealthIssue', () => {
    it('marks health issue as dismissed', () => {
      useAIStore.setState({
        healthIssues: [
          { bookmarkId: '1', issueType: 'outdated', description: 'test', suggestion: 'test', dismissed: false },
          { bookmarkId: '2', issueType: 'redundant', description: 'test2', suggestion: 'test', dismissed: false },
        ],
      })

      useAIStore.getState().dismissHealthIssue('1')

      const state = useAIStore.getState()
      expect(state.healthIssues[0].dismissed).toBe(true)
      expect(state.healthIssues[1].dismissed).toBe(false)
    })
  })

  describe('acceptCategorySuggestion', () => {
    it('removes accepted suggestion from map', () => {
      useAIStore.setState({
        categorySuggestions: new Map([
          ['1', { bookmarkId: '1', suggestedCategory: 'work', confidence: 90, reasoning: 'test' }],
          ['2', { bookmarkId: '2', suggestedCategory: 'personal', confidence: 80, reasoning: 'test' }],
        ]),
      })

      useAIStore.getState().acceptCategorySuggestion('1')

      const state = useAIStore.getState()
      expect(state.categorySuggestions.has('1')).toBe(false)
      expect(state.categorySuggestions.has('2')).toBe(true)
    })
  })

  describe('reset', () => {
    it('resets all state to initial values', () => {
      // Set some state
      useAIStore.setState({
        config: { provider: 'openai', apiKey: 'test', model: 'gpt-4' },
        isConfigured: true,
        connectionStatus: 'connected',
        isProcessing: true,
        currentOperation: 'test',
      })

      useAIStore.getState().reset()

      const state = useAIStore.getState()
      expect(state.config).toBeNull()
      expect(state.isConfigured).toBe(false)
      expect(state.connectionStatus).toBe('idle')
      expect(state.isProcessing).toBe(false)
      expect(state.currentOperation).toBeNull()
    })
  })
})
