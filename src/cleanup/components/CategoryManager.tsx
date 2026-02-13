/**
 * Category Manager Component
 * Manages folder structure and AI categorization suggestions
 */

import { useState } from 'react'
import { FolderPlus, Sparkles, Check, X, MoveRight, Loader2 } from 'lucide-react'
import type { Bookmark } from '@/utils/bookmarkParser'
import type { SuggestedFolder, BookmarkMove } from '@/cleanup/types'
import FolderTree from './FolderTree'

interface CategoryManagerProps {
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
}

export default function CategoryManager({
    bookmarks,
    suggestedFolders,
    pendingMoves,
    createdFolders,
    selectedBookmarkIds,
    isAnalyzing,
    onCreateFolder,
    onMoveBookmarks,
    onAcceptSuggestion,
    onRequestAICategorization
}: CategoryManagerProps) {
    const [selectedPath, setSelectedPath] = useState<string[]>([])
    const [newFolderName, setNewFolderName] = useState('')
    const [showNewFolderInput, setShowNewFolderInput] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleCreateFolder = () => {
        if (!newFolderName.trim()) {
            setError('请输入文件夹名称')
            return
        }

        const newPath = [...selectedPath, newFolderName.trim()]
        const success = onCreateFolder(newPath)

        if (success) {
            setNewFolderName('')
            setShowNewFolderInput(false)
            setError(null)
        } else {
            setError('该文件夹名称已存在')
        }
    }

    const handleMoveSelected = () => {
        if (selectedBookmarkIds.size === 0) return
        onMoveBookmarks(Array.from(selectedBookmarkIds), selectedPath)
    }

    const handleDropBookmarks = (bookmarkIds: string[], targetPath: string[]) => {
        onMoveBookmarks(bookmarkIds, targetPath)
    }

    return (
        <div className="space-y-6">
            {/* AI Categorization */}
            <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-purple-400" />
                        <h3 className="font-medium">AI 智能分类</h3>
                    </div>
                    <button
                        onClick={onRequestAICategorization}
                        disabled={isAnalyzing || bookmarks.length === 0}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isAnalyzing ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                分析中...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-4 h-4" />
                                获取分类建议
                            </>
                        )}
                    </button>
                </div>

                {/* Suggested Folders */}
                {suggestedFolders.length > 0 && (
                    <div className="space-y-3">
                        <h4 className="text-sm text-slate-400">AI 建议的文件夹结构：</h4>
                        {suggestedFolders.map((suggestion, index) => (
                            <div
                                key={index}
                                className="bg-slate-700/30 rounded-lg p-3 border border-slate-600/50"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-purple-400">
                                                {suggestion.path.join(' > ')}
                                            </span>
                                            <span className="text-xs text-slate-500">
                                                ({suggestion.suggestedBookmarkIds.length} 条书签)
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-400 mt-1">
                                            {suggestion.description}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => onAcceptSuggestion(suggestion)}
                                        className="flex items-center gap-1 px-3 py-1.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded text-sm transition"
                                    >
                                        <Check className="w-4 h-4" />
                                        应用
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {suggestedFolders.length === 0 && !isAnalyzing && (
                    <p className="text-sm text-slate-500 text-center py-4">
                        点击"获取分类建议"让 AI 分析您的书签并推荐最佳文件夹结构
                    </p>
                )}
            </div>

            {/* Folder Management */}
            <div className="grid grid-cols-2 gap-6">
                {/* Folder Tree */}
                <div>
                    <FolderTree
                        bookmarks={bookmarks}
                        selectedPath={selectedPath}
                        onSelectFolder={setSelectedPath}
                        onDropBookmarks={handleDropBookmarks}
                        highlightNew={createdFolders}
                        showBookmarks={true}
                    />
                </div>

                {/* Actions Panel */}
                <div className="space-y-4">
                    {/* Selected Folder Info */}
                    <div className="bg-slate-800/30 rounded-lg border border-slate-700 p-4">
                        <h4 className="text-sm font-medium mb-2">当前选中</h4>
                        <div className="text-sm text-slate-400">
                            {selectedPath.length > 0 ? (
                                <span className="text-sky-400">{selectedPath.join(' > ')}</span>
                            ) : (
                                <span>根目录</span>
                            )}
                        </div>
                    </div>

                    {/* Create New Folder */}
                    <div className="bg-slate-800/30 rounded-lg border border-slate-700 p-4">
                        <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                            <FolderPlus className="w-4 h-4 text-green-400" />
                            新建文件夹
                        </h4>

                        {showNewFolderInput ? (
                            <div className="space-y-2">
                                <div className="text-xs text-slate-500 mb-2">
                                    将在 "{selectedPath.length > 0 ? selectedPath.join(' > ') : '根目录'}" 下创建
                                </div>
                                <input
                                    type="text"
                                    value={newFolderName}
                                    onChange={(e) => {
                                        setNewFolderName(e.target.value)
                                        setError(null)
                                    }}
                                    placeholder="输入文件夹名称"
                                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-sm focus:outline-none focus:border-sky-500"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleCreateFolder()
                                        if (e.key === 'Escape') {
                                            setShowNewFolderInput(false)
                                            setNewFolderName('')
                                            setError(null)
                                        }
                                    }}
                                    autoFocus
                                />
                                {error && (
                                    <p className="text-xs text-red-400">{error}</p>
                                )}
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handleCreateFolder}
                                        className="flex items-center gap-1 px-3 py-1.5 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded text-sm transition"
                                    >
                                        <Check className="w-4 h-4" />
                                        创建
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowNewFolderInput(false)
                                            setNewFolderName('')
                                            setError(null)
                                        }}
                                        className="flex items-center gap-1 px-3 py-1.5 bg-slate-600 hover:bg-slate-500 rounded text-sm transition"
                                    >
                                        <X className="w-4 h-4" />
                                        取消
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={() => setShowNewFolderInput(true)}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded transition"
                            >
                                <FolderPlus className="w-4 h-4" />
                                新建文件夹
                            </button>
                        )}
                    </div>

                    {/* Move Selected Bookmarks */}
                    {selectedBookmarkIds.size > 0 && (
                        <div className="bg-slate-800/30 rounded-lg border border-slate-700 p-4">
                            <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                                <MoveRight className="w-4 h-4 text-sky-400" />
                                移动书签
                            </h4>
                            <p className="text-xs text-slate-500 mb-3">
                                将 {selectedBookmarkIds.size} 条选中的书签移动到当前选中的文件夹
                            </p>
                            <button
                                onClick={handleMoveSelected}
                                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-sky-500/20 hover:bg-sky-500/30 text-sky-400 rounded transition"
                            >
                                <MoveRight className="w-4 h-4" />
                                移动到 "{selectedPath.length > 0 ? selectedPath.join(' > ') : '根目录'}"
                            </button>
                        </div>
                    )}

                    {/* Pending Moves Summary */}
                    {pendingMoves.length > 0 && (
                        <div className="bg-amber-500/10 rounded-lg border border-amber-500/20 p-4">
                            <h4 className="text-sm font-medium text-amber-400 mb-2">
                                待处理的移动操作
                            </h4>
                            <p className="text-xs text-slate-400">
                                {pendingMoves.length} 条书签将被移动到新位置
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
