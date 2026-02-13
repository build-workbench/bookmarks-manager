/**
 * Folder Tree Component
 * Displays hierarchical folder structure with bookmark counts
 */

import { useState, useMemo } from 'react'
import { Folder, FolderOpen, ChevronRight, ChevronDown, FileText } from 'lucide-react'
import type { Bookmark } from '@/utils/bookmarkParser'
import type { FolderTreeNode } from '@/cleanup/types'

interface FolderTreeProps {
    bookmarks: Bookmark[]
    selectedPath?: string[]
    onSelectFolder: (path: string[]) => void
    onDropBookmarks?: (bookmarkIds: string[], targetPath: string[]) => void
    highlightNew?: string[][]
    showBookmarks?: boolean
}

interface TreeNodeProps {
    node: FolderTreeNode
    level: number
    selectedPath?: string[]
    onSelectFolder: (path: string[]) => void
    onDropBookmarks?: (bookmarkIds: string[], targetPath: string[]) => void
    highlightNew?: Set<string>
    showBookmarks?: boolean
}

/**
 * Build folder tree from bookmarks
 */
function buildFolderTree(bookmarks: Bookmark[]): FolderTreeNode {
    const root: FolderTreeNode = {
        name: '根目录',
        path: [],
        bookmarkCount: 0,
        bookmarks: [],
        children: [],
        isExpanded: true
    }

    // Group bookmarks by path
    for (const bookmark of bookmarks) {
        let currentNode = root

        if (bookmark.path.length === 0) {
            // Root level bookmark
            root.bookmarks.push(bookmark)
            root.bookmarkCount++
            continue
        }

        for (let i = 0; i < bookmark.path.length; i++) {
            const segment = bookmark.path[i]
            const currentPath = bookmark.path.slice(0, i + 1)

            let childNode = currentNode.children.find(c => c.name === segment)

            if (!childNode) {
                childNode = {
                    name: segment,
                    path: currentPath,
                    bookmarkCount: 0,
                    bookmarks: [],
                    children: [],
                    isExpanded: i < 2 // Expand first 2 levels by default
                }
                currentNode.children.push(childNode)
            }

            currentNode = childNode
        }

        // Add bookmark to the final folder
        currentNode.bookmarks.push(bookmark)
        currentNode.bookmarkCount++
    }

    // Sort children alphabetically
    const sortChildren = (node: FolderTreeNode) => {
        node.children.sort((a, b) => a.name.localeCompare(b.name))
        for (const child of node.children) {
            sortChildren(child)
        }
    }
    sortChildren(root)

    // Calculate total counts (including children)
    const calculateTotalCount = (node: FolderTreeNode): number => {
        let total = node.bookmarks.length
        for (const child of node.children) {
            total += calculateTotalCount(child)
        }
        node.bookmarkCount = total
        return total
    }
    calculateTotalCount(root)

    return root
}

function TreeNode({
    node,
    level,
    selectedPath,
    onSelectFolder,
    onDropBookmarks,
    highlightNew,
    showBookmarks
}: TreeNodeProps) {
    const [isExpanded, setIsExpanded] = useState(node.isExpanded ?? level < 2)
    const [isDragOver, setIsDragOver] = useState(false)

    const isSelected = selectedPath &&
        selectedPath.length === node.path.length &&
        selectedPath.every((s, i) => s === node.path[i])

    const isNew = highlightNew?.has(node.path.join('/'))

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragOver(true)
    }

    const handleDragLeave = () => {
        setIsDragOver(false)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragOver(false)

        const bookmarkIds = e.dataTransfer.getData('bookmarkIds')
        if (bookmarkIds && onDropBookmarks) {
            onDropBookmarks(JSON.parse(bookmarkIds), node.path)
        }
    }

    const hasChildren = node.children.length > 0

    return (
        <div>
            {/* Folder Row */}
            <div
                className={`flex items-center gap-1 py-1.5 px-2 rounded cursor-pointer transition ${isSelected
                        ? 'bg-sky-500/20 text-sky-400'
                        : isDragOver
                            ? 'bg-green-500/20 text-green-400'
                            : 'hover:bg-slate-700/50'
                    } ${isNew ? 'ring-1 ring-green-500/50' : ''}`}
                style={{ paddingLeft: `${level * 16 + 8}px` }}
                onClick={() => onSelectFolder(node.path)}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                {/* Expand/Collapse */}
                {hasChildren ? (
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            setIsExpanded(!isExpanded)
                        }}
                        className="p-0.5 hover:bg-slate-600 rounded"
                    >
                        {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                        ) : (
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                        )}
                    </button>
                ) : (
                    <div className="w-5" />
                )}

                {/* Folder Icon */}
                {isExpanded && hasChildren ? (
                    <FolderOpen className={`w-4 h-4 ${isNew ? 'text-green-400' : 'text-amber-400'}`} />
                ) : (
                    <Folder className={`w-4 h-4 ${isNew ? 'text-green-400' : 'text-amber-400'}`} />
                )}

                {/* Folder Name */}
                <span className="flex-1 text-sm truncate">
                    {node.name}
                    {isNew && (
                        <span className="ml-2 text-xs text-green-400">(新建)</span>
                    )}
                </span>

                {/* Bookmark Count */}
                <span className="text-xs text-slate-500">
                    {node.bookmarkCount}
                </span>
            </div>

            {/* Children */}
            {isExpanded && (
                <>
                    {/* Child Folders */}
                    {node.children.map(child => (
                        <TreeNode
                            key={child.path.join('/')}
                            node={child}
                            level={level + 1}
                            selectedPath={selectedPath}
                            onSelectFolder={onSelectFolder}
                            onDropBookmarks={onDropBookmarks}
                            highlightNew={highlightNew}
                            showBookmarks={showBookmarks}
                        />
                    ))}

                    {/* Bookmarks in this folder */}
                    {showBookmarks && node.bookmarks.length > 0 && (
                        <div className="ml-4">
                            {node.bookmarks.slice(0, 5).map(bookmark => (
                                <div
                                    key={bookmark.id}
                                    className="flex items-center gap-2 py-1 px-2 text-xs text-slate-400"
                                    style={{ paddingLeft: `${(level + 1) * 16 + 8}px` }}
                                >
                                    <FileText className="w-3 h-3" />
                                    <span className="truncate">{bookmark.title || bookmark.url}</span>
                                </div>
                            ))}
                            {node.bookmarks.length > 5 && (
                                <div
                                    className="py-1 px-2 text-xs text-slate-500"
                                    style={{ paddingLeft: `${(level + 1) * 16 + 8}px` }}
                                >
                                    ... 还有 {node.bookmarks.length - 5} 条
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

export default function FolderTree({
    bookmarks,
    selectedPath,
    onSelectFolder,
    onDropBookmarks,
    highlightNew,
    showBookmarks = false
}: FolderTreeProps) {
    // Build tree structure
    const tree = useMemo(() => buildFolderTree(bookmarks), [bookmarks])

    // Create set of new folder paths for quick lookup
    const newFolderSet = useMemo(() => {
        if (!highlightNew) return new Set<string>()
        return new Set(highlightNew.map(p => p.join('/')))
    }, [highlightNew])

    return (
        <div className="bg-slate-800/30 rounded-lg border border-slate-700 overflow-hidden">
            <div className="p-3 border-b border-slate-700">
                <h3 className="text-sm font-medium flex items-center gap-2">
                    <Folder className="w-4 h-4 text-amber-400" />
                    文件夹结构
                </h3>
            </div>
            <div className="p-2 max-h-96 overflow-y-auto">
                <TreeNode
                    node={tree}
                    level={0}
                    selectedPath={selectedPath}
                    onSelectFolder={onSelectFolder}
                    onDropBookmarks={onDropBookmarks}
                    highlightNew={newFolderSet}
                    showBookmarks={showBookmarks}
                />
            </div>
        </div>
    )
}
