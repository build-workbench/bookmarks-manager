/**
 * AI Store - Global state management for AI features
 */

import { create } from 'zustand'
import type {
  LLMConfig,
  CategorySuggestion,
  BookmarkSummary,
  DuplicateRecommendation,
  HealthIssue,
  CollectionReport,
  QueryInterpretation,
  UsageStats,
  UsageLimits
} from '../ai/types'
import { configService } from '../ai/configService'
import { aiService } from '../ai/aiService'
import { usageService } from '../ai/usageService'
import { cacheService } from '../ai/cacheService'
import { createAdapter } from '../ai/adapters'
import type { Bookmark } from '../utils/bookmarkParser'

interface AIState {
  // Configuration
  config: LLMConfig | null
  isConfigured: boolean

  // Connection status
  connectionStatus: 'idle' | 'testing' | 'connected' | 'error'
  connectionError: string | null

  // Operation status
  isProcessing: boolean
  currentOperation: string | null
  progress: { current: number; total: number } | null

  // Analysis results
  categorySuggestions: Map<string, CategorySuggestion>
  summaries: Map<string, BookmarkSummary>
  duplicateRecommendations: DuplicateRecommendation[]
  healthIssues: HealthIssue[]
  latestReport: CollectionReport | null
  lastSearchResult: QueryInterpretation | null

  // Usage
  usageStats: UsageStats | null
  usageLimits: UsageLimits

  // Actions
  loadConfig: () => Promise<void>
  saveConfig: (config: LLMConfig) => Promise<void>
  testConnection: () => Promise<boolean>

  categorizeBookmarks: (bookmarks: Bookmark[], forceRefresh?: boolean) => Promise<void>
  summarizeBookmarks: (bookmarks: Bookmark[], forceRefresh?: boolean) => Promise<void>
  analyzeDuplicates: (groups: Bookmark[][], forceRefresh?: boolean) => Promise<void>
  analyzeHealth: (bookmarks: Bookmark[], forceRefresh?: boolean) => Promise<void>
  searchWithAI: (query: string, bookmarks: Bookmark[]) => Promise<string[]>
  generateReport: (bookmarks: Bookmark[], stats: {
    domainStats: Record<string, number>
    yearStats: Record<string, number>
    folderStats: Record<string, number>
  }) => Promise<void>

  dismissHealthIssue: (bookmarkId: string) => void
  acceptCategorySuggestion: (bookmarkId: string) => void
  acceptDuplicateRecommendation: (groupId: string) => void

  refreshUsageStats: () => Promise<void>
  setUsageLimits: (limits: UsageLimits) => Promise<void>
  clearCache: () => Promise<void>

  reset: () => void
}


const initialState = {
  config: null,
  isConfigured: false,
  connectionStatus: 'idle' as const,
  connectionError: null,
  isProcessing: false,
  currentOperation: null,
  progress: null,
  categorySuggestions: new Map<string, CategorySuggestion>(),
  summaries: new Map<string, BookmarkSummary>(),
  duplicateRecommendations: [],
  healthIssues: [],
  latestReport: null,
  lastSearchResult: null,
  usageStats: null,
  usageLimits: {}
}

export const useAIStore = create<AIState>((set, get) => ({
  ...initialState,

  loadConfig: async () => {
    try {
      const config = await configService.loadConfig()
      const limits = await usageService.getLimits()
      set({
        config,
        isConfigured: config !== null,
        usageLimits: limits
      })
    } catch (error) {
      console.error('Failed to load AI config:', error)
    }
  },

  saveConfig: async (config: LLMConfig) => {
    try {
      await configService.saveConfig(config)
      set({
        config,
        isConfigured: true,
        connectionStatus: 'idle',
        connectionError: null
      })
    } catch (error) {
      console.error('Failed to save AI config:', error)
      throw error
    }
  },

  testConnection: async () => {
    const { config } = get()
    if (!config) {
      set({ connectionStatus: 'error', connectionError: '未配置 API' })
      return false
    }

    set({ connectionStatus: 'testing', connectionError: null })

    try {
      const adapter = createAdapter(config)
      const isValid = await adapter.validateApiKey()

      if (isValid) {
        set({ connectionStatus: 'connected', connectionError: null })
        return true
      } else {
        set({ connectionStatus: 'error', connectionError: 'API Key 无效' })
        return false
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : '连接测试失败'
      set({ connectionStatus: 'error', connectionError: message })
      return false
    }
  },

  categorizeBookmarks: async (bookmarks: Bookmark[], forceRefresh = false) => {
    const { config } = get()
    if (!config) throw new Error('AI not configured')

    set({
      isProcessing: true,
      currentOperation: '分类书签',
      progress: { current: 0, total: bookmarks.length }
    })

    try {
      const suggestions = await aiService.categorizeBookmarks(config, bookmarks, {
        forceRefresh,
        onProgress: (current, total) => set({ progress: { current, total } })
      })

      const suggestionsMap = new Map(get().categorySuggestions)
      for (const suggestion of suggestions) {
        suggestionsMap.set(suggestion.bookmarkId, suggestion)
      }

      set({ categorySuggestions: suggestionsMap })
    } finally {
      set({ isProcessing: false, currentOperation: null, progress: null })
    }
  },

  summarizeBookmarks: async (bookmarks: Bookmark[], forceRefresh = false) => {
    const { config } = get()
    if (!config) throw new Error('AI not configured')

    set({
      isProcessing: true,
      currentOperation: '生成摘要',
      progress: { current: 0, total: bookmarks.length }
    })

    try {
      const summaryList = await aiService.summarizeBookmarks(config, bookmarks, {
        forceRefresh,
        onProgress: (current, total) => set({ progress: { current, total } })
      })

      const summariesMap = new Map(get().summaries)
      for (const summary of summaryList) {
        summariesMap.set(summary.bookmarkId, summary)
      }

      set({ summaries: summariesMap })
    } finally {
      set({ isProcessing: false, currentOperation: null, progress: null })
    }
  },

  analyzeDuplicates: async (groups: Bookmark[][], forceRefresh = false) => {
    const { config } = get()
    if (!config) throw new Error('AI not configured')

    set({
      isProcessing: true,
      currentOperation: '分析重复',
      progress: { current: 0, total: groups.length }
    })

    try {
      const recommendations = await aiService.analyzeDuplicates(config, groups, {
        forceRefresh,
        onProgress: (current, total) => set({ progress: { current, total } })
      })

      set({ duplicateRecommendations: recommendations })
    } finally {
      set({ isProcessing: false, currentOperation: null, progress: null })
    }
  },

  analyzeHealth: async (bookmarks: Bookmark[], forceRefresh = false) => {
    const { config } = get()
    if (!config) throw new Error('AI not configured')

    set({
      isProcessing: true,
      currentOperation: '健康检查',
      progress: { current: 0, total: bookmarks.length }
    })

    try {
      const issues = await aiService.analyzeHealth(config, bookmarks, {
        forceRefresh,
        onProgress: (current, total) => set({ progress: { current, total } })
      })

      // Preserve dismissed state
      const existingDismissed = new Set(
        get().healthIssues.filter(i => i.dismissed).map(i => i.bookmarkId)
      )

      const updatedIssues = issues.map(issue => ({
        ...issue,
        dismissed: existingDismissed.has(issue.bookmarkId)
      }))

      set({ healthIssues: updatedIssues })
    } finally {
      set({ isProcessing: false, currentOperation: null, progress: null })
    }
  },

  searchWithAI: async (query: string, bookmarks: Bookmark[]) => {
    const { config } = get()
    if (!config) throw new Error('AI not configured')

    set({
      isProcessing: true,
      currentOperation: 'AI 搜索'
    })

    try {
      const result = await aiService.interpretQuery(config, query, bookmarks)
      set({ lastSearchResult: result })
      return result.matchedIds
    } finally {
      set({ isProcessing: false, currentOperation: null })
    }
  },

  generateReport: async (bookmarks, stats) => {
    const { config } = get()
    if (!config) throw new Error('AI not configured')

    set({
      isProcessing: true,
      currentOperation: '生成报告'
    })

    try {
      const report = await aiService.generateReport(config, bookmarks, stats)
      set({ latestReport: report })
    } finally {
      set({ isProcessing: false, currentOperation: null })
    }
  },

  dismissHealthIssue: (bookmarkId: string) => {
    const issues = get().healthIssues.map(issue =>
      issue.bookmarkId === bookmarkId ? { ...issue, dismissed: true } : issue
    )
    set({ healthIssues: issues })
  },

  acceptCategorySuggestion: (bookmarkId: string) => {
    // This would typically update the bookmark's category
    // For now, just remove from suggestions
    const suggestions = new Map(get().categorySuggestions)
    suggestions.delete(bookmarkId)
    set({ categorySuggestions: suggestions })
  },

  acceptDuplicateRecommendation: (groupId: string) => {
    const recommendations = get().duplicateRecommendations.filter(
      r => r.groupId !== groupId
    )
    set({ duplicateRecommendations: recommendations })
  },

  refreshUsageStats: async () => {
    try {
      const stats = await usageService.getStats()
      set({ usageStats: stats })
    } catch (error) {
      console.error('Failed to refresh usage stats:', error)
    }
  },

  setUsageLimits: async (limits: UsageLimits) => {
    await usageService.setLimits(limits)
    set({ usageLimits: limits })
  },

  clearCache: async () => {
    await cacheService.clearAll()
    set({
      categorySuggestions: new Map(),
      summaries: new Map(),
      duplicateRecommendations: [],
      healthIssues: [],
      latestReport: null,
      lastSearchResult: null
    })
  },

  reset: () => {
    set(initialState)
  }
}))
