import type { Bookmark } from './bookmarkParser'

const ROOT_ALIASES: Record<string, string> = {
  'bookmarks bar': '书签栏',
  'bookmarks toolbar': '书签栏',
  'favorites bar': '书签栏',
  '书签栏': '书签栏',
  '书签工具栏': '书签栏',
  '收藏栏': '书签栏',
  'bookmarks menu': '其他书签',
  'bookmarks': '其他书签',
  'other bookmarks': '其他书签',
  '其他书签': '其他书签',
  'other favorites': '其他书签',
  'mobile bookmarks': '移动书签',
  '移动书签': '移动书签'
}

export function normalizePath(path: string[]): string[] {
  if (!path || path.length === 0) return []
  const [root, ...rest] = path
  const key = root.trim().toLowerCase()
  const mapped = ROOT_ALIASES[key] || root.trim()
  return [mapped, ...rest.map(s => s.trim())]
}

type FolderNode = { name: string; folders: Map<string, FolderNode>; bookmarks: Bookmark[] }

export function buildFolderTree(items: Bookmark[]): FolderNode {
  const root: FolderNode = { name: 'ROOT', folders: new Map(), bookmarks: [] }
  for (const it of items) {
    let node = root
    const p = normalizePath(it.path)
    for (const seg of p) {
      let child = node.folders.get(seg)
      if (!child) { child = { name: seg, folders: new Map(), bookmarks: [] }; node.folders.set(seg, child) }
      node = child
    }
    node.bookmarks.push(it)
  }
  return root
}
