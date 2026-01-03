/**
 * Cleanup Workflow Container
 * Main container component that orchestrates the cleanup workflow stages
 */

import { useEffect, useCallback } from 'react'
import { Undo2, Save, RotateCcw, CheckCircle, Circle, AlertTriangle } from 'lucide-react'
import useCleanupStore from '../store/useCleanupStore'
import useBookmarksStore from '../store/useBookmarksStore'
import { getAIConfig } from '../utils/db'
import { analyzeForCleanup, suggestFolderStructure } from '../ai/cleanupAnalysis'
import { getUniqueFolders } from './services/filterService'
import ReviewDeleteStage from './stages/ReviewDeleteStage'
import OrganizeStage from './stages/OrganizeStage'
import PreviewExportStage from './stages/PreviewExportStage'
import type { CleanupStage } from './types'

const STAGES: { key: CleanupStage; label: string }[] = [
    { key: 'review', label: '审查删除' },
    { key: 'organize', label: '整理分类' },
    { key: 'preview', label: '预览导出' }
]

export default function CleanupWorkflow() {
    const bookmarksStore = useBookmarksStore()
    const cleanupStore = useCleanupStore()

    const {
        currentStage,
        workflowStarted,
        hasUnsavedChanges,
        workingBookmarks,
        selectedBookmarkIds,
        deletedBookmarkIds,
        aiRecommendations,
        isAnalyzing,
        analysisError,
        suggestedFolders,
        pendingMoves,
        createdFolders,
        filters,
        initWorkflow,
        setStage,
        nextStage,
        prevStage,
        toggleBookmarkSelection,
        selectAll,
        deselectAll,
        selectByRecommendation,
        deleteSelected,
        setAIRecommendations,
        setIsAnalyzing,
        setAnalysisError,
        acceptRecommendation,
        rejectRecommendation,
        acceptAllRecommendations,
        setSuggestedFolders,
        moveBookmarksToFolder,
        createFolder,
        acceptFolderSuggestion,
        undo,
        canUndo,
        setFilters,
        clearFilters,
        saveSession,
        resetWorkflow,
        getChangeSummary,
        getActiveBookmarks,
        exportBookmarks
    } = cleanupStore

    // Initialize workflow when component mounts
    useEffect(() => {
        if (!workflowStarted && bookmarksStore.mergedItems.length > 0) {
            initWorkflow(bookmarksStore.mergedItems)
        }
    }, [workflowStarted, bookmarksStore.mergedItems, initWorkflow])

    // Warn before leaving with unsaved changes
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (hasUnsavedChanges) {
                e.preventDefault()
                e.returnValue = ''
            }
        }

        window.addEventListener('beforeunload', handleBeforeUnload)
        return () => window.removeEventListener('beforeunload', handleBeforeUnload)
    }, [hasUnsavedChanges])

    // Request AI cleanup analysis
    const handleRequestAIAnalysis = useCallback(async () => {
        const activeBookmarks = getActiveBookmarks()
        if (activeBookmarks.length === 0) return

        setIsAnalyzing(true)
        setAnalysisError(null)

        try {
            const config = await getAIConfig()
            if (!config) {
                setAnalysisError('请先在 AI 设置页面配置 API Key')
                return
            }

            const recommendations = await analyzeForCleanup(
                {
                    provider: config.provider,
                    apiKey: config.apiKey,
                    model: config.model,
                    baseUrl: config.baseUrl,
                    maxTokens: config.maxTokens,
                    temperature: config.temperature
                },
                activeBookmarks,
                {
                    batchSize: 20,
                    onProgress: (processed, total) => {
                        console.log(`AI Analysis: ${processed}/${total}`)
                    }
                }
            )

            setAIRecommendations(recommendations)
        } catch (error) {
            const message = error instanceof Error ? error.message : '分析失败，请重试'
            setAnalysisError(message)
        } finally {
            setIsAnalyzing(false)
        }
    }, [getActiveBookmarks, setIsAnalyzing, setAnalysisError, setAIRecommendations])

    // Request AI categorization
    const handleRequestAICategorization = useCallback(async () => {
        const activeBookmarks = getActiveBookmarks()
        if (activeBookmarks.length === 0) return

        setIsAnalyzing(true)
        setAnalysisError(null)

        try {
            const config = await getAIConfig()
            if (!config) {
                setAnalysisError('请先在 AI 设置页面配置 API Key')
                return
            }

            const existingFolders = getUniqueFolders(activeBookmarks)
            const suggestions = await suggestFolderStructure(
                {
                    provider: config.provider,
                    apiKey: config.apiKey,
                    model: config.model,
                    baseUrl: config.baseUrl,
                    maxTokens: config.maxTokens,
                    temperature: config.temperature
                },
                activeBookmarks,
                existingFolders
            )

            setSuggestedFolders(suggestions)
        } catch (error) {
            const message = error instanceof Error ? error.message : '分析失败，请重试'
            setAnalysisError(message)
        } finally {
            setIsAnalyzing(false)
        }
    }, [getActiveBookmarks, setIsAnalyzing, setAnalysisError, setSuggestedFolders])

    // Handle export
    const handleExport = useCallback(() => {
        const html = exportBookmarks()
        const blob = new Blob([html], { type: 'text/html' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `bookmarks-cleaned-${new Date().toISOString().split('T')[0]}.html`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        // Reset workflow after successful export
        resetWorkflow()
    }, [exportBookmarks, resetWorkflow])

    // Get active bookmarks for current stage
    const activeBookmarks = getActiveBookmarks()
    const changeSummary = getChangeSummary()

    // Show loading state if bookmarks not loaded
    if (bookmarksStore.mergedItems.length === 0) {
        return (
            <div className="text-center py-12">
                <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-amber-400" />
                <h2 className="text-xl font-semibold mb-2">没有书签数据</h2>
                <p className="text-slate-400">
                    请先在"上传合并"页面导入书签文件
                </p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Progress Indicator */}
            <div className="bg-slate-800/50 rounded-lg border border-slate-700 p-4">
                <div className="flex items-center justify-between">
                    {/* Stage Steps */}
                    <div className="flex items-center gap-4">
                        {STAGES.map((stage, index) => {
                            const isActive = stage.key === currentStage
                            const isPast = STAGES.findIndex(s => s.key === currentStage) > index

                            return (
                                <div key={stage.key} className="flex items-center gap-2">
                                    {index > 0 && (
                                        <div className={`w-8 h-0.5 ${isPast ? 'bg-sky-500' : 'bg-slate-600'}`} />
                                    )}
                                    <button
                                        onClick={() => setStage(stage.key)}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded transition ${isActive
                                                ? 'bg-sky-500/20 text-sky-400'
                                                : isPast
                                                    ? 'text-slate-300 hover:bg-slate-700'
                                                    : 'text-slate-500 hover:bg-slate-700'
                                            }`}
                                    >
                                        {isPast ? (
                                            <CheckCircle className="w-4 h-4 text-green-400" />
                                        ) : (
                                            <Circle className={`w-4 h-4 ${isActive ? 'text-sky-400' : ''}`} />
                                        )}
                                        <span className="text-sm font-medium">{stage.label}</span>
                                    </button>
                                </div>
                            )
                        })}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        {/* Undo Button */}
                        <button
                            onClick={undo}
                            disabled={!canUndo()}
                            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-slate-700 hover:bg-slate-600 rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
                            title="撤销"
                        >
                            <Undo2 className="w-4 h-4" />
                            撤销
                        </button>

                        {/* Save Button */}
                        <button
                            onClick={saveSession}
                            disabled={!hasUnsavedChanges}
                            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-slate-700 hover:bg-slate-600 rounded transition disabled:opacity-50 disabled:cursor-not-allowed"
                            title="保存进度"
                        >
                            <Save className="w-4 h-4" />
                            保存
                        </button>

                        {/* Reset Button */}
                        <button
                            onClick={() => {
                                if (hasUnsavedChanges) {
                                    if (confirm('确定要重置吗？所有未保存的更改将丢失。')) {
                                        resetWorkflow()
                                        initWorkflow(bookmarksStore.mergedItems)
                                    }
                                } else {
                                    resetWorkflow()
                                    initWorkflow(bookmarksStore.mergedItems)
                                }
                            }}
                            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-slate-700 hover:bg-slate-600 rounded transition"
                            title="重置"
                        >
                            <RotateCcw className="w-4 h-4" />
                            重置
                        </button>
                    </div>
                </div>

                {/* Unsaved Changes Warning */}
                {hasUnsavedChanges && (
                    <div className="mt-3 pt-3 border-t border-slate-700 flex items-center gap-2 text-amber-400 text-sm">
                        <AlertTriangle className="w-4 h-4" />
                        有未保存的更改
                    </div>
                )}
            </div>

            {/* Stage Content */}
            {currentStage === 'review' && (
                <ReviewDeleteStage
                    bookmarks={workingBookmarks}
                    selectedIds={selectedBookmarkIds}
                    deletedIds={deletedBookmarkIds}
                    recommendations={aiRecommendations}
                    filters={filters}
                    isAnalyzing={isAnalyzing}
                    analysisError={analysisError}
                    onToggleSelect={toggleBookmarkSelection}
                    onSelectAll={selectAll}
                    onDeselectAll={deselectAll}
                    onSelectByRecommendation={selectByRecommendation}
                    onFiltersChange={setFilters}
                    onClearFilters={clearFilters}
                    onDeleteSelected={deleteSelected}
                    onRequestAIAnalysis={handleRequestAIAnalysis}
                    onAcceptRecommendation={acceptRecommendation}
                    onRejectRecommendation={rejectRecommendation}
                    onAcceptAllRecommendations={acceptAllRecommendations}
                    onNextStage={nextStage}
                />
            )}

            {currentStage === 'organize' && (
                <OrganizeStage
                    bookmarks={activeBookmarks}
                    suggestedFolders={suggestedFolders}
                    pendingMoves={pendingMoves}
                    createdFolders={createdFolders}
                    selectedBookmarkIds={selectedBookmarkIds}
                    isAnalyzing={isAnalyzing}
                    onCreateFolder={createFolder}
                    onMoveBookmarks={moveBookmarksToFolder}
                    onAcceptSuggestion={acceptFolderSuggestion}
                    onRequestAICategorization={handleRequestAICategorization}
                    onPrevStage={prevStage}
                    onNextStage={nextStage}
                />
            )}

            {currentStage === 'preview' && (
                <PreviewExportStage
                    bookmarks={activeBookmarks}
                    changeSummary={changeSummary}
                    createdFolders={createdFolders}
                    onExport={handleExport}
                    onPrevStage={prevStage}
                />
            )}
        </div>
    )
}
