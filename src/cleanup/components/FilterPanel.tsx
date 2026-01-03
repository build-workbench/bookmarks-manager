/**
 * Filter Panel Component
 * Provides filtering controls for the cleanup workflow
 */

import { useState, useMemo } from 'react'
import { Filter, X, Calendar, Folder, Globe, Tag } from 'lucide-react'
import type { Bookmark } from '../../utils/bookmarkParser'
import type { CleanupFilters, AICleanupRecommendation, RecommendationType } from '../types'
import { getUniqueDomains, getUniqueFolders, getDateRange } from '../services/filterService'

interface FilterPanelProps {
    bookmarks: Bookmark[]
    filters: CleanupFilters
    recommendations: AICleanupRecommendation[]
    filteredCount: number
    onFiltersChange: (filters: Partial<CleanupFilters>) => void
    onClearFilters: () => void
}

export default function FilterPanel({
    bookmarks,
    filters,
    recommendations,
    filteredCount,
    onFiltersChange,
    onClearFilters
}: FilterPanelProps) {
    const [isExpanded, setIsExpanded] = useState(false)

    // Get unique values for filter options
    const domains = useMemo(() => getUniqueDomains(bookmarks), [bookmarks])
    const folders = useMemo(() => getUniqueFolders(bookmarks), [bookmarks])
    const dateRange = useMemo(() => getDateRange(bookmarks), [bookmarks])

    // Check if any filters are active
    const hasActiveFilters = !!(
        filters.domain ||
        (filters.folder && filters.folder.length > 0) ||
        filters.dateRange ||
        (filters.recommendationStatus && filters.recommendationStatus !== 'all') ||
        filters.searchQuery
    )

    // Get recommendation counts
    const recCounts = useMemo(() => {
        const counts = { delete: 0, keep: 0, review: 0 }
        for (const rec of recommendations) {
            counts[rec.recommendation]++
        }
        return counts
    }, [recommendations])

    return (
        <div className="bg-slate-800/50 rounded-lg border border-slate-700">
            {/* Header */}
            <div
                className="flex items-center justify-between p-3 cursor-pointer hover:bg-slate-700/30 transition"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-medium">筛选</span>
                    {hasActiveFilters && (
                        <span className="px-2 py-0.5 text-xs bg-sky-500/20 text-sky-400 rounded">
                            已启用
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-400">
                        {filteredCount} / {bookmarks.length} 条
                    </span>
                    {hasActiveFilters && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                onClearFilters()
                            }}
                            className="p-1 hover:bg-slate-600 rounded transition"
                            title="清除筛选"
                        >
                            <X className="w-4 h-4 text-slate-400" />
                        </button>
                    )}
                </div>
            </div>

            {/* Filter Controls */}
            {isExpanded && (
                <div className="p-4 border-t border-slate-700 space-y-4">
                    {/* Search Query */}
                    <div>
                        <label className="block text-xs text-slate-400 mb-1">搜索</label>
                        <input
                            type="text"
                            value={filters.searchQuery || ''}
                            onChange={(e) => onFiltersChange({ searchQuery: e.target.value || undefined })}
                            placeholder="搜索标题、URL或路径..."
                            className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-sm focus:outline-none focus:border-sky-500"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* Domain Filter */}
                        <div>
                            <label className="flex items-center gap-1 text-xs text-slate-400 mb-1">
                                <Globe className="w-3 h-3" />
                                域名
                            </label>
                            <select
                                value={filters.domain || ''}
                                onChange={(e) => onFiltersChange({ domain: e.target.value || undefined })}
                                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-sm focus:outline-none focus:border-sky-500"
                            >
                                <option value="">全部域名</option>
                                {domains.slice(0, 50).map(domain => (
                                    <option key={domain} value={domain}>{domain}</option>
                                ))}
                            </select>
                        </div>

                        {/* Folder Filter */}
                        <div>
                            <label className="flex items-center gap-1 text-xs text-slate-400 mb-1">
                                <Folder className="w-3 h-3" />
                                文件夹
                            </label>
                            <select
                                value={filters.folder?.[0] || ''}
                                onChange={(e) => onFiltersChange({
                                    folder: e.target.value ? [e.target.value] : undefined
                                })}
                                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-sm focus:outline-none focus:border-sky-500"
                            >
                                <option value="">全部文件夹</option>
                                {folders.map(folder => (
                                    <option key={folder} value={folder}>{folder}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Date Range Filter */}
                    {dateRange && (
                        <div>
                            <label className="flex items-center gap-1 text-xs text-slate-400 mb-1">
                                <Calendar className="w-3 h-3" />
                                添加时间
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="date"
                                    value={filters.dateRange?.start
                                        ? new Date(filters.dateRange.start).toISOString().split('T')[0]
                                        : ''}
                                    onChange={(e) => {
                                        const start = e.target.value ? new Date(e.target.value).getTime() : undefined
                                        if (start) {
                                            onFiltersChange({
                                                dateRange: {
                                                    start,
                                                    end: filters.dateRange?.end || Date.now()
                                                }
                                            })
                                        } else {
                                            onFiltersChange({ dateRange: undefined })
                                        }
                                    }}
                                    className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded text-sm focus:outline-none focus:border-sky-500"
                                />
                                <span className="text-slate-500">至</span>
                                <input
                                    type="date"
                                    value={filters.dateRange?.end
                                        ? new Date(filters.dateRange.end).toISOString().split('T')[0]
                                        : ''}
                                    onChange={(e) => {
                                        const end = e.target.value ? new Date(e.target.value).getTime() : undefined
                                        if (end && filters.dateRange?.start) {
                                            onFiltersChange({
                                                dateRange: {
                                                    start: filters.dateRange.start,
                                                    end
                                                }
                                            })
                                        }
                                    }}
                                    className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded text-sm focus:outline-none focus:border-sky-500"
                                />
                            </div>
                        </div>
                    )}

                    {/* Recommendation Status Filter */}
                    {recommendations.length > 0 && (
                        <div>
                            <label className="flex items-center gap-1 text-xs text-slate-400 mb-2">
                                <Tag className="w-3 h-3" />
                                AI建议状态
                            </label>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => onFiltersChange({ recommendationStatus: 'all' })}
                                    className={`px-3 py-1.5 text-xs rounded transition ${!filters.recommendationStatus || filters.recommendationStatus === 'all'
                                            ? 'bg-slate-600 text-white'
                                            : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                                        }`}
                                >
                                    全部
                                </button>
                                <button
                                    onClick={() => onFiltersChange({ recommendationStatus: 'delete' })}
                                    className={`px-3 py-1.5 text-xs rounded transition flex items-center gap-1 ${filters.recommendationStatus === 'delete'
                                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                            : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                                        }`}
                                >
                                    建议删除
                                    <span className="text-xs opacity-70">({recCounts.delete})</span>
                                </button>
                                <button
                                    onClick={() => onFiltersChange({ recommendationStatus: 'keep' })}
                                    className={`px-3 py-1.5 text-xs rounded transition flex items-center gap-1 ${filters.recommendationStatus === 'keep'
                                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                            : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                                        }`}
                                >
                                    建议保留
                                    <span className="text-xs opacity-70">({recCounts.keep})</span>
                                </button>
                                <button
                                    onClick={() => onFiltersChange({ recommendationStatus: 'review' })}
                                    className={`px-3 py-1.5 text-xs rounded transition flex items-center gap-1 ${filters.recommendationStatus === 'review'
                                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                            : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                                        }`}
                                >
                                    待审查
                                    <span className="text-xs opacity-70">({recCounts.review})</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
