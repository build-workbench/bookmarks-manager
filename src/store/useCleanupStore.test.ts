import { describe, it, expect, beforeEach, vi } from 'vitest'
import useCleanupStore from './useCleanupStore'
import type { Bookmark } from '@/utils/bookmarkParser'

// Mock dependencies
vi.mock('@/cleanup/services/cleanupService', () => ({
  createDeleteOperation: vi.fn((bookmarks) => ({
    type: 'delete',
    bookmarks,
    timestamp: Date.now(),
  })),
  createMoveOperation: vi.fn((bookmarks, moves) => ({
    type: 'move',
    bookmarks,
    moves,
    timestamp: Date.now(),
  })),
  createFolderOperation: vi.fn((path) => ({
    type: 'create_folder',
    path,
    timestamp: Date.now(),
  })),
  folderNameExistsAtLevel: vi.fn(() => false),
}))

vi.mock('@/cleanup/services/undoService', () => ({
  OperationHistory: class {
    private operations: unknown[] = []

    recordOperation(op: unknown) {
      this.operations.push(op)
    }

    canUndo() {
      return this.operations.length > 0
    }

    popLast() {
      return this.operations.pop()
    }

    getAll() {
      return this.operations
    }

    restore(ops: unknown[]) {
      this.operations = ops
    }
  },
  executeUndo: vi.fn(async () => ({ success: true })),
}))

vi.mock('@/utils/db', () => ({
  saveCleanupSession: vi.fn(() => Promise.resolve()),
  getLatestCleanupSession: vi.fn(() => Promise.resolve(null)),
  deleteCleanupSession: vi.fn(() => Promise.resolve()),
}))

vi.mock('@/utils/exporter', () => ({
  exportAsNetscapeHTML: vi.fn(() => '<!DOCTYPE NETSCAPE-Bookmark-file-1>'),
}))

const createMockBookmark = (id: string, title: string, path: string[] = []): Bookmark => ({
  id,
  title,
  url: `https://example.com/${id}`,
  path,
  addDate: Date.now(),
  sourceFile: 'test.html',
})

describe('useCleanupStore', () => {
  const mockBookmarks: Bookmark[] = [
    createMockBookmark('1', 'Bookmark 1', ['Folder A']),
    createMockBookmark('2', 'Bookmark 2', ['Folder A']),
    createMockBookmark('3', 'Bookmark 3', ['Folder B']),
  ]

  beforeEach(() => {
    useCleanupStore.getState().resetWorkflow()
    vi.clearAllMocks()
  })

  describe('initWorkflow', () => {
    it('initializes workflow with bookmarks', () => {
      useCleanupStore.getState().initWorkflow(mockBookmarks)

      const state = useCleanupStore.getState()
      expect(state.workingBookmarks).toHaveLength(3)
      expect(state.workflowStarted).toBe(true)
      expect(state.sessionId).toBeDefined()
      expect(state.currentStage).toBe('review')
    })

    it('resets state when initializing new workflow', () => {
      // Set some existing state
      useCleanupStore.setState({
        deletedBookmarkIds: new Set(['old']),
        selectedBookmarkIds: new Set(['old']),
      })

      useCleanupStore.getState().initWorkflow(mockBookmarks)

      const state = useCleanupStore.getState()
      expect(state.deletedBookmarkIds.size).toBe(0)
      expect(state.selectedBookmarkIds.size).toBe(0)
    })
  })

  describe('stage navigation', () => {
    beforeEach(() => {
      useCleanupStore.getState().initWorkflow(mockBookmarks)
    })

    it('moves to next stage', () => {
      useCleanupStore.getState().nextStage()
      expect(useCleanupStore.getState().currentStage).toBe('organize')
    })

    it('moves to previous stage', () => {
      useCleanupStore.getState().setStage('organize')
      useCleanupStore.getState().prevStage()
      expect(useCleanupStore.getState().currentStage).toBe('review')
    })

    it('cannot go back from review stage', () => {
      useCleanupStore.getState().prevStage()
      expect(useCleanupStore.getState().currentStage).toBe('review')
    })

    it('cannot go forward from preview stage', () => {
      useCleanupStore.getState().setStage('preview')
      useCleanupStore.getState().nextStage()
      expect(useCleanupStore.getState().currentStage).toBe('preview')
    })
  })

  describe('selection', () => {
    beforeEach(() => {
      useCleanupStore.getState().initWorkflow(mockBookmarks)
    })

    it('toggles bookmark selection', () => {
      useCleanupStore.getState().toggleBookmarkSelection('1')
      expect(useCleanupStore.getState().selectedBookmarkIds.has('1')).toBe(true)

      useCleanupStore.getState().toggleBookmarkSelection('1')
      expect(useCleanupStore.getState().selectedBookmarkIds.has('1')).toBe(false)
    })

    it('selects all bookmarks', () => {
      useCleanupStore.getState().selectAll(['1', '2', '3'])
      expect(useCleanupStore.getState().selectedBookmarkIds.size).toBe(3)
    })

    it('deselects all bookmarks', () => {
      useCleanupStore.getState().selectAll(['1', '2', '3'])
      useCleanupStore.getState().deselectAll()
      expect(useCleanupStore.getState().selectedBookmarkIds.size).toBe(0)
    })
  })

  describe('deletion', () => {
    beforeEach(() => {
      useCleanupStore.getState().initWorkflow(mockBookmarks)
      useCleanupStore.getState().selectAll(['1', '2'])
    })

    it('soft deletes selected bookmarks', async () => {
      await useCleanupStore.getState().deleteSelected()

      const state = useCleanupStore.getState()
      expect(state.deletedBookmarkIds.has('1')).toBe(true)
      expect(state.deletedBookmarkIds.has('2')).toBe(true)
      expect(state.selectedBookmarkIds.size).toBe(0)
      expect(state.hasUnsavedChanges).toBe(true)
    })

    it('restores deleted bookmarks', async () => {
      await useCleanupStore.getState().deleteSelected()
      useCleanupStore.getState().restoreDeleted(['1'])

      const state = useCleanupStore.getState()
      expect(state.deletedBookmarkIds.has('1')).toBe(false)
      expect(state.deletedBookmarkIds.has('2')).toBe(true)
    })
  })

  describe('AI recommendations', () => {
    beforeEach(() => {
      useCleanupStore.getState().initWorkflow(mockBookmarks)
    })

    it('sets AI recommendations', () => {
      const recommendations = [
        { bookmarkId: '1', recommendation: 'delete' as const, reason: 'Duplicate', reasonType: 'duplicate' as const, confidence: 90 },
        { bookmarkId: '2', recommendation: 'keep' as const, reason: 'Wrong folder', reasonType: 'valuable' as const, confidence: 80 },
      ]

      useCleanupStore.getState().setAIRecommendations(recommendations)

      expect(useCleanupStore.getState().aiRecommendations).toHaveLength(2)
    })

    it('accepts recommendation', () => {
      useCleanupStore.getState().setAIRecommendations([
        { bookmarkId: '1', recommendation: 'delete', reason: 'test', reasonType: 'duplicate', confidence: 90 },
      ])

      useCleanupStore.getState().acceptRecommendation('1')

      const rec = useCleanupStore.getState().aiRecommendations[0]
      expect(rec.accepted).toBe(true)
      expect(rec.rejected).toBe(false)
    })

    it('rejects recommendation', () => {
      useCleanupStore.getState().setAIRecommendations([
        { bookmarkId: '1', recommendation: 'delete', reason: 'test', reasonType: 'duplicate', confidence: 90 },
      ])

      useCleanupStore.getState().rejectRecommendation('1')

      const rec = useCleanupStore.getState().aiRecommendations[0]
      expect(rec.accepted).toBe(false)
      expect(rec.rejected).toBe(true)
    })
  })

  describe('change summary', () => {
    beforeEach(() => {
      useCleanupStore.getState().initWorkflow(mockBookmarks)
    })

    it('generates correct change summary', async () => {
      useCleanupStore.getState().selectAll(['1'])
      await useCleanupStore.getState().deleteSelected()

      const summary = useCleanupStore.getState().getChangeSummary()

      expect(summary.deleted).toBe(1)
      expect(summary.moved).toBe(0)
      expect(summary.newFolders).toBe(0)
      expect(summary.deletedBookmarks).toHaveLength(1)
    })
  })

  describe('active bookmarks', () => {
    beforeEach(() => {
      useCleanupStore.getState().initWorkflow(mockBookmarks)
    })

    it('returns only non-deleted bookmarks', async () => {
      useCleanupStore.getState().selectAll(['1'])
      await useCleanupStore.getState().deleteSelected()

      const active = useCleanupStore.getState().getActiveBookmarks()

      expect(active).toHaveLength(2)
      expect(active.find(b => b.id === '1')).toBeUndefined()
    })
  })

  describe('filters', () => {
    beforeEach(() => {
      useCleanupStore.getState().initWorkflow(mockBookmarks)
    })

    it('sets filters', () => {
      useCleanupStore.getState().setFilters({ domain: 'example.com' })
      expect(useCleanupStore.getState().filters.domain).toBe('example.com')
    })

    it('clears filters', () => {
      useCleanupStore.getState().setFilters({ domain: 'example.com' })
      useCleanupStore.getState().clearFilters()
      expect(useCleanupStore.getState().filters).toEqual({})
    })
  })

  describe('reset', () => {
    it('resets workflow to initial state', () => {
      useCleanupStore.getState().initWorkflow(mockBookmarks)
      useCleanupStore.getState().selectAll(['1', '2'])

      useCleanupStore.getState().resetWorkflow()

      const state = useCleanupStore.getState()
      expect(state.workflowStarted).toBe(false)
      expect(state.workingBookmarks).toHaveLength(0)
      expect(state.currentStage).toBe('review')
    })
  })
})
