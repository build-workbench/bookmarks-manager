/**
 * Filter Service for Cleanup Workflow
 * Provides filtering functions for bookmarks based on various criteria
 */

import type { Bookmark } from '@/utils/bookmarkParser'
import type { CleanupFilters, AICleanupRecommendation, CleanupBookmark } from '@/cleanup/types'
import { getHostname } from '@/utils/url'

/**
 * Filter bookmarks by domain name
 */
export function filterByDomain(bookmarks: Bookmark[], domain: string): Bookmark[] {
    if (!domain) return bookmarks
    const lowerDomain = domain.toLowerCase()
    return bookmarks.filter(bookmark => {
        const host = getHostname(bookmark.url)
        return host?.toLowerCase().includes(lowerDomain)
    })
}

/**
 * Filter bookmarks by folder path
 * Matches bookmarks whose path starts with the given folder path
 */
export function filterByFolder(bookmarks: Bookmark[], folderPath: string[]): Bookmark[] {
    if (!folderPath || folderPath.length === 0) return bookmarks
    return bookmarks.filter(bookmark => {
        if (bookmark.path.length < folderPath.length) return false
        return folderPath.every((segment, index) =>
            bookmark.path[index]?.toLowerCase() === segment.toLowerCase()
        )
    })
}

/**
 * Filter bookmarks by date range (based on addDate)
 */
export function filterByDateRange(
    bookmarks: Bookmark[],
    startDate: number,
    endDate: number
): Bookmark[] {
    return bookmarks.filter(bookmark => {
        const addDate = bookmark.addDate
        if (!addDate) return false
        // addDate is in seconds, convert to milliseconds for comparison
        const dateMs = addDate * 1000
        return dateMs >= startDate && dateMs <= endDate
    })
}

/**
 * Filter bookmarks by AI recommendation status
 */
export function filterByRecommendation(
    bookmarks: CleanupBookmark[],
    recommendations: Map<string, AICleanupRecommendation>,
    status: 'delete' | 'keep' | 'review' | 'all'
): CleanupBookmark[] {
    if (status === 'all') return bookmarks
    return bookmarks.filter(bookmark => {
        const rec = recommendations.get(bookmark.id)
        return rec?.recommendation === status
    })
}

/**
 * Filter bookmarks by search query (matches title, URL, or path)
 */
export function filterBySearchQuery(bookmarks: Bookmark[], query: string): Bookmark[] {
    if (!query || query.trim() === '') return bookmarks
    const lowerQuery = query.toLowerCase().trim()
    return bookmarks.filter(bookmark => {
        const titleMatch = bookmark.title?.toLowerCase().includes(lowerQuery)
        const urlMatch = bookmark.url?.toLowerCase().includes(lowerQuery)
        const pathMatch = bookmark.path.some(segment =>
            segment.toLowerCase().includes(lowerQuery)
        )
        return titleMatch || urlMatch || pathMatch
    })
}

/**
 * Combine multiple filters with AND logic
 * All filters must pass for a bookmark to be included
 */
export function combineFilters(
    bookmarks: Bookmark[],
    filters: CleanupFilters,
    recommendations?: Map<string, AICleanupRecommendation>
): Bookmark[] {
    let result = [...bookmarks]

    // Apply domain filter
    if (filters.domain) {
        result = filterByDomain(result, filters.domain)
    }

    // Apply folder filter
    if (filters.folder && filters.folder.length > 0) {
        result = filterByFolder(result, filters.folder)
    }

    // Apply date range filter
    if (filters.dateRange) {
        result = filterByDateRange(result, filters.dateRange.start, filters.dateRange.end)
    }

    // Apply search query filter
    if (filters.searchQuery) {
        result = filterBySearchQuery(result, filters.searchQuery)
    }

    // Apply recommendation status filter
    if (filters.recommendationStatus && filters.recommendationStatus !== 'all' && recommendations) {
        result = filterByRecommendation(
            result as CleanupBookmark[],
            recommendations,
            filters.recommendationStatus
        )
    }

    return result
}

/**
 * Get unique domains from bookmarks
 */
export function getUniqueDomains(bookmarks: Bookmark[]): string[] {
    const domains = new Set<string>()
    for (const bookmark of bookmarks) {
        const host = getHostname(bookmark.url)
        if (host) {
            domains.add(host)
        }
    }
    return Array.from(domains).sort()
}

/**
 * Get unique top-level folders from bookmarks
 */
export function getUniqueFolders(bookmarks: Bookmark[]): string[] {
    const folders = new Set<string>()
    for (const bookmark of bookmarks) {
        if (bookmark.path.length > 0) {
            folders.add(bookmark.path[0])
        }
    }
    return Array.from(folders).sort()
}

/**
 * Get date range from bookmarks
 */
export function getDateRange(bookmarks: Bookmark[]): { min: number; max: number } | null {
    const dates = bookmarks
        .map(b => b.addDate)
        .filter((d): d is number => typeof d === 'number' && d > 0)

    if (dates.length === 0) return null

    return {
        min: Math.min(...dates) * 1000, // Convert to milliseconds
        max: Math.max(...dates) * 1000
    }
}
