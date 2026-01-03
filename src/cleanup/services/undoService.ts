/**
 * Undo Service for Cleanup Workflow
 * Manages operation history and provides undo functionality
 */

import type { Bookmark } from '../../utils/bookmarkParser'
import type {
    CleanupOperation,
    DeleteOperationData,
    MoveOperationData,
    CreateFolderOperationData
} from '../types'
import { restoreDeletedBookmarks, moveBookmarks } from './cleanupService'

const MAX_HISTORY_SIZE = 10

/**
 * Operation History Manager
 * Maintains a stack of operations for undo support
 */
export class OperationHistory {
    private history: CleanupOperation[] = []

    /**
     * Record a new operation
     */
    recordOperation(operation: CleanupOperation): void {
        this.history.push(operation)

        // Trim history if it exceeds max size
        if (this.history.length > MAX_HISTORY_SIZE) {
            this.history = this.history.slice(-MAX_HISTORY_SIZE)
        }
    }

    /**
     * Get the last operation without removing it
     */
    peekLast(): CleanupOperation | undefined {
        return this.history[this.history.length - 1]
    }

    /**
     * Pop the last operation from history
     */
    popLast(): CleanupOperation | undefined {
        return this.history.pop()
    }

    /**
     * Check if undo is available
     */
    canUndo(): boolean {
        return this.history.length > 0
    }

    /**
     * Get the number of operations in history
     */
    size(): number {
        return this.history.length
    }

    /**
     * Clear all history
     */
    clear(): void {
        this.history = []
    }

    /**
     * Get all operations (for persistence)
     */
    getAll(): CleanupOperation[] {
        return [...this.history]
    }

    /**
     * Restore history from saved state
     */
    restore(operations: CleanupOperation[]): void {
        this.history = operations.slice(-MAX_HISTORY_SIZE)
    }
}

/**
 * Undo result type
 */
export interface UndoResult {
    success: boolean
    operation?: CleanupOperation
    restoredBookmarks?: Bookmark[]
    revertedMoves?: Array<{ bookmarkId: string; path: string[] }>
    removedFolder?: string[]
    error?: string
}

/**
 * Undo a delete operation
 */
export async function undoDeleteOperation(
    data: DeleteOperationData
): Promise<UndoResult> {
    try {
        const result = await restoreDeletedBookmarks(data.bookmarks)
        if (!result.success) {
            return { success: false, error: result.error }
        }
        return {
            success: true,
            restoredBookmarks: data.bookmarks
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error during undo'
        return { success: false, error: message }
    }
}

/**
 * Undo a move operation
 */
export async function undoMoveOperation(
    data: MoveOperationData,
    currentBookmarks: Bookmark[]
): Promise<UndoResult> {
    try {
        // Reverse the moves (swap from and to paths)
        const reverseMoves = data.moves.map(move => ({
            bookmarkId: move.bookmarkId,
            fromPath: move.toPath,
            toPath: move.fromPath
        }))

        const result = await moveBookmarks(currentBookmarks, reverseMoves)
        if (!result.success) {
            return { success: false, error: result.error }
        }

        return {
            success: true,
            revertedMoves: data.moves.map(m => ({
                bookmarkId: m.bookmarkId,
                path: m.fromPath
            }))
        }
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error during undo'
        return { success: false, error: message }
    }
}

/**
 * Undo a folder creation operation
 * Note: This is a soft undo - the folder will be removed if no bookmarks are in it
 */
export function undoCreateFolderOperation(
    data: CreateFolderOperationData
): UndoResult {
    // Folder creation is virtual - just return the path that was created
    return {
        success: true,
        removedFolder: data.path
    }
}

/**
 * Execute undo for any operation type
 */
export async function executeUndo(
    operation: CleanupOperation,
    currentBookmarks: Bookmark[]
): Promise<UndoResult> {
    switch (operation.type) {
        case 'delete':
            return undoDeleteOperation(operation.data as DeleteOperationData)

        case 'move':
            return undoMoveOperation(operation.data as MoveOperationData, currentBookmarks)

        case 'create_folder':
            return undoCreateFolderOperation(operation.data as CreateFolderOperationData)

        default:
            return { success: false, error: `Unknown operation type: ${operation.type}` }
    }
}

/**
 * Create a singleton instance for the operation history
 */
let historyInstance: OperationHistory | null = null

export function getOperationHistory(): OperationHistory {
    if (!historyInstance) {
        historyInstance = new OperationHistory()
    }
    return historyInstance
}

export function resetOperationHistory(): void {
    historyInstance = new OperationHistory()
}
