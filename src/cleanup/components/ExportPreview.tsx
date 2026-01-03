/**
 * Export Preview Component
 * Shows final bookmark structure and change summary before export
 */

import { useMemo } from 'react'
import { Download, Trash2, MoveRight, FolderPlus, CheckCircle, AlertTriangle } from 'lucide-react'
import type { Bookmark } from '../../utils/bookmarkParser'
import type { ChangeSummary } from '../types'
import FolderTree from './FolderTree'

interface ExportPreviewProps {
    bookmarks: Bookmark[]
    changeSummary: ChangeSummary
    createdFolders: string[][]
    onExport: () => void
    onBack: () => void
}

export default function ExportPreview({
    bookmarks,
    changeSummary,
    createdFolders,
    onExport,
    onBack
}: ExportPreviewProps) {
    const hasChanges = changeSummary.deleted > 0 ||
        changeSummary.moved > 0 ||
        changeSummary.newFolders > 0

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-3 gap-4">
                {/* Deleted */}
                <div className="bg-red-500/10 rounded-lg border border-red-500/20 p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-500/20 rounded-lg">
                            <Trash2 className="w-5 h-5 text-red-400" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-red-400">
                                {changeSummary.deleted}
                            </div>
                            <div className="text-xs text-slate-400">已删除</div>
                        </div>
                    </div>
                </div>

                {/* Moved */}
                <div className="bg-sky-500/10 rounded-lg border border-sky-500/20 p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-sky-500/20 rounded-lg">
                            <MoveRight className="w-5 h-5 text-sky-400" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-sky-400">
                                {changeSummary.moved}
                            </div>
                            <div className="text-xs text-slate-400">已移动</div>
                        </div>
                    </div>
                </div>

                {/* New Folders */}
                <div className="bg-green-500/10 rounded-lg border border-green-500/20 p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-500/20 rounded-lg">
                            <FolderPlus className="w-5 h-5 text-green-400" />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-green-400">
                                {changeSummary.newFolders}
                            </div>
                            <div className="text-xs text-slate-400">新文件夹</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Final Bookmark Count */}
            <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        <span className="font-medium">最终书签数量</span>
                    </div>
                    <span className="text-2xl font-bold text-green-400">
                        {bookmarks.length}
                    </span>
                </div>
            </div>

            {/* Change Details */}
            {hasChanges && (
                <div className="bg-slate-800/30 rounded-lg border border-slate-700 overflow-hidden">
                    <div className="p-4 border-b border-slate-700">
                        <h3 className="font-medium">变更详情</h3>
                    </div>
                    <div className="p-4 space-y-4 max-h-64 overflow-y-auto">
                        {/* Deleted Bookmarks */}
                        {changeSummary.deletedBookmarks.length > 0 && (
                            <div>
                                <h4 className="text-sm text-red-400 mb-2 flex items-center gap-2">
                                    <Trash2 className="w-4 h-4" />
                                    删除的书签 ({changeSummary.deletedBookmarks.length})
                                </h4>
                                <div className="space-y-1">
                                    {changeSummary.deletedBookmarks.slice(0, 10).map(bookmark => (
                                        <div
                                            key={bookmark.id}
                                            className="text-xs text-slate-400 bg-slate-700/30 px-2 py-1 rounded truncate"
                                        >
                                            {bookmark.title || bookmark.url}
                                        </div>
                                    ))}
                                    {changeSummary.deletedBookmarks.length > 10 && (
                                        <div className="text-xs text-slate-500">
                                            ... 还有 {changeSummary.deletedBookmarks.length - 10} 条
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Moved Bookmarks */}
                        {changeSummary.movedBookmarks.length > 0 && (
                            <div>
                                <h4 className="text-sm text-sky-400 mb-2 flex items-center gap-2">
                                    <MoveRight className="w-4 h-4" />
                                    移动的书签 ({changeSummary.movedBookmarks.length})
                                </h4>
                                <div className="space-y-1">
                                    {changeSummary.movedBookmarks.slice(0, 10).map(({ bookmark, fromPath, toPath }) => (
                                        <div
                                            key={bookmark.id}
                                            className="text-xs bg-slate-700/30 px-2 py-1 rounded"
                                        >
                                            <div className="text-slate-300 truncate">
                                                {bookmark.title || bookmark.url}
                                            </div>
                                            <div className="text-slate-500 flex items-center gap-1">
                                                <span>{fromPath.join(' > ') || '根目录'}</span>
                                                <MoveRight className="w-3 h-3" />
                                                <span className="text-sky-400">{toPath.join(' > ') || '根目录'}</span>
                                            </div>
                                        </div>
                                    ))}
                                    {changeSummary.movedBookmarks.length > 10 && (
                                        <div className="text-xs text-slate-500">
                                            ... 还有 {changeSummary.movedBookmarks.length - 10} 条
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* New Folders */}
                        {changeSummary.createdFolderPaths.length > 0 && (
                            <div>
                                <h4 className="text-sm text-green-400 mb-2 flex items-center gap-2">
                                    <FolderPlus className="w-4 h-4" />
                                    新建的文件夹 ({changeSummary.createdFolderPaths.length})
                                </h4>
                                <div className="space-y-1">
                                    {changeSummary.createdFolderPaths.map((path, index) => (
                                        <div
                                            key={index}
                                            className="text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded"
                                        >
                                            {path.join(' > ')}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Folder Tree Preview */}
            <div>
                <h3 className="font-medium mb-3">最终文件夹结构预览</h3>
                <FolderTree
                    bookmarks={bookmarks}
                    selectedPath={[]}
                    onSelectFolder={() => { }}
                    highlightNew={createdFolders}
                    showBookmarks={false}
                />
            </div>

            {/* Warning if no changes */}
            {!hasChanges && (
                <div className="bg-amber-500/10 rounded-lg border border-amber-500/20 p-4 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-medium text-amber-400">没有任何变更</h4>
                        <p className="text-sm text-slate-400 mt-1">
                            您还没有进行任何删除或整理操作。导出的文件将与原始书签相同。
                        </p>
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-700">
                <button
                    onClick={onBack}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded transition"
                >
                    返回修改
                </button>
                <button
                    onClick={onExport}
                    className="flex items-center gap-2 px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded transition"
                >
                    <Download className="w-4 h-4" />
                    导出 HTML 文件
                </button>
            </div>
        </div>
    )
}
