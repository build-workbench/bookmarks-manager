/**
 * AI Recommendations Component
 * Displays AI cleanup recommendations grouped by type
 */

import { useState, useMemo } from 'react'
import { Trash2, CheckCircle, HelpCircle, Check, X, ChevronDown, ChevronRight } from 'lucide-react'
import type { Bookmark } from '@/utils/bookmarkParser'
import type { AICleanupRecommendation, RecommendationType } from '@/cleanup/types'
import { groupRecommendationsByType, getRecommendationStats } from '@/ai/cleanupAnalysis'

interface AIRecommendationsProps {
    recommendations: AICleanupRecommendation[]
    bookmarks: Bookmark[]
    onAccept: (bookmarkId: string) => void
    onReject: (bookmarkId: string) => void
    onAcceptAll: (type: RecommendationType) => void
    onSelectByType: (type: RecommendationType) => void
}

interface RecommendationGroupProps {
    type: RecommendationType
    recommendations: AICleanupRecommendation[]
    bookmarks: Bookmark[]
    onAccept: (bookmarkId: string) => void
    onReject: (bookmarkId: string) => void
    onAcceptAll: () => void
    onSelectAll: () => void
    isExpanded: boolean
    onToggleExpand: () => void
}

const GROUP_CONFIG = {
    delete: {
        icon: Trash2,
        title: '建议删除',
        description: '这些书签可能已过时、无效或低质量',
        color: 'text-red-400',
        bgColor: 'bg-red-500/10',
        borderColor: 'border-red-500/20'
    },
    keep: {
        icon: CheckCircle,
        title: '建议保留',
        description: '这些书签看起来有价值，建议保留',
        color: 'text-green-400',
        bgColor: 'bg-green-500/10',
        borderColor: 'border-green-500/20'
    },
    review: {
        icon: HelpCircle,
        title: '需要审查',
        description: '这些书签需要您手动判断是否保留',
        color: 'text-amber-400',
        bgColor: 'bg-amber-500/10',
        borderColor: 'border-amber-500/20'
    }
}

function RecommendationGroup({
    type,
    recommendations,
    bookmarks,
    onAccept,
    onReject,
    onAcceptAll,
    onSelectAll,
    isExpanded,
    onToggleExpand
}: RecommendationGroupProps) {
    const config = GROUP_CONFIG[type]
    const Icon = config.icon

    // Create bookmark map for quick lookup
    const bookmarkMap = useMemo(() => {
        const map = new Map<string, Bookmark>()
        for (const b of bookmarks) {
            map.set(b.id, b)
        }
        return map
    }, [bookmarks])

    // Filter out already processed recommendations
    const pendingRecs = recommendations.filter(r => !r.accepted && !r.rejected)
    const acceptedCount = recommendations.filter(r => r.accepted).length
    const rejectedCount = recommendations.filter(r => r.rejected).length

    if (recommendations.length === 0) return null

    return (
        <div className={`rounded-lg border ${config.borderColor} ${config.bgColor} overflow-hidden`}>
            {/* Header */}
            <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition"
                onClick={onToggleExpand}
            >
                <div className="flex items-center gap-3">
                    {isExpanded ? (
                        <ChevronDown className={`w-5 h-5 ${config.color}`} />
                    ) : (
                        <ChevronRight className={`w-5 h-5 ${config.color}`} />
                    )}
                    <Icon className={`w-5 h-5 ${config.color}`} />
                    <div>
                        <h3 className={`font-medium ${config.color}`}>
                            {config.title}
                            <span className="ml-2 text-sm opacity-70">({recommendations.length})</span>
                        </h3>
                        <p className="text-xs text-slate-400">{config.description}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {acceptedCount > 0 && (
                        <span className="text-xs text-green-400 bg-green-500/20 px-2 py-0.5 rounded">
                            已接受 {acceptedCount}
                        </span>
                    )}
                    {rejectedCount > 0 && (
                        <span className="text-xs text-slate-400 bg-slate-500/20 px-2 py-0.5 rounded">
                            已拒绝 {rejectedCount}
                        </span>
                    )}
                    {type === 'delete' && pendingRecs.length > 0 && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                onSelectAll()
                            }}
                            className="px-3 py-1 text-xs bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded transition"
                        >
                            选中全部
                        </button>
                    )}
                </div>
            </div>

            {/* Content */}
            {isExpanded && (
                <div className="border-t border-slate-700/50">
                    {/* Batch Actions */}
                    {pendingRecs.length > 0 && (
                        <div className="flex items-center gap-2 p-3 bg-slate-800/30">
                            <button
                                onClick={onAcceptAll}
                                className="flex items-center gap-1 px-3 py-1.5 text-xs bg-slate-700 hover:bg-slate-600 rounded transition"
                            >
                                <Check className="w-3 h-3" />
                                全部接受建议
                            </button>
                            <span className="text-xs text-slate-500">
                                {pendingRecs.length} 条待处理
                            </span>
                        </div>
                    )}

                    {/* Recommendation List */}
                    <div className="divide-y divide-slate-700/30">
                        {recommendations.map(rec => {
                            const bookmark = bookmarkMap.get(rec.bookmarkId)
                            if (!bookmark) return null

                            return (
                                <div
                                    key={rec.bookmarkId}
                                    className={`p-3 ${rec.accepted ? 'bg-green-500/5' :
                                        rec.rejected ? 'bg-slate-500/5 opacity-50' : ''
                                        }`}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-medium truncate">
                                                {bookmark.title || '无标题'}
                                            </h4>
                                            <a
                                                href={bookmark.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-xs text-slate-400 hover:text-sky-400 truncate block"
                                            >
                                                {bookmark.url}
                                            </a>
                                            <p className="text-xs text-slate-500 mt-1">
                                                {rec.reason}
                                            </p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className="text-xs text-slate-500">
                                                    置信度: {rec.confidence}%
                                                </span>
                                                <span className="text-xs text-slate-600">|</span>
                                                <span className="text-xs text-slate-500">
                                                    原因: {rec.reasonType}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        {!rec.accepted && !rec.rejected && (
                                            <div className="flex items-center gap-1 flex-shrink-0">
                                                <button
                                                    onClick={() => onAccept(rec.bookmarkId)}
                                                    className="p-1.5 hover:bg-green-500/20 text-green-400 rounded transition"
                                                    title="接受建议"
                                                >
                                                    <Check className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => onReject(rec.bookmarkId)}
                                                    className="p-1.5 hover:bg-slate-500/20 text-slate-400 rounded transition"
                                                    title="拒绝建议"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}

                                        {rec.accepted && (
                                            <span className="text-xs text-green-400 bg-green-500/20 px-2 py-1 rounded">
                                                已接受
                                            </span>
                                        )}

                                        {rec.rejected && (
                                            <span className="text-xs text-slate-400 bg-slate-500/20 px-2 py-1 rounded">
                                                已拒绝
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}

export default function AIRecommendations({
    recommendations,
    bookmarks,
    onAccept,
    onReject,
    onAcceptAll,
    onSelectByType
}: AIRecommendationsProps) {
    const [expandedGroups, setExpandedGroups] = useState<Set<RecommendationType>>(
        new Set(['delete', 'review'])
    )

    // Group recommendations by type
    const groups = useMemo(() =>
        groupRecommendationsByType(recommendations),
        [recommendations]
    )

    // Get stats
    const stats = useMemo(() =>
        getRecommendationStats(recommendations),
        [recommendations]
    )

    const toggleGroup = (type: RecommendationType) => {
        setExpandedGroups(prev => {
            const next = new Set(prev)
            if (next.has(type)) {
                next.delete(type)
            } else {
                next.add(type)
            }
            return next
        })
    }

    if (recommendations.length === 0) {
        return null
    }

    return (
        <div className="space-y-4">
            {/* Summary */}
            <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                <h3 className="text-sm font-medium mb-3">AI 分析摘要</h3>
                <div className="grid grid-cols-4 gap-4 text-center">
                    <div>
                        <div className="text-2xl font-bold text-slate-300">{stats.total}</div>
                        <div className="text-xs text-slate-500">总分析</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-red-400">{stats.delete}</div>
                        <div className="text-xs text-slate-500">建议删除</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-green-400">{stats.keep}</div>
                        <div className="text-xs text-slate-500">建议保留</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-amber-400">{stats.review}</div>
                        <div className="text-xs text-slate-500">待审查</div>
                    </div>
                </div>
                <div className="mt-3 text-center">
                    <span className="text-xs text-slate-500">
                        平均置信度: {stats.avgConfidence}%
                    </span>
                </div>
            </div>

            {/* Recommendation Groups */}
            <div className="space-y-3">
                {(['delete', 'review', 'keep'] as RecommendationType[]).map(type => (
                    <RecommendationGroup
                        key={type}
                        type={type}
                        recommendations={groups.get(type) || []}
                        bookmarks={bookmarks}
                        onAccept={onAccept}
                        onReject={onReject}
                        onAcceptAll={() => onAcceptAll(type)}
                        onSelectAll={() => onSelectByType(type)}
                        isExpanded={expandedGroups.has(type)}
                        onToggleExpand={() => toggleGroup(type)}
                    />
                ))}
            </div>
        </div>
    )
}
