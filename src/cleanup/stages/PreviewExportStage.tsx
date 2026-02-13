/**
 * Preview & Export Stage Component
 * Final stage of the cleanup workflow - preview changes and export
 */

import { ArrowLeft } from 'lucide-react'
import type { Bookmark } from '@/utils/bookmarkParser'
import type { ChangeSummary } from '@/cleanup/types'
import ExportPreview from '@/cleanup/components/ExportPreview'

interface PreviewExportStageProps {
    bookmarks: Bookmark[]
    changeSummary: ChangeSummary
    createdFolders: string[][]
    onExport: () => void
    onPrevStage: () => void
}

export default function PreviewExportStage({
    bookmarks,
    changeSummary,
    createdFolders,
    onExport,
    onPrevStage
}: PreviewExportStageProps) {
    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold">预览与导出</h2>
                    <p className="text-sm text-slate-400 mt-1">
                        确认变更内容，然后导出为 HTML 文件导入浏览器
                    </p>
                </div>
                <button
                    onClick={onPrevStage}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded transition"
                >
                    <ArrowLeft className="w-4 h-4" />
                    返回修改
                </button>
            </div>

            {/* Export Preview */}
            <ExportPreview
                bookmarks={bookmarks}
                changeSummary={changeSummary}
                createdFolders={createdFolders}
                onExport={onExport}
                onBack={onPrevStage}
            />
        </div>
    )
}
