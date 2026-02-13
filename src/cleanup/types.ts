/**
 * AI Bookmark Cleanup Workflow Type Definitions
 */

import type { Bookmark } from '@/utils/bookmarkParser'

// Workflow Stage Types
export type CleanupStage = 'review' | 'organize' | 'preview'

// AI Cleanup Recommendation Types
export type RecommendationType = 'delete' | 'keep' | 'review'
export type ReasonType = 'duplicate' | 'broken' | 'outdated' | 'low_quality' | 'valuable'

export interface AICleanupRecommendation {
    bookmarkId: string
    recommendation: RecommendationType
    reason: string
    reasonType: ReasonType
    confidence: number // 0-100
    accepted?: boolean
    rejected?: boolean
}

// Folder Suggestion Types
export interface SuggestedFolder {
    name: string
    path: string[]
    description: string
    suggestedBookmarkIds: string[]
}

// Bookmark Move Types
export interface BookmarkMove {
    bookmarkId: string
    fromPath: string[]
    toPath: string[]
}

// Operation Types for Undo/Redo
export type OperationType = 'delete' | 'move' | 'create_folder'

export interface DeleteOperationData {
    bookmarks: Bookmark[]
}

export interface MoveOperationData {
    moves: Array<{
        bookmarkId: string
        bookmark: Bookmark
        fromPath: string[]
        toPath: string[]
    }>
}

export interface CreateFolderOperationData {
    path: string[]
}

export interface CleanupOperation {
    id: string
    type: OperationType
    timestamp: number
    data: DeleteOperationData | MoveOperationData | CreateFolderOperationData
}

// Filter Types
export interface CleanupFilters {
    domain?: string
    folder?: string[]
    dateRange?: {
        start: number
        end: number
    }
    recommendationStatus?: RecommendationType | 'all'
    searchQuery?: string
}

// Cleanup Session (for persistence)
export interface CleanupSession {
    id: string
    startedAt: number
    currentStage: CleanupStage
    selectedBookmarkIds: string[]
    deletedBookmarkIds: string[]
    pendingMoves: BookmarkMove[]
    createdFolders: string[][]
    operationHistory: CleanupOperation[]
    aiRecommendations: AICleanupRecommendation[]
    suggestedFolders: SuggestedFolder[]
}

// Extended Bookmark for Cleanup Workflow
export interface CleanupBookmark extends Bookmark {
    aiRecommendation?: AICleanupRecommendation
    isSelected?: boolean
    pendingMove?: string[]
    isDeleted?: boolean
}

// Change Summary for Export Preview
export interface ChangeSummary {
    deleted: number
    moved: number
    newFolders: number
    deletedBookmarks: Bookmark[]
    movedBookmarks: Array<{ bookmark: Bookmark; fromPath: string[]; toPath: string[] }>
    createdFolderPaths: string[][]
}

// Folder Tree Node for Display
export interface FolderTreeNode {
    name: string
    path: string[]
    bookmarkCount: number
    bookmarks: Bookmark[]
    children: FolderTreeNode[]
    isNew?: boolean
    isExpanded?: boolean
}

// Store State Types
export interface CleanupState {
    // Workflow state
    currentStage: CleanupStage
    workflowStarted: boolean
    hasUnsavedChanges: boolean

    // Session
    sessionId: string | null

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
    operationHistory: CleanupOperation[]

    // Filters
    filters: CleanupFilters

    // Loading states
    isLoading: boolean
    isSaving: boolean
}

// Store Actions Types
export interface CleanupActions {
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
    requestAIAnalysis: (bookmarks: Bookmark[]) => Promise<void>
    acceptRecommendation: (bookmarkId: string) => void
    rejectRecommendation: (bookmarkId: string) => void
    acceptAllRecommendations: (type: RecommendationType) => void

    // Folder operations
    requestAICategorization: (bookmarks: Bookmark[]) => Promise<void>
    moveBookmarks: (bookmarkIds: string[], targetPath: string[]) => void
    createFolder: (path: string[]) => boolean
    acceptFolderSuggestion: (suggestion: SuggestedFolder) => void

    // Undo
    undo: () => void
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
    exportBookmarks: () => string
}
