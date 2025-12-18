import { useState } from 'react'
import { Search as SearchIcon, ExternalLink, Folder } from 'lucide-react'
import useBookmarksStore from '../store/useBookmarksStore'
import type { SearchResultItem } from '../utils/search'

export default function Search() {
  const { search, mergedItems } = useBookmarksStore()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResultItem[]>([])

  function escapeRegExp(str: string) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }

  function highlightText(text: string, q: string) {
    const tokens = q.trim().split(/\s+/).filter(Boolean)
    if (tokens.length === 0) return text
    const re = new RegExp(`(${tokens.map(escapeRegExp).join('|')})`, 'gi')
    const parts = text.split(re)
    return parts.map((part, i) =>
      i % 2 === 1 ? (
        <mark
          key={`${part}-${i}`}
          className="rounded bg-sky-500/20 px-1 text-sky-200"
        >
          {part}
        </mark>
      ) : (
        <span key={`${part}-${i}`}>{part}</span>
      )
    )
  }

  function handleSearch(q: string) {
    setQuery(q)
    if (q.trim()) {
      const found = search(q.trim())
      setResults(found)
    } else {
      setResults([])
    }
  }

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={e => handleSearch(e.target.value)}
          placeholder="搜索书签标题、URL或目录..."
          className="w-full pl-10 pr-4 py-3 rounded-lg bg-slate-900 border border-slate-700 focus:border-sky-500 focus:outline-none"
        />
      </div>

      {mergedItems.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          <SearchIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>请先在"上传合并"页面导入书签</p>
        </div>
      )}

      {query && results.length === 0 && mergedItems.length > 0 && (
        <div className="text-center py-12 text-slate-400">
          <p>未找到匹配的书签</p>
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-1">
          <div className="text-sm text-slate-400 mb-2">找到 {results.length} 条结果</div>
          {results.map((item) => (
            <div key={item.id} className="rounded-lg bg-slate-900 border border-slate-800 p-4 hover:border-slate-700 transition">
              <div className="flex items-start gap-3">
                <ExternalLink className="w-4 h-4 text-slate-400 mt-1 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:text-sky-300 font-medium break-all">
                    {highlightText(item.title || item.url, query)}
                  </a>
                  <div className="text-xs text-slate-500 mt-1 break-all">{highlightText(item.url, query)}</div>
                  {item.path && item.path.length > 0 && (
                    <div className="flex items-center gap-1 mt-2 text-xs text-slate-400">
                      <Folder className="w-3 h-3" />
                      <span>{highlightText(item.path.join(' / '), query)}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
