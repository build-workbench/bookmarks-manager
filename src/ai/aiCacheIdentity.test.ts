import { describe, it, expect, beforeEach, vi } from 'vitest'
import { db } from '@/utils/db'
import type { LLMConfig } from './types'
import type { Bookmark } from '@/utils/bookmarkParser'

const importActualLlmHelpers = () => vi.importActual('./llmHelpers')

const mockGetTemplate = vi.fn()
const mockCallLLM = vi.fn()

vi.mock('./promptService', () => ({
  promptService: {
    getTemplate: mockGetTemplate
  },
  renderPrompt: (template: string, vars: Record<string, string>) => {
    return Object.entries(vars).reduce((acc, [key, value]) => acc.replace(`{{${key}}}`, value), template)
  }
}))

vi.mock('./llmHelpers', async () => {
  const actual = await importActualLlmHelpers()
  return {
    ...actual,
    callLLM: mockCallLLM
  }
})

describe('AI cache identity', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    await db.aiCache.clear()
    mockGetTemplate.mockImplementation(async (id: string) => ({
      id,
      name: id,
      description: id,
      template: '{{query}}{{bookmarks}}{{totalCount}}{{domainStats}}{{timeStats}}{{folderStats}}',
      variables: [],
      isDefault: true,
      isCustomized: false,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }))
  })

  it('interpretQuery recomputes when bookmark context changes', async () => {
    const { interpretQuery } = await import('./aiService')

    const config: LLMConfig = { provider: 'openai', apiKey: 'key', model: 'gpt-4o-mini' }
    const bookmarksA: Bookmark[] = [{ id: '1', title: 'React', url: 'https://react.dev', path: [], sourceFile: 'a.html' }]
    const bookmarksB: Bookmark[] = [{ id: '1', title: 'Vue', url: 'https://vuejs.org', path: [], sourceFile: 'b.html' }]

    mockCallLLM
      .mockResolvedValueOnce({ content: '{"matchedIds":["1"],"interpretation":"A"}', usage: { promptTokens: 1, completionTokens: 1, totalTokens: 2 }, model: 'gpt-4o-mini' })
      .mockResolvedValueOnce({ content: '{"matchedIds":["1"],"interpretation":"B"}', usage: { promptTokens: 1, completionTokens: 1, totalTokens: 2 }, model: 'gpt-4o-mini' })

    const first = await interpretQuery(config, 'frontend', bookmarksA)
    const second = await interpretQuery(config, 'frontend', bookmarksB)

    expect(first.interpretation).toBe('A')
    expect(second.interpretation).toBe('B')
    expect(mockCallLLM).toHaveBeenCalledTimes(2)
  })

  it('generateReport recomputes when bookmark set changes but stats shape stays similar', async () => {
    const { generateReport } = await import('./aiService')

    const config: LLMConfig = { provider: 'openai', apiKey: 'key', model: 'gpt-4o-mini' }
    const bookmarksA: Bookmark[] = [{ id: '1', title: 'A', url: 'https://a.com', path: ['Dev'], sourceFile: 'a.html' }]
    const bookmarksB: Bookmark[] = [{ id: '2', title: 'B', url: 'https://b.com', path: ['Dev'], sourceFile: 'b.html' }]
    const stats = { domainStats: { 'example.com': 1 }, yearStats: { '2024': 1 }, folderStats: { Dev: 1 } }

    mockCallLLM
      .mockResolvedValueOnce({ content: '{"insights":["A"],"recommendations":["R1"]}', usage: { promptTokens: 1, completionTokens: 1, totalTokens: 2 }, model: 'gpt-4o-mini' })
      .mockResolvedValueOnce({ content: '{"insights":["B"],"recommendations":["R2"]}', usage: { promptTokens: 1, completionTokens: 1, totalTokens: 2 }, model: 'gpt-4o-mini' })

    const first = await generateReport(config, bookmarksA, stats)
    const second = await generateReport(config, bookmarksB, stats)

    expect(first.insights).toEqual(['A'])
    expect(second.insights).toEqual(['B'])
    expect(mockCallLLM).toHaveBeenCalledTimes(2)
  })

  it('suggestFolderStructure recomputes when existing folders change', async () => {
    const { suggestFolderStructure } = await import('./cleanupAnalysis')

    const config: LLMConfig = { provider: 'openai', apiKey: 'key', model: 'gpt-4o-mini' }
    const bookmarks: Bookmark[] = [{ id: '1', title: 'React', url: 'https://react.dev', path: [], sourceFile: 'a.html' }]

    mockCallLLM
      .mockResolvedValueOnce({ content: '{"suggestions":[{"name":"Dev","path":["Dev"],"description":"A","suggestedBookmarkIds":["1"]}]}', usage: { promptTokens: 1, completionTokens: 1, totalTokens: 2 }, model: 'gpt-4o-mini' })
      .mockResolvedValueOnce({ content: '{"suggestions":[{"name":"Frontend","path":["Frontend"],"description":"B","suggestedBookmarkIds":["1"]}]}', usage: { promptTokens: 1, completionTokens: 1, totalTokens: 2 }, model: 'gpt-4o-mini' })

    const first = await suggestFolderStructure(config, bookmarks, ['Dev'])
    const second = await suggestFolderStructure(config, bookmarks, ['Frontend'])

    expect(first[0]?.name).toBe('Dev')
    expect(second[0]?.name).toBe('Frontend')
    expect(mockCallLLM).toHaveBeenCalledTimes(2)
  })
})
