import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Search as SearchIcon,
  ExternalLink,
  Folder,
  Filter,
  Download,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { t } from '@/locales'
import useBookmarksStore from '@/store/useBookmarksStore'
import type { SearchResultItem } from '@/utils/search'
import type { Bookmark } from '@/utils/bookmarkParser'
import {
  exportBookmarks,
  type ExportFormat,
  getExportFileExtension,
  getExportMimeType
} from '@/utils/exporters'
import { getHostname } from '@/utils/url'
import { VirtualList } from '@/ui/VirtualList'
import { SafeExternalLink } from '@/ui/SafeExternalLink'
import { EXPORT_FORMAT_OPTIONS } from '@/constants/exportFormats'
import { downloadFile } from '@/utils/download'

export default function Search() {
  const { search, mergedItems, needsMerge } = useBookmarksStore()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResultItem[]>([])
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const [domain, setDomain] = useState('')
  const [rootFolder, setRootFolder] = useState('')
  const [folderKeyword, setFolderKeyword] = useState('')
  const [dateStart, setDateStart] = useState('')
  const [dateEnd, setDateEnd] = useState('')

  const [exportScope, setExportScope] = useState<'filtered' | 'all'>('filtered')
  const [preserveFolders, setPreserveFolders] = useState(true)
  const [exportFormat, setExportFormat] = useState<ExportFormat>('html')
  const [limit, setLimit] = useState(50)

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

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
      const key = it.path && it.path.length > 0 ? it.path[0] : t('search.noFolder')
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
        const key = it.path && it.path.length > 0 ? it.path[0] : t('search.noFolder')
        return key === rootFolder
      })
    }

    const kw = folderKeyword.trim().toLowerCase()
    if (kw) {
      items = items.filter((it) => (it.path || []).join(' / ').toLowerCase().includes(kw))
    }

    if (dateStart || dateEnd) {
      const startTs = dateStart
        ? Math.floor(new Date(`${dateStart}T00:00:00`).getTime() / 1000)
        : null
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
  const hasActiveFilters = Boolean(
    domain || rootFolder || folderKeyword.trim() || dateStart || dateEnd
  )

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
          className="rounded bg-sky-500/20 px-1 text-sky-600 dark:text-sky-200"
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

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    searchTimeoutRef.current = setTimeout(() => {
      if (q.trim()) {
        setResults(search(q.trim()))
      } else {
        setResults([])
      }
    }, 200)
  }

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [])

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
        setMessage({ type: 'error', text: t('search.noExport') })
        return
      }

      const content = exportBookmarks(items, exportFormat, {
        preserveFolders,
        includeMetadata: exportFormat === 'json' || exportFormat === 'csv'
      })

      const timestamp = new Date().toISOString().split('T')[0]
      const scopeTag = exportScope === 'all' ? 'all' : 'filtered'
      const folderTag = preserveFolders ? 'tree' : 'flat'
      const ext = getExportFileExtension(exportFormat)
      const filename = `bookmarks_${scopeTag}_${folderTag}_${timestamp}.${ext}`

      downloadFile(content, filename, getExportMimeType(exportFormat))
      setMessage({
        type: 'success',
        text: t('search.exportedAs', { format: exportFormat.toUpperCase() })
      })
    } catch {
      setMessage({ type: 'error', text: t('search.exportFailed') })
    }
  }

  if (needsMerge) {
    return (
      <div className="text-center py-12 text-muted">
        <AlertCircle className="w-12 h-12 mx-auto mb-3 text-amber-400 opacity-80" />
        <p>{t('search.needsMerge')}</p>
        <p className="text-xs mt-2">{t('search.needsMergeHint')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder={t('search.placeholderFull')}
          className="w-full pl-10 pr-4 py-3 rounded-lg bg-card border border-border focus:border-sky-500 focus:outline-none"
        />
      </div>

      {mergedItems.length > 0 && (
        <div className="rounded-lg border border-border bg-card/50 p-4 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Filter className="w-4 h-4 text-muted" />
              {t('search.advancedFilter')}
            </div>
            <button
              onClick={resetFilters}
              className="text-xs px-3 py-1.5 rounded bg-card-hover hover:bg-card-hover text-foreground transition"
            >
              {t('search.reset')}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="space-y-1">
              <div className="text-xs text-muted">{t('search.domain')}</div>
              <select
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="w-full rounded bg-card border border-border px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
              >
                <option value="">{t('search.allDomains')}</option>
                {domainOptions.map(([host, count]) => (
                  <option key={host} value={host}>
                    {host} ({count})
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1">
              <div className="text-xs text-muted">{t('search.rootFolder')}</div>
              <select
                value={rootFolder}
                onChange={(e) => setRootFolder(e.target.value)}
                className="w-full rounded bg-card border border-border px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
              >
                <option value="">{t('search.allFolders')}</option>
                {rootFolderOptions.map(([name, count]) => (
                  <option key={name} value={name}>
                    {name} ({count})
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1">
              <div className="text-xs text-muted">{t('search.folderKeyword')}</div>
              <input
                type="text"
                value={folderKeyword}
                onChange={(e) => setFolderKeyword(e.target.value)}
                placeholder={t('search.folderKeywordPlaceholder')}
                className="w-full rounded bg-card border border-border px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
              />
            </label>

            <div className="grid grid-cols-2 gap-2">
              <label className="space-y-1">
                <div className="text-xs text-muted">{t('search.dateStart')}</div>
                <input
                  type="date"
                  value={dateStart}
                  onChange={(e) => setDateStart(e.target.value)}
                  className="w-full rounded bg-card border border-border px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
                />
              </label>
              <label className="space-y-1">
                <div className="text-xs text-muted">{t('search.dateEnd')}</div>
                <input
                  type="date"
                  value={dateEnd}
                  onChange={(e) => setDateEnd(e.target.value)}
                  className="w-full rounded bg-card border border-border px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
                />
              </label>
            </div>
          </div>

          <div className="pt-2 border-t border-border">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Download className="w-4 h-4 text-muted" />
                {t('search.export')}
              </div>

              <label className="flex items-center gap-2 text-sm text-muted">
                <input
                  type="radio"
                  name="export-scope"
                  checked={exportScope === 'filtered'}
                  onChange={() => setExportScope('filtered')}
                />
                {t('search.currentResults')} ({filteredItems.length})
              </label>
              <label className="flex items-center gap-2 text-sm text-muted">
                <input
                  type="radio"
                  name="export-scope"
                  checked={exportScope === 'all'}
                  onChange={() => setExportScope('all')}
                />
                {t('search.all')} ({mergedItems.length})
              </label>

              <label className="flex items-center gap-2 text-sm text-muted">
                <input
                  type="checkbox"
                  checked={preserveFolders}
                  onChange={(e) => setPreserveFolders(e.target.checked)}
                />
                {t('search.preserveFolder')}
              </label>

              <div className="ml-auto flex items-center gap-2">
                <select
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value as ExportFormat)}
                  className="rounded bg-card-hover border border-border px-3 py-2 text-sm focus:border-sky-500 focus:outline-none"
                >
                  {EXPORT_FORMAT_OPTIONS.map((opt) => (
                    <option key={opt.format} value={opt.format}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <button
                  onClick={onExport}
                  className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={
                    exportScope === 'all' ? mergedItems.length === 0 : filteredItems.length === 0
                  }
                >
                  {t('search.exportButton', {
                    format: EXPORT_FORMAT_OPTIONS.find((o) => o.format === exportFormat)?.label
                  })}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {message && (
        <div
          className={`rounded-lg border p-4 flex items-center gap-3 ${
            message.type === 'success'
              ? 'bg-green-500/10 border-green-500/50 text-green-400'
              : 'bg-red-500/10 border-red-500/50 text-red-400'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <span className="text-sm">{message.text}</span>
        </div>
      )}

      {mergedItems.length === 0 && (
        <div className="text-center py-12 text-muted">
          <SearchIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>{t('search.importFirst')}</p>
        </div>
      )}

      {(query || hasActiveFilters) && filteredItems.length === 0 && mergedItems.length > 0 && (
        <div className="text-center py-12 text-muted">
          <p>{t('search.noMatch')}</p>
        </div>
      )}

      {(query || hasActiveFilters) && filteredItems.length > 0 && (
        <div>
          <div className="text-sm text-muted mb-2">
            {t('search.found', { count: filteredItems.length })}
            {query && results.length > 0 && (
              <span className="ml-2">{t('search.searchHits', { count: results.length })}</span>
            )}
          </div>

          {/* Use virtual list for large datasets (>200 items) */}
          {filteredItems.length > 200 ? (
            <VirtualList
              items={filteredItems}
              itemHeight={88}
              containerHeight={600}
              renderItem={(item) => (
                <div className="rounded-lg bg-card border border-border p-4 hover:border-border transition mx-1">
                  <div className="flex items-start gap-3">
                    <ExternalLink className="w-4 h-4 text-muted mt-1 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <SafeExternalLink
                        href={item.url}
                        className="text-sky-400 hover:text-sky-300 font-medium break-all"
                        unsafeClassName="text-sky-400 font-medium break-all"
                      >
                        {highlightText(item.title || item.url, query)}
                      </SafeExternalLink>
                      <div className="text-xs text-muted mt-1 break-all">
                        {highlightText(item.url, query)}
                      </div>
                      {item.path && item.path.length > 0 && (
                        <div className="flex items-center gap-1 mt-2 text-xs text-muted">
                          <Folder className="w-3 h-3" />
                          <span>{highlightText(item.path.join(' / '), query)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            />
          ) : (
            <div className="space-y-1">
              {displayItems.map((item) => (
                <div
                  key={item.id}
                  className="rounded-lg bg-card border border-border p-4 hover:border-border transition"
                >
                  <div className="flex items-start gap-3">
                    <ExternalLink className="w-4 h-4 text-muted mt-1 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <SafeExternalLink
                        href={item.url}
                        className="text-sky-400 hover:text-sky-300 font-medium break-all"
                        unsafeClassName="text-sky-400 font-medium break-all"
                      >
                        {highlightText(item.title || item.url, query)}
                      </SafeExternalLink>
                      <div className="text-xs text-muted mt-1 break-all">
                        {highlightText(item.url, query)}
                      </div>
                      {item.path && item.path.length > 0 && (
                        <div className="flex items-center gap-1 mt-2 text-xs text-muted">
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
                  className="w-full py-2 text-sm text-muted hover:text-sky-400 transition"
                >
                  {t('search.loadMore', { count: filteredItems.length - limit })}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
