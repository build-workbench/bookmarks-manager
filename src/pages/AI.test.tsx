import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import AI from '@/pages/AI'

vi.mock('@/ui/AISettings', () => ({
  AISettings: () => <div>AI Settings Panel</div>
}))

vi.mock('@/store/useBookmarksStore', () => ({
  default: () => ({
    mergedItems: [],
    stats: null
  })
}))

vi.mock('@/store/useAIStore', () => ({
  useAIStore: () => ({
    isConfigured: false,
    connectionStatus: 'idle',
    connectionError: null,
    isProcessing: false,
    currentOperation: null,
    progress: null,
    categorySuggestions: new Map(),
    summaries: new Map(),
    healthIssues: [],
    latestReport: null,
    lastSearchResult: null,
    usageStats: null,
    loadConfig: vi.fn(),
    testConnection: vi.fn(),
    categorizeBookmarks: vi.fn(),
    summarizeBookmarks: vi.fn(),
    analyzeHealth: vi.fn(),
    searchWithAI: vi.fn(),
    generateReport: vi.fn(),
    dismissHealthIssue: vi.fn(),
    refreshUsageStats: vi.fn(),
    clearCache: vi.fn()
  })
}))

describe('AI page after closure hardening', () => {
  it('keeps only the configuration surface', () => {
    render(<AI />)

    expect(screen.getByText('AI Settings Panel')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '分类' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '摘要' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '健康检查' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'AI 搜索' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '报告' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '用量' })).not.toBeInTheDocument()
  })
})
