/**
 * Organize Stage Component
 * Second stage of the cleanup workflow - organize bookmarks into folders
 */

import { ArrowLeft, ArrowRight } from 'lucide-react'
import type { Bookmark } from '@/utils/bookmarkParser'
import type { SuggestedFolder, BookmarkMove } from '@/cleanup/types'
import CategoryManager from '@/cleanup/components/CategoryManager'

interface OrganizeStageProps {
    bookmarks: Bookmark[]
    suggestedFolders: SuggestedFolder[]
    pendingMoves: BookmarkMove[]
    createdFolders: string[][]
    selectedBookmarkIds: Set<string>
    isAnalyzing: boolean
    onCreateFolder: (path: string[]) => boolean
    onMoveBookmarks: (bookmarkIds: string[], targetPath: string[]) => void
    onAcceptSuggestion: (suggestion: SuggestedFolder) => void
    onRequestAICategorization: () => void
    onPrevStage: () => void
    onNextStage: () => void
}

export default function OrganizeStage({
    bookmarks,
    suggestedFolders,
    pendingMoves,
    createdFolders,
    selectedBookmarkIds,
    isAnalyzing,
    onCreateFolder,
    onMoveBookmarks,
    onAcceptSuggestion,
    onRequestAICategorization,
    onPrevStage,
    onNextStage
}: OrganizeStageProps) {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold">整理与分类</h2>
                    <p className="text-sm text-slate-400 mt-1">
                        创建文件夹并整理书签，或让 AI 建议最佳的分类结构
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {/* Previous Stage Button */}
                    <button
                        onClick={onPrevStage}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded transition"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        上一步
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

            {/* Summary */}
            <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                        <div className="text-2xl font-bold text-slate-300">{bookmarks.length}</div>
                        <div className="text-xs text-slate-500">当前书签数</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-sky-400">{pendingMoves.length}</div>
                        <div className="text-xs text-slate-500">待移动</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-green-400">{createdFolders.length}</div>
                        <div className="text-xs text-slate-500">新建文件夹</div>
                    </div>
                </div>
            </div>

            {/* Category Manager */}
            <CategoryManager
                bookmarks={bookmarks}
                suggestedFolders={suggestedFolders}
                pendingMoves={pendingMoves}
                createdFolders={createdFolders}
                selectedBookmarkIds={selectedBookmarkIds}
                isAnalyzing={isAnalyzing}
                onCreateFolder={onCreateFolder}
                onMoveBookmarks={onMoveBookmarks}
                onAcceptSuggestion={onAcceptSuggestion}
                onRequestAICategorization={onRequestAICategorization}
            />
        </div>
    )
}
