import type { Bookmark } from './bookmarkParser'
import { buildFolderTree } from './folders'

function esc(s: string) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')
}

export function exportAsNetscapeHTML(items: Bookmark[]): string {
  const lines: string[] = []
  lines.push('<!DOCTYPE NETSCAPE-Bookmark-file-1>')
  lines.push('<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">')
  lines.push('<TITLE>Bookmarks</TITLE>')
  lines.push('<H1>Bookmarks</H1>')
  const tree = buildFolderTree(items)
  lines.push('<DL><p>')

  for (const b of tree.bookmarks) {
    const ts = b.addDate || Math.floor(Date.now() / 1000)
    const title = esc(b.title || b.url)
    const href = esc(b.url)
    lines.push(`<DT><A HREF="${href}" ADD_DATE="${ts}">${title}</A>`)
  }

  function emitFolder(name: string, node: ReturnType<typeof buildFolderTree>, depth: number) {
    const title = esc(name)
    lines.push(`<DT><H3>${title}</H3>`) 
    lines.push('<DL><p>')
    for (const b of node.bookmarks) {
      const ts = b.addDate || Math.floor(Date.now() / 1000)
      const t = esc(b.title || b.url)
      const href = esc(b.url)
      lines.push(`<DT><A HREF="${href}" ADD_DATE="${ts}">${t}</A>`)
    }
    for (const [childName, child] of node.folders) {
      emitFolder(childName, child as any, depth + 1)
    }
    lines.push('</DL><p>')
  }

  for (const [name, node] of tree.folders) {
    emitFolder(name, node as any, 0)
  }

  lines.push('</DL><p>')
  return lines.join('\n')
}
