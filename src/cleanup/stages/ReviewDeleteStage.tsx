/**
 * Review & Delete Stage Component
 * First stage of the cleanup workflow - review bookmarks and delete unwanted ones
 */

import { Trash2, Sparkles, ArrowRight, Loader2 } from 'lucide-react'
import type { Bookmark } from '@/utils/bookmarkParser'
import type { AICleanupRecommendation, CleanupFilters, RecommendationType } from '@/cleanup/types'
import BookmarkSelector from '@/cleanup/components/BookmarkSelector'
import AIRecommendations from '@/cleanup/components/AIRecommendations'

interface ReviewDeleteStageProps {
    bookmarks: Bookmark[]
    selectedIds: Set<string>
    deletedIds: Set<string>
    recommendations: AICleanupRecommendation[]
    filters: CleanupFilters
    isAnalyzing: boolean
    analysisError: string | null
    onToggleSelect: (id: string) => void
    onSelectAll: (ids: string[]) => void
    onDeselectAll: () => void
    onSelectByRecommendation: (type: RecommendationType) => void
    onFiltersChange: (filters: Partial<CleanupFilters>) => void
    onClearFilters: () => void
    onDeleteSelected: () => void
    onRequestAIAnalysis: () => void
    onAcceptRecommendation: (bookmarkId: string) => void
    onRejectRecommendation: (bookmarkId: string) => void
    onAcceptAllRecommendations: (type: RecommendationType) => void
    onNextStage: () => void
}

export default function ReviewDeleteStage({
    bookmarks,
    selectedIds,
    deletedIds,
    recommendations,
    filters,
    isAnalyzing,
    analysisError,
    onToggleSelect,
    onSelectAll,
    onDeselectAll,
    onSelectByRecommendation,
    onFiltersChange,
    onClearFilters,
    onDeleteSelected,
    onRequestAIAnalysis,
    onAcceptRecommendation,
    onRejectRecommendation,
    onAcceptAllRecommendations,
    onNextStage
}: ReviewDeleteStageProps) {
    const activeBookmarks = bookmarks.filter(b => !deletedIds.has(b.id))
    const hasRecommendations = recommendations.length > 0

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold">审查与删除</h2>
                    <p className="text-sm text-slate-400 mt-1">
                        选择要删除的书签，或让 AI 帮你分析哪些书签可以清理
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {/* AI Analysis Button */}
                    <button
                        onClick={onRequestAIAnalysis}
                        disabled={isAnalyzing || activeBookmarks.length === 0}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isAnalyzing ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                AI 分析中...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-4 h-4" />
                                AI 智能分析
                            </>
                        )}
                    </button>

                    {/* Delete Button */}
                    <button
                        onClick={onDeleteSelected}
                        disabled={selectedIds.size === 0}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Trash2 className="w-4 h-4" />
                        删除选中 ({selectedIds.size})
                    </button>

                    {/* Next Stage Button */}
                    <button
                        onClick={onNextStage}
                        className="flex items-center gap-2 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded transition"
                    >
                        下一步
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Error Message */}
            {analysisError && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400">
                    <p className="text-sm">{analysisError}</p>
                </div>
            )}

            {/* Deleted Count */}
            {deletedIds.size > 0 && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-center justify-between">
                    <span className="text-sm text-red-400">
                        已标记删除 {deletedIds.size} 条书签
                    </span>
                    <span className="text-xs text-slate-500">
                        这些书签将在导出时被排除
                    </span>
                </div>
            )}

            {/* Main Content */}
            <div className={hasRecommendations ? 'grid grid-cols-2 gap-6' : ''}>
                {/* Bookmark Selector */}
                <div className={hasRecommendations ? '' : 'max-w-4xl'}>
                    <BookmarkSelector
                        bookmarks={bookmarks}
                        selectedIds={selectedIds}
                        deletedIds={deletedIds}
                        recommendations={recommendations}
                        filters={filters}
                        onToggleSelect={onToggleSelect}
                        onSelectAll={onSelectAll}
                        onDeselectAll={onDeselectAll}
                        onFiltersChange={onFiltersChange}
                        onClearFilters={onClearFilters}
                    />
                </div>

                {/* AI Recommendations */}
                {hasRecommendations && (
                    <div>
                        <AIRecommendations
                            recommendations={recommendations}
                            bookmarks={activeBookmarks}
                            onAccept={onAcceptRecommendation}
                            onReject={onRejectRecommendation}
                            onAcceptAll={onAcceptAllRecommendations}
                            onSelectByType={onSelectByRecommendation}
                        />
                    </div>
                )}
            </div>
        </div>
    )
}
