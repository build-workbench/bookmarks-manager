export type Bookmark = {
  id: string
  title: string
  url: string
  addDate?: number
  lastModified?: number
  iconHref?: string
  path: string[]
  sourceFile: string
}

export function parseNetscapeBookmarks(html: string, sourceFile: string): Bookmark[] {
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  const root = doc.querySelector('dl')
  const items: Bookmark[] = []
  const path: string[] = []

  function walk(el: Element) {
    // 遍历所有子节点，包括文本节点之间的元素
    const children = Array.from(el.children)

    for (let i = 0; i < children.length; i++) {
      const child = children[i] as HTMLElement
      const tag = child.tagName.toLowerCase()

      if (tag === 'dt') {
        // 直接子元素查找 h3 或 a
        const h3 = child.querySelector(':scope > h3') as HTMLElement | null
        const a = child.querySelector(':scope > a') as HTMLAnchorElement | null

        if (h3) {
          // 这是一个文件夹
          const name = (h3.textContent || '').trim() || 'Untitled'
          path.push(name)

          // 查找紧随其后的 DL（可能是下一个兄弟元素，也可能在 DT 内部）
          let dlElement: Element | null = null

          // 首先检查 DT 内部是否有 DL
          dlElement = child.querySelector(':scope > dl')

          // 如果没有，检查下一个兄弟元素
          if (!dlElement) {
            const next = children[i + 1] as HTMLElement | null
            if (next && next.tagName.toLowerCase() === 'dl') {
              dlElement = next
              i++ // 跳过这个 DL，因为我们已经处理了
            }
          }

          if (dlElement) {
            walk(dlElement)
          }

          path.pop()
        } else if (a) {
          // 这是一个书签链接
          const title = (a.textContent || '').trim() || a.getAttribute('href') || ''
          const href = a.getAttribute('href') || ''

          // 跳过 javascript: 和空链接
          if (!href || href.startsWith('javascript:')) {
            continue
          }

          const addDate = Number(a.getAttribute('add_date') || '') || undefined
          const lastModified = Number(a.getAttribute('last_modified') || '') || undefined
          const iconHref = a.getAttribute('icon') || a.getAttribute('icon_uri') || undefined
          const id = crypto.randomUUID()
          items.push({ id, title, url: href, addDate, lastModified, iconHref, path: [...path], sourceFile })
        }
      } else if (tag === 'dl') {
        // 直接遇到 DL，递归处理
        walk(child)
      } else if (tag === 'p') {
        // 有些书签文件用 <p> 包裹内容，跳过
        continue
      }
    }
  }

  if (root) {
    walk(root)
  }

  return items
}
