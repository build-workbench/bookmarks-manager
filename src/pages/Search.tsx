import { useEffect, useMemo, useState } from 'react'
import { Search as SearchIcon, ExternalLink, Folder, Filter, Download, AlertCircle, CheckCircle } from 'lucide-react'
import useBookmarksStore from '../store/useBookmarksStore'
import type { SearchResultItem } from '../utils/search'
import type { Bookmark } from '../utils/bookmarkParser'
import { exportAsNetscapeHTML } from '../utils/exporter'
import { getHostname } from '../utils/url'

export default function Search() {
  const { search, mergedItems } = useBookmarksStore()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResultItem[]>([])

  const [domain, setDomain] = useState('')
  const [rootFolder, setRootFolder] = useState('')
  const [folderKeyword, setFolderKeyword] = useState('')
  const [dateStart, setDateStart] = useState('')
  const [dateEnd, setDateEnd] = useState('')

  const [exportScope, setExportScope] = useState<'filtered' | 'all'>('filtered')
  const [preserveFolders, setPreserveFolders] = useState(true)
  const [limit, setLimit] = useState(50)

  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const byId = useMemo(() => {
    const map = new Map<string, Bookmark>()
    for (const it of mergedItems) map.set(it.id, it)
    return map
  }, [mergedItems])

  const baseItems = useMemo(() => {
    if (query.trim()) {
      const arr: Bookmark[] = []
      for (const r of results) {
        const it = byId.get(r.id)
        if (it) arr.push(it)
      }
      return arr
    }
    return mergedItems
  }, [byId, mergedItems, query, results])

  const domainOptions = useMemo(() => {
    const counts = new Map<string, number>()
    for (const it of mergedItems) {
      const host = getHostname(it.url) || 'unknown'
      counts.set(host, (counts.get(host) || 0) + 1)
    }
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1])
  }, [mergedItems])

  const rootFolderOptions = useMemo(() => {
    const counts = new Map<string, number>()
    for (const it of mergedItems) {
      const key = (it.path && it.path.length > 0 ? it.path[0] : '(无目录)')
      counts.set(key, (counts.get(key) || 0) + 1)
    }
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1])
  }, [mergedItems])

  const filteredItems = useMemo(() => {
    let items = baseItems

    if (domain) {
      items = items.filter((it) => (getHostname(it.url) || 'unknown') === domain)
    }

    if (rootFolder) {
      items = items.filter((it) => {
        const key = (it.path && it.path.length > 0 ? it.path[0] : '(无目录)')
        return key === rootFolder
      })
    }

    const kw = folderKeyword.trim().toLowerCase()
    if (kw) {
      items = items.filter((it) => (it.path || []).join(' / ').toLowerCase().includes(kw))
    }

    if (dateStart || dateEnd) {
      const startTs = dateStart ? Math.floor(new Date(`${dateStart}T00:00:00`).getTime() / 1000) : null
      const endTs = dateEnd ? Math.floor(new Date(`${dateEnd}T23:59:59`).getTime() / 1000) : null
      items = items.filter((it) => {
        const ts = it.addDate ?? it.lastModified
        if (typeof ts !== 'number') return false
        if (startTs !== null && ts < startTs) return false
        if (endTs !== null && ts > endTs) return false
        return true
      })
    }

    return items
  }, [baseItems, dateEnd, dateStart, domain, folderKeyword, rootFolder])

  const displayItems = useMemo(() => filteredItems.slice(0, limit), [filteredItems, limit])

  const hasActiveFilters = Boolean(domain || rootFolder || folderKeyword.trim() || dateStart || dateEnd)

  useEffect(() => {
    setLimit(50)
  }, [query, domain, rootFolder, folderKeyword, dateStart, dateEnd])

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

  function resetFilters() {
    setDomain('')
    setRootFolder('')
    setFolderKeyword('')
    setDateStart('')
    setDateEnd('')
  }

  function onExport() {
    try {
      const items = exportScope === 'all' ? mergedItems : filteredItems
      if (items.length === 0) {
        setMessage({ type: 'error', text: '没有可导出的书签' })
        return
      }
      const html = exportAsNetscapeHTML(items, { preserveFolders })
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const timestamp = new Date().toISOString().split('T')[0]
      const scopeTag = exportScope === 'all' ? 'all' : 'filtered'
      const folderTag = preserveFolders ? 'tree' : 'flat'
      a.download = `bookmarks_${scopeTag}_${folderTag}_${timestamp}.html`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      setMessage({ type: 'success', text: '导出成功' })
    } catch {
      setMessage({ type: 'error', text: '导出失败' })
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

      {mergedItems.length > 0 && (
        <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-4 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-200">
              <Filter className="w-4 h-4 text-slate-400" />
              高级过滤（可与搜索组合）
            </div>
            <button
              onClick={resetFilters}
              className="text-xs px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition"
            >
              重置
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="space-y-1">
              <div className="text-xs text-slate-400">域名</div>
              <select
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="w-full rounded bg-slate-900 border border-slate-700 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
              >
                <option value="">全部域名</option>
                {domainOptions.map(([host, count]) => (
                  <option key={host} value={host}>
                    {host} ({count})
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1">
              <div className="text-xs text-slate-400">目录（一级）</div>
              <select
                value={rootFolder}
                onChange={(e) => setRootFolder(e.target.value)}
                className="w-full rounded bg-slate-900 border border-slate-700 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
              >
                <option value="">全部目录</option>
                {rootFolderOptions.map(([name, count]) => (
                  <option key={name} value={name}>
                    {name} ({count})
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1">
              <div className="text-xs text-slate-400">目录关键字（包含匹配）</div>
              <input
                type="text"
                value={folderKeyword}
                onChange={(e) => setFolderKeyword(e.target.value)}
                placeholder="例如：开发 / AI / 阅读"
                className="w-full rounded bg-slate-900 border border-slate-700 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
              />
            </label>

            <div className="grid grid-cols-2 gap-2">
              <label className="space-y-1">
                <div className="text-xs text-slate-400">开始日期</div>
                <input
                  type="date"
                  value={dateStart}
                  onChange={(e) => setDateStart(e.target.value)}
                  className="w-full rounded bg-slate-900 border border-slate-700 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
                />
              </label>
              <label className="space-y-1">
                <div className="text-xs text-slate-400">结束日期</div>
                <input
                  type="date"
                  value={dateEnd}
                  onChange={(e) => setDateEnd(e.target.value)}
                  className="w-full rounded bg-slate-900 border border-slate-700 px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
                />
              </label>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-200">
                <Download className="w-4 h-4 text-slate-400" />
                导出
              </div>

              <label className="flex items-center gap-2 text-sm text-slate-300">
                <input
                  type="radio"
                  name="export-scope"
                  checked={exportScope === 'filtered'}
                  onChange={() => setExportScope('filtered')}
                />
                当前结果 ({filteredItems.length})
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-300">
                <input
                  type="radio"
                  name="export-scope"
                  checked={exportScope === 'all'}
                  onChange={() => setExportScope('all')}
                />
                全量 ({mergedItems.length})
              </label>

              <label className="flex items-center gap-2 text-sm text-slate-300">
                <input
                  type="checkbox"
                  checked={preserveFolders}
                  onChange={(e) => setPreserveFolders(e.target.checked)}
                />
                保留目录结构
              </label>

              <button
                onClick={onExport}
                className="ml-auto px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={exportScope === 'all' ? mergedItems.length === 0 : filteredItems.length === 0}
              >
                导出 HTML
              </button>
            </div>
          </div>
        </div>
      )}

      {message && (
        <div className={`rounded-lg border p-4 flex items-center gap-3 ${
          message.type === 'success'
            ? 'bg-green-500/10 border-green-500/50 text-green-400'
            : 'bg-red-500/10 border-red-500/50 text-red-400'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <span className="text-sm">{message.text}</span>
        </div>
      )}

      {mergedItems.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          <SearchIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>请先在"上传合并"页面导入书签</p>
        </div>
      )}

      {(query || hasActiveFilters) && filteredItems.length === 0 && mergedItems.length > 0 && (
        <div className="text-center py-12 text-slate-400">
          <p>未找到匹配的书签</p>
        </div>
      )}

      {(query || hasActiveFilters) && filteredItems.length > 0 && (
        <div className="space-y-1">
          <div className="text-sm text-slate-400 mb-2">
            找到 {filteredItems.length} 条结果
            {query && results.length > 0 && <span className="ml-2">（搜索命中 {results.length}）</span>}
          </div>
          {displayItems.map((item) => (
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

          {filteredItems.length > limit && (
            <button
              onClick={() => setLimit(limit + 50)}
              className="w-full py-2 text-sm text-slate-400 hover:text-sky-400 transition"
            >
              加载更多 ({filteredItems.length - limit} 条)
            </button>
          )}
        </div>
      )}
    </div>
  )
}
