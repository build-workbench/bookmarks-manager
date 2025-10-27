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
    for (let i = 0; i < el.children.length; i++) {
      const child = el.children[i] as HTMLElement
      const tag = child.tagName.toLowerCase()
      if (tag === 'dt') {
        const h3 = child.querySelector('h3') as HTMLElement | null
        const a = child.querySelector('a') as HTMLAnchorElement | null
        if (h3) {
          const name = (h3.textContent || '').trim() || 'Untitled'
          path.push(name)
          let next = child.nextElementSibling as HTMLElement | null
          if (next && next.tagName.toLowerCase() === 'dl') {
            walk(next)
          }
          path.pop()
        } else if (a) {
          const title = (a.textContent || '').trim() || a.getAttribute('href') || ''
          const href = a.getAttribute('href') || ''
          const addDate = Number(a.getAttribute('add_date') || '') || undefined
          const lastModified = Number(a.getAttribute('last_modified') || '') || undefined
          const iconHref = a.getAttribute('icon') || a.getAttribute('icon_uri') || undefined
          const id = crypto.randomUUID()
          items.push({ id, title, url: href, addDate, lastModified, iconHref, path: [...path], sourceFile })
        }
      } else if (tag === 'dl') {
        walk(child)
      }
    }
  }
  if (root) walk(root)
  return items
}
