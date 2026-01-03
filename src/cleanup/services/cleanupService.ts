/**
 * Cleanup Service for Bookmark Operations
 * Handles deletion, moving, and folder creation with transaction support
 */

import type { Bookmark } from '../../utils/bookmarkParser'
import type { BookmarkMove, CleanupOperation, DeleteOperationData, MoveOperationData, CreateFolderOperationData } from '../types'
import {
    deleteBookmarksByIds,
    bulkUpdateBookmarkPaths,
    restoreBookmarks,
    loadBookmarks,
    type StoredBookmark
} from '../../utils/db'
import { normalizeUrl } from '../../utils/url'

/**
 * Delete bookmarks by IDs
 * Returns the deleted bookmarks for undo support
 */
export async function deleteBookmarks(
    bookmarks: Bookmark[],
    idsToDelete: string[]
): Promise<{ success: boolean; deletedBookmarks: Bookmark[]; error?: string }> {
    try {
        // Find the bookmarks to delete
        const bookmarksToDelete = bookmarks.filter(b => idsToDelete.includes(b.id))

        if (bookmarksToDelete.length === 0) {
            return { success: true, deletedBookmarks: [] }
        }

        // Delete from database
        await deleteBookmarksByIds(idsToDelete)

        return { success: true, deletedBookmarks: bookmarksToDelete }
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error during deletion'
        return { success: false, deletedBookmarks: [], error: message }
    }
}

/**
 * Restore previously deleted bookmarks
 */
export async function restoreDeletedBookmarks(
    bookmarks: Bookmark[]
): Promise<{ success: boolean; error?: string }> {
    try {
        const storedBookmarks: StoredBookmark[] = bookmarks.map(b => ({
            ...b,
            normalized: normalizeUrl(b.url)
        }))
        await restoreBookmarks(storedBookmarks)
        return { success: true }
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error during restore'
        return { success: false, error: message }
    }
}

/**
 * Move bookmarks to a new folder path
 * Returns the original paths for undo support
 */
export async function moveBookmarks(
    bookmarks: Bookmark[],
    moves: BookmarkMove[]
): Promise<{ success: boolean; originalMoves: BookmarkMove[]; error?: string }> {
    try {
        // Prepare updates
        const updates = moves.map(move => ({
            id: move.bookmarkId,
            path: move.toPath
        }))

        // Store original paths for undo
        const originalMoves: BookmarkMove[] = moves.map(move => {
            const bookmark = bookmarks.find(b => b.id === move.bookmarkId)
            return {
                bookmarkId: move.bookmarkId,
                fromPath: bookmark?.path || [],
                toPath: move.fromPath // Swap for undo
            }
        })

        // Update in database
        await bulkUpdateBookmarkPaths(updates)

        return { success: true, originalMoves }
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error during move'
        return { success: false, originalMoves: [], error: message }
    }
}

/**
 * Check if a folder already exists at the given path
 */
export function folderExists(bookmarks: Bookmark[], folderPath: string[]): boolean {
    if (folderPath.length === 0) return false

    // Check if any bookmark has this exact path or a path that starts with this path
    return bookmarks.some(bookmark => {
        if (bookmark.path.length < folderPath.length) return false
        return folderPath.every((segment, index) =>
            bookmark.path[index]?.toLowerCase() === segment.toLowerCase()
        )
    })
}

/**
 * Check if a folder name already exists at the same level
 */
export function folderNameExistsAtLevel(
    bookmarks: Bookmark[],
    parentPath: string[],
    folderName: string
): boolean {
    const targetPath = [...parentPath, folderName]
    const lowerFolderName = folderName.toLowerCase()

    // Get all unique folder paths at the target level
    const existingFolders = new Set<string>()

    for (const bookmark of bookmarks) {
        if (bookmark.path.length > parentPath.length) {
            // Check if the bookmark is under the parent path
            const isUnderParent = parentPath.every((segment, index) =>
                bookmark.path[index]?.toLowerCase() === segment.toLowerCase()
            )

            if (isUnderParent) {
                // Get the folder name at the target level
                const folderAtLevel = bookmark.path[parentPath.length]
                if (folderAtLevel) {
                    existingFolders.add(folderAtLevel.toLowerCase())
                }
            }
        }
    }

    return existingFolders.has(lowerFolderName)
}

/**
 * Create a new folder (virtual - just validates the operation)
 * Actual folder creation happens when bookmarks are moved to it
 */
export function createFolder(
    bookmarks: Bookmark[],
    folderPath: string[]
): { success: boolean; error?: string } {
    if (folderPath.length === 0) {
        return { success: false, error: 'Folder path cannot be empty' }
    }

    const parentPath = folderPath.slice(0, -1)
    const folderName = folderPath[folderPath.length - 1]

    // Check for duplicate folder name at the same level
    if (folderNameExistsAtLevel(bookmarks, parentPath, folderName)) {
        return { success: false, error: `Folder "${folderName}" already exists at this level` }
    }

    return { success: true }
}

/**
 * Create a delete operation record for undo
 */
export function createDeleteOperation(bookmarks: Bookmark[]): CleanupOperation {
    const data: DeleteOperationData = { bookmarks }
    return {
        id: crypto.randomUUID(),
        type: 'delete',
        timestamp: Date.now(),
        data
    }
}

/**
 * Create a move operation record for undo
 */
export function createMoveOperation(
    bookmarks: Bookmark[],
    moves: BookmarkMove[]
): CleanupOperation {
    const data: MoveOperationData = {
        moves: moves.map(move => {
            const bookmark = bookmarks.find(b => b.id === move.bookmarkId)
            return {
                bookmarkId: move.bookmarkId,
                bookmark: bookmark!,
                fromPath: move.fromPath,
                toPath: move.toPath
            }
        })
    }
    return {
        id: crypto.randomUUID(),
        type: 'move',
        timestamp: Date.now(),
        data
    }
}

/**
 * Create a folder creation operation record for undo
 */
export function createFolderOperation(path: string[]): CleanupOperation {
    const data: CreateFolderOperationData = { path }
    return {
        id: crypto.randomUUID(),
        type: 'create_folder',
        timestamp: Date.now(),
        data
    }
}

/**
 * Group recommendations by type
 */
export function groupRecommendationsByType<T extends { recommendation: string }>(
    recommendations: T[]
): Map<string, T[]> {
    const groups = new Map<string, T[]>()

    for (const rec of recommendations) {
        const type = rec.recommendation
        const group = groups.get(type) || []
        group.push(rec)
        groups.set(type, group)
    }

    return groups
}

/**
 * Get bookmarks that are not in the deleted set
 */
export function getActiveBookmarks(
    bookmarks: Bookmark[],
    deletedIds: Set<string>
): Bookmark[] {
    return bookmarks.filter(b => !deletedIds.has(b.id))
}

/**
 * Apply pending moves to bookmarks (in memory)
 */
export function applyPendingMoves(
    bookmarks: Bookmark[],
    moves: BookmarkMove[]
): Bookmark[] {
    const moveMap = new Map(moves.map(m => [m.bookmarkId, m.toPath]))

    return bookmarks.map(bookmark => {
        const newPath = moveMap.get(bookmark.id)
        if (newPath) {
            return { ...bookmark, path: newPath }
        }
        return bookmark
    })
}
