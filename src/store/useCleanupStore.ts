/**
 * Cleanup Workflow Store
 * Manages state for the AI-assisted bookmark cleanup workflow
 */

import { create } from 'zustand'
import type { Bookmark } from '../utils/bookmarkParser'
import type {
    CleanupStage,
    CleanupFilters,
    AICleanupRecommendation,
    SuggestedFolder,
    BookmarkMove,
    CleanupOperation,
    CleanupSession,
    ChangeSummary,
    RecommendationType
} from '../cleanup/types'
import {
    deleteBookmarks,
    restoreDeletedBookmarks,
    createDeleteOperation,
    createMoveOperation,
    createFolderOperation,
    folderNameExistsAtLevel,
    groupRecommendationsByType
} from '../cleanup/services/cleanupService'
import {
    OperationHistory,
    executeUndo
} from '../cleanup/services/undoService'
import {
    saveCleanupSession,
    loadCleanupSession,
    getLatestCleanupSession,
    deleteCleanupSession,
    bulkUpdateBookmarkPaths
} from '../utils/db'
import { exportAsNetscapeHTML } from '../utils/exporter'

interface CleanupState {
    // Workflow state
    currentStage: CleanupStage
    workflowStarted: boolean
    hasUnsavedChanges: boolean

    // Session
    sessionId: string | null

    // Bookmarks (reference from main store)
    workingBookmarks: Bookmark[]

    // Selection state
    selectedBookmarkIds: Set<string>

    // Deleted bookmarks (soft delete during workflow)
    deletedBookmarkIds: Set<string>

    // AI recommendations
    aiRecommendations: AICleanupRecommendation[]
    isAnalyzing: boolean
    analysisError: string | null

    // Folder suggestions
    suggestedFolders: SuggestedFolder[]
    pendingMoves: BookmarkMove[]
    createdFolders: string[][]

    // Operation history for undo
    operationHistory: OperationHistory

    // Filters
    filters: CleanupFilters

    // Loading states
    isLoading: boolean
    isSaving: boolean
}

interface CleanupActions {
    // Initialization
    initWorkflow: (bookmarks: Bookmark[]) => void

    // Stage navigation
    setStage: (stage: CleanupStage) => void
    nextStage: () => void
    prevStage: () => void

    // Selection
    toggleBookmarkSelection: (id: string) => void
    selectAll: (ids: string[]) => void
    deselectAll: () => void
    selectByRecommendation: (type: RecommendationType) => void

    // Deletion
    deleteSelected: () => Promise<void>
    restoreDeleted: (ids: string[]) => void

    // AI Analysis
    setAIRecommendations: (recommendations: AICleanupRecommendation[]) => void
    setIsAnalyzing: (isAnalyzing: boolean) => void
    setAnalysisError: (error: string | null) => void
    acceptRecommendation: (bookmarkId: string) => void
    rejectRecommendation: (bookmarkId: string) => void
    acceptAllRecommendations: (type: RecommendationType) => void

    // Folder operations
    setSuggestedFolders: (folders: SuggestedFolder[]) => void
    moveBookmarksToFolder: (bookmarkIds: string[], targetPath: string[]) => Promise<void>
    createFolder: (path: string[]) => boolean
    acceptFolderSuggestion: (suggestion: SuggestedFolder) => void

    // Undo
    undo: () => Promise<void>
    canUndo: () => boolean

    // Filters
    setFilters: (filters: Partial<CleanupFilters>) => void
    clearFilters: () => void

    // Session management
    saveSession: () => Promise<void>
    loadSession: () => Promise<boolean>
    resetWorkflow: () => void

    // Export
    getChangeSummary: () => ChangeSummary
    getActiveBookmarks: () => Bookmark[]
    exportBookmarks: () => string
}

const STAGE_ORDER: CleanupStage[] = ['review', 'organize', 'preview']

const useCleanupStore = create<CleanupState & CleanupActions>((set, get) => ({
    // Initial state
    currentStage: 'review',
    workflowStarted: false,
    hasUnsavedChanges: false,
    sessionId: null,
    workingBookmarks: [],
    selectedBookmarkIds: new Set(),
    deletedBookmarkIds: new Set(),
    aiRecommendations: [],
    isAnalyzing: false,
    analysisError: null,
    suggestedFolders: [],
    pendingMoves: [],
    createdFolders: [],
    operationHistory: new OperationHistory(),
    filters: {},
    isLoading: false,
    isSaving: false,

    // Initialization
    initWorkflow: (bookmarks) => {
        set({
            workingBookmarks: [...bookmarks],
            workflowStarted: true,
            sessionId: crypto.randomUUID(),
            currentStage: 'review',
            selectedBookmarkIds: new Set(),
            deletedBookmarkIds: new Set(),
            aiRecommendations: [],
            suggestedFolders: [],
            pendingMoves: [],
            createdFolders: [],
            operationHistory: new OperationHistory(),
            hasUnsavedChanges: false
        })
    },

    // Stage navigation
    setStage: (stage) => {
        set({ currentStage: stage })
    },

    nextStage: () => {
        const { currentStage } = get()
        const currentIndex = STAGE_ORDER.indexOf(currentStage)
        if (currentIndex < STAGE_ORDER.length - 1) {
            set({ currentStage: STAGE_ORDER[currentIndex + 1] })
        }
    },

    prevStage: () => {
        const { currentStage } = get()
        const currentIndex = STAGE_ORDER.indexOf(currentStage)
        if (currentIndex > 0) {
            set({ currentStage: STAGE_ORDER[currentIndex - 1] })
        }
    },

    // Selection
    toggleBookmarkSelection: (id) => {
        const { selectedBookmarkIds } = get()
        const newSet = new Set(selectedBookmarkIds)
        if (newSet.has(id)) {
            newSet.delete(id)
        } else {
            newSet.add(id)
        }
        set({ selectedBookmarkIds: newSet })
    },

    selectAll: (ids) => {
        set({ selectedBookmarkIds: new Set(ids) })
    },

    deselectAll: () => {
        set({ selectedBookmarkIds: new Set() })
    },

    selectByRecommendation: (type) => {
        const { aiRecommendations } = get()
        const ids = aiRecommendations
            .filter(r => r.recommendation === type && !r.rejected)
            .map(r => r.bookmarkId)
        set({ selectedBookmarkIds: new Set(ids) })
    },

    // Deletion
    deleteSelected: async () => {
        const { selectedBookmarkIds, workingBookmarks, deletedBookmarkIds, operationHistory } = get()

        if (selectedBookmarkIds.size === 0) return

        const idsToDelete = Array.from(selectedBookmarkIds)
        const bookmarksToDelete = workingBookmarks.filter(b => idsToDelete.includes(b.id))

        // Record operation for undo
        const operation = createDeleteOperation(bookmarksToDelete)
        operationHistory.recordOperation(operation)

        // Add to deleted set (soft delete)
        const newDeletedIds = new Set(deletedBookmarkIds)
        idsToDelete.forEach(id => newDeletedIds.add(id))

        set({
            deletedBookmarkIds: newDeletedIds,
            selectedBookmarkIds: new Set(),
            hasUnsavedChanges: true
        })
    },

    restoreDeleted: (ids) => {
        const { deletedBookmarkIds } = get()
        const newDeletedIds = new Set(deletedBookmarkIds)
        ids.forEach(id => newDeletedIds.delete(id))
        set({ deletedBookmarkIds: newDeletedIds, hasUnsavedChanges: true })
    },

    // AI Analysis
    setAIRecommendations: (recommendations) => {
        set({ aiRecommendations: recommendations })
    },

    setIsAnalyzing: (isAnalyzing) => {
        set({ isAnalyzing })
    },

    setAnalysisError: (error) => {
        set({ analysisError: error })
    },

    acceptRecommendation: (bookmarkId) => {
        const { aiRecommendations, selectedBookmarkIds } = get()
        const newRecommendations = aiRecommendations.map(r =>
            r.bookmarkId === bookmarkId ? { ...r, accepted: true, rejected: false } : r
        )

        // If it's a delete recommendation, add to selection
        const rec = aiRecommendations.find(r => r.bookmarkId === bookmarkId)
        const newSelected = new Set(selectedBookmarkIds)
        if (rec?.recommendation === 'delete') {
            newSelected.add(bookmarkId)
        }

        set({
            aiRecommendations: newRecommendations,
            selectedBookmarkIds: newSelected
        })
    },

    rejectRecommendation: (bookmarkId) => {
        const { aiRecommendations, selectedBookmarkIds } = get()
        const newRecommendations = aiRecommendations.map(r =>
            r.bookmarkId === bookmarkId ? { ...r, accepted: false, rejected: true } : r
        )

        // Remove from selection if it was selected
        const newSelected = new Set(selectedBookmarkIds)
        newSelected.delete(bookmarkId)

        set({
            aiRecommendations: newRecommendations,
            selectedBookmarkIds: newSelected
        })
    },

    acceptAllRecommendations: (type) => {
        const { aiRecommendations, selectedBookmarkIds } = get()
        const newRecommendations = aiRecommendations.map(r =>
            r.recommendation === type && !r.rejected
                ? { ...r, accepted: true }
                : r
        )

        // If accepting delete recommendations, add all to selection
        const newSelected = new Set(selectedBookmarkIds)
        if (type === 'delete') {
            aiRecommendations
                .filter(r => r.recommendation === 'delete' && !r.rejected)
                .forEach(r => newSelected.add(r.bookmarkId))
        }

        set({
            aiRecommendations: newRecommendations,
            selectedBookmarkIds: newSelected
        })
    },

    // Folder operations
    setSuggestedFolders: (folders) => {
        set({ suggestedFolders: folders })
    },

    moveBookmarksToFolder: async (bookmarkIds, targetPath) => {
        const { workingBookmarks, pendingMoves, operationHistory } = get()

        const moves: BookmarkMove[] = bookmarkIds.map(id => {
            const bookmark = workingBookmarks.find(b => b.id === id)
            return {
                bookmarkId: id,
                fromPath: bookmark?.path || [],
                toPath: targetPath
            }
        })

        // Record operation for undo
        const operation = createMoveOperation(workingBookmarks, moves)
        operationHistory.recordOperation(operation)

        // Update working bookmarks
        const newBookmarks = workingBookmarks.map(b => {
            if (bookmarkIds.includes(b.id)) {
                return { ...b, path: targetPath }
            }
            return b
        })

        // Add to pending moves
        const newPendingMoves = [...pendingMoves, ...moves]

        set({
            workingBookmarks: newBookmarks,
            pendingMoves: newPendingMoves,
            selectedBookmarkIds: new Set(),
            hasUnsavedChanges: true
        })
    },

    createFolder: (path) => {
        const { workingBookmarks, createdFolders } = get()

        if (path.length === 0) return false

        const parentPath = path.slice(0, -1)
        const folderName = path[path.length - 1]

        // Check for duplicate
        if (folderNameExistsAtLevel(workingBookmarks, parentPath, folderName)) {
            return false
        }

        // Check if already in created folders
        const alreadyCreated = createdFolders.some(
            f => f.length === path.length && f.every((s, i) => s === path[i])
        )
        if (alreadyCreated) return false

        // Record operation
        const { operationHistory } = get()
        const operation = createFolderOperation(path)
        operationHistory.recordOperation(operation)

        set({
            createdFolders: [...createdFolders, path],
            hasUnsavedChanges: true
        })

        return true
    },

    acceptFolderSuggestion: (suggestion) => {
        const { createFolder, moveBookmarksToFolder } = get()

        // Create the folder if it doesn't exist
        createFolder(suggestion.path)

        // Move suggested bookmarks to the folder
        if (suggestion.suggestedBookmarkIds.length > 0) {
            moveBookmarksToFolder(suggestion.suggestedBookmarkIds, suggestion.path)
        }
    },

    // Undo
    undo: async () => {
        const { operationHistory, workingBookmarks, deletedBookmarkIds, pendingMoves, createdFolders } = get()

        if (!operationHistory.canUndo()) return

        const operation = operationHistory.popLast()
        if (!operation) return

        const result = await executeUndo(operation, workingBookmarks)

        if (result.success) {
            if (operation.type === 'delete' && result.restoredBookmarks) {
                // Restore deleted bookmarks
                const newDeletedIds = new Set(deletedBookmarkIds)
                result.restoredBookmarks.forEach(b => newDeletedIds.delete(b.id))
                set({ deletedBookmarkIds: newDeletedIds })
            } else if (operation.type === 'move' && result.revertedMoves) {
                // Revert moves
                const newBookmarks = workingBookmarks.map(b => {
                    const revert = result.revertedMoves?.find(m => m.bookmarkId === b.id)
                    if (revert) {
                        return { ...b, path: revert.path }
                    }
                    return b
                })

                // Remove from pending moves
                const revertedIds = new Set(result.revertedMoves.map(m => m.bookmarkId))
                const newPendingMoves = pendingMoves.filter(m => !revertedIds.has(m.bookmarkId))

                set({ workingBookmarks: newBookmarks, pendingMoves: newPendingMoves })
            } else if (operation.type === 'create_folder' && result.removedFolder) {
                // Remove created folder
                const newCreatedFolders = createdFolders.filter(
                    f => !(f.length === result.removedFolder!.length &&
                        f.every((s, i) => s === result.removedFolder![i]))
                )
                set({ createdFolders: newCreatedFolders })
            }
        }
    },

    canUndo: () => {
        return get().operationHistory.canUndo()
    },

    // Filters
    setFilters: (filters) => {
        set(state => ({ filters: { ...state.filters, ...filters } }))
    },

    clearFilters: () => {
        set({ filters: {} })
    },

    // Session management
    saveSession: async () => {
        const state = get()
        if (!state.sessionId) return

        set({ isSaving: true })

        try {
            const session: CleanupSession = {
                id: state.sessionId,
                startedAt: Date.now(),
                currentStage: state.currentStage,
                selectedBookmarkIds: Array.from(state.selectedBookmarkIds),
                deletedBookmarkIds: Array.from(state.deletedBookmarkIds),
                pendingMoves: state.pendingMoves,
                createdFolders: state.createdFolders,
                operationHistory: state.operationHistory.getAll(),
                aiRecommendations: state.aiRecommendations,
                suggestedFolders: state.suggestedFolders
            }

            await saveCleanupSession({
                id: state.sessionId,
                sessionData: JSON.stringify(session),
                createdAt: Date.now(),
                updatedAt: Date.now()
            })

            set({ hasUnsavedChanges: false })
        } finally {
            set({ isSaving: false })
        }
    },

    loadSession: async () => {
        set({ isLoading: true })

        try {
            const record = await getLatestCleanupSession()
            if (!record) return false

            const session: CleanupSession = JSON.parse(record.sessionData)

            const history = new OperationHistory()
            history.restore(session.operationHistory)

            set({
                sessionId: session.id,
                currentStage: session.currentStage,
                selectedBookmarkIds: new Set(session.selectedBookmarkIds),
                deletedBookmarkIds: new Set(session.deletedBookmarkIds),
                pendingMoves: session.pendingMoves,
                createdFolders: session.createdFolders,
                operationHistory: history,
                aiRecommendations: session.aiRecommendations,
                suggestedFolders: session.suggestedFolders,
                workflowStarted: true,
                hasUnsavedChanges: false
            })

            return true
        } catch (error) {
            console.error('Failed to load cleanup session:', error)
            return false
        } finally {
            set({ isLoading: false })
        }
    },

    resetWorkflow: () => {
        const { sessionId } = get()
        if (sessionId) {
            deleteCleanupSession(sessionId).catch(console.error)
        }

        set({
            currentStage: 'review',
            workflowStarted: false,
            hasUnsavedChanges: false,
            sessionId: null,
            workingBookmarks: [],
            selectedBookmarkIds: new Set(),
            deletedBookmarkIds: new Set(),
            aiRecommendations: [],
            isAnalyzing: false,
            analysisError: null,
            suggestedFolders: [],
            pendingMoves: [],
            createdFolders: [],
            operationHistory: new OperationHistory(),
            filters: {}
        })
    },

    // Export
    getChangeSummary: () => {
        const { deletedBookmarkIds, pendingMoves, createdFolders, workingBookmarks } = get()

        const deletedBookmarks = workingBookmarks.filter(b => deletedBookmarkIds.has(b.id))
        const movedBookmarks = pendingMoves.map(move => {
            const bookmark = workingBookmarks.find(b => b.id === move.bookmarkId)
            return {
                bookmark: bookmark!,
                fromPath: move.fromPath,
                toPath: move.toPath
            }
        }).filter(m => m.bookmark)

        return {
            deleted: deletedBookmarkIds.size,
            moved: pendingMoves.length,
            newFolders: createdFolders.length,
            deletedBookmarks,
            movedBookmarks,
            createdFolderPaths: createdFolders
        }
    },

    getActiveBookmarks: () => {
        const { workingBookmarks, deletedBookmarkIds } = get()
        return workingBookmarks.filter(b => !deletedBookmarkIds.has(b.id))
    },

    exportBookmarks: () => {
        const activeBookmarks = get().getActiveBookmarks()
        return exportAsNetscapeHTML(activeBookmarks)
    }
}))

export default useCleanupStore
