/**
 * Bookmark Selector Component
 * Displays bookmarks with selection checkboxes and AI recommendations
 */

import { useState, useMemo } from 'react'
import { CheckSquare, Square, ExternalLink, Trash2, AlertCircle, CheckCircle, HelpCircle } from 'lucide-react'
import type { Bookmark } from '../../utils/bookmarkParser'
import type { AICleanupRecommendation, CleanupFilters } from '../types'
import { combineFilters } from '../services/filterService'
import FilterPanel from './FilterPanel'

interface BookmarkSelectorProps {
    bookmarks: Bookmark[]
    selectedIds: Set<string>
    deletedIds: Set<string>
    recommendations: AICleanupRecommendation[]
    filters: CleanupFilters
    onToggleSelect: (id: string) => void
    onSelectAll: (ids: string[]) => void
    onDeselectAll: () => void
    onFiltersChange: (filters: Partial<CleanupFilters>) => void
    onClearFilters: () => void
}

const PAGE_SIZE = 50

export default function BookmarkSelector({
    bookmarks,
    selectedIds,
    deletedIds,
    recommendations,
    filters,
    onToggleSelect,
    onSelectAll,
    onDeselectAll,
    onFiltersChange,
    onClearFilters
}: BookmarkSelectorProps) {
    const [displayCount, setDisplayCount] = useState(PAGE_SIZE)

    // Create recommendation map for quick lookup
    const recommendationMap = useMemo(() => {
        const map = new Map<string, AICleanupRecommendation>()
        for (const rec of recommendations) {
            map.set(rec.bookmarkId, rec)
        }
        return map
    }, [recommendations])

    // Filter bookmarks (excluding deleted ones)
    const activeBookmarks = useMemo(() =>
        bookmarks.filter(b => !deletedIds.has(b.id)),
        [bookmarks, deletedIds]
    )

    const filteredBookmarks = useMemo(() =>
        combineFilters(activeBookmarks, filters, recommendationMap),
        [activeBookmarks, filters, recommendationMap]
    )

    // Paginated bookmarks
    const displayedBookmarks = useMemo(() =>
        filteredBookmarks.slice(0, displayCount),
        [filteredBookmarks, displayCount]
    )

    // Selection state
    const allSelected = filteredBookmarks.length > 0 &&
        filteredBookmarks.every(b => selectedIds.has(b.id))
    const someSelected = filteredBookmarks.some(b => selectedIds.has(b.id))

    const handleSelectAllToggle = () => {
        if (allSelected) {
            onDeselectAll()
        } else {
            onSelectAll(filteredBookmarks.map(b => b.id))
        }
    }

    const loadMore = () => {
        setDisplayCount(prev => Math.min(prev + PAGE_SIZE, filteredBookmarks.length))
    }

    const getRecommendationBadge = (rec: AICleanupRecommendation | undefined) => {
        if (!rec) return null

        const badges = {
            delete: {
                icon: Trash2,
                color: 'text-red-400 bg-red-500/10 border-red-500/20',
                label: '建议删除'
            },
            keep: {
                icon: CheckCircle,
                color: 'text-green-400 bg-green-500/10 border-green-500/20',
                label: '建议保留'
            },
            review: {
                icon: HelpCircle,
                color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
                label: '待审查'
            }
        }

        const badge = badges[rec.recommendation]
        const Icon = badge.icon

        return (
            <div className={`flex items-center gap-1 px-2 py-0.5 text-xs rounded border ${badge.color}`}>
                <Icon className="w-3 h-3" />
                <span>{badge.label}</span>
                <span className="opacity-60">({rec.confidence}%)</span>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {/* Filter Panel */}
            <FilterPanel
                bookmarks={activeBookmarks}
                filters={filters}
                recommendations={recommendations}
                filteredCount={filteredBookmarks.length}
                onFiltersChange={onFiltersChange}
                onClearFilters={onClearFilters}
            />

            {/* Selection Controls */}
            <div className="flex items-center justify-between bg-slate-800/30 rounded-lg p-3">
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleSelectAllToggle}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm bg-slate-700 hover:bg-slate-600 rounded transition"
                    >
                        {allSelected ? (
                            <CheckSquare className="w-4 h-4 text-sky-400" />
                        ) : someSelected ? (
                            <div className="w-4 h-4 border-2 border-sky-400 rounded bg-sky-400/30" />
                        ) : (
                            <Square className="w-4 h-4" />
                        )}
                        {allSelected ? '取消全选' : '全选'}
                    </button>

                    {selectedIds.size > 0 && (
                        <span className="text-sm text-slate-400">
                            已选择 <span className="text-sky-400 font-medium">{selectedIds.size}</span> 项
                        </span>
                    )}
                </div>

                <div className="text-sm text-slate-400">
                    共 {filteredBookmarks.length} 条书签
                </div>
            </div>

            {/* Bookmark List */}
            <div className="space-y-1">
                {displayedBookmarks.map(bookmark => {
                    const isSelected = selectedIds.has(bookmark.id)
                    const rec = recommendationMap.get(bookmark.id)

                    return (
                        <div
                            key={bookmark.id}
                            className={`flex items-start gap-3 p-3 rounded-lg border transition cursor-pointer ${isSelected
                                    ? 'bg-sky-500/10 border-sky-500/30'
                                    : 'bg-slate-800/30 border-slate-700/50 hover:bg-slate-800/50'
                                }`}
                            onClick={() => onToggleSelect(bookmark.id)}
                        >
                            {/* Checkbox */}
                            <div className="pt-0.5">
                                {isSelected ? (
                                    <CheckSquare className="w-5 h-5 text-sky-400" />
                                ) : (
                                    <Square className="w-5 h-5 text-slate-500" />
                                )}
                            </div>

                            {/* Bookmark Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-medium truncate">
                                            {bookmark.title || '无标题'}
                                        </h4>
                                        <a
                                            href={bookmark.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={(e) => e.stopPropagation()}
                                            className="text-xs text-slate-400 hover:text-sky-400 truncate block"
                                        >
                                            {bookmark.url}
                                        </a>
                                    </div>
                                    <a
                                        href={bookmark.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className="p-1 hover:bg-slate-600 rounded transition flex-shrink-0"
                                    >
                                        <ExternalLink className="w-4 h-4 text-slate-400" />
                                    </a>
                                </div>

                                <div className="flex items-center gap-2 mt-2 flex-wrap">
                                    {/* Path */}
                                    {bookmark.path.length > 0 && (
                                        <span className="text-xs text-slate-500 bg-slate-700/50 px-2 py-0.5 rounded">
                                            {bookmark.path.join(' > ')}
                                        </span>
                                    )}

                                    {/* Date */}
                                    {bookmark.addDate && (
                                        <span className="text-xs text-slate-500">
                                            {new Date(bookmark.addDate * 1000).toLocaleDateString()}
                                        </span>
                                    )}

                                    {/* AI Recommendation Badge */}
                                    {getRecommendationBadge(rec)}
                                </div>

                                {/* Recommendation Reason */}
                                {rec && rec.reason && (
                                    <p className="text-xs text-slate-400 mt-2 line-clamp-2">
                                        {rec.reason}
                                    </p>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Load More */}
            {displayCount < filteredBookmarks.length && (
                <div className="text-center pt-4">
                    <button
                        onClick={loadMore}
                        className="px-4 py-2 text-sm bg-slate-700 hover:bg-slate-600 rounded transition"
                    >
                        加载更多 ({filteredBookmarks.length - displayCount} 条剩余)
                    </button>
                </div>
            )}

            {/* Empty State */}
            {filteredBookmarks.length === 0 && (
                <div className="text-center py-12 text-slate-400">
                    <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>没有找到匹配的书签</p>
                    {Object.keys(filters).length > 0 && (
                        <button
                            onClick={onClearFilters}
                            className="mt-2 text-sm text-sky-400 hover:underline"
                        >
                            清除筛选条件
                        </button>
                    )}
                </div>
            )}
        </div>
    )
}
