import { Trash2, Check, Calendar, AlertCircle } from 'lucide-react'
import { t } from '@/locales'
import useBookmarksStore from '@/store/useBookmarksStore'
import type { Bookmark } from '@/utils/bookmarkParser'

export default function Duplicates() {
  const { duplicates, needsMerge, hasFullMergeData } = useBookmarksStore()
  const dupEntries = Object.entries(duplicates) as Array<[string, Bookmark[]]>

  function formatDate(ts?: number) {
    if (!ts) return 'N/A'
    return new Date(ts * 1000).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }

  if (needsMerge) {
    return (
      <div className="text-center py-12 text-muted">
        <AlertCircle className="w-12 h-12 mx-auto mb-3 text-amber-400 opacity-80" />
        <p>{t('duplicates.needsMerge')}</p>
        <p className="text-xs mt-2">{t('duplicates.needsMergeHint')}</p>
      </div>
    )
  }

  if (!hasFullMergeData && dupEntries.length === 0) {
    return (
      <div className="text-center py-12 text-muted">
        <AlertCircle className="w-12 h-12 mx-auto mb-3 text-muted opacity-80" />
        <p>{t('duplicates.noFullMergeData')}</p>
        <p className="text-xs mt-2">{t('duplicates.noFullMergeDataHint')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{t('duplicates.clusterTitle')}</h2>
        <div className="text-sm text-muted">
          {t('duplicates.groupCount', { count: dupEntries.length })}
        </div>
      </div>

      {dupEntries.length === 0 && (
        <div className="text-center py-12 text-muted">
          <Check className="w-12 h-12 mx-auto mb-3 text-green-500 opacity-50" />
          <p>{t('duplicates.empty')}</p>
          <p className="text-xs mt-2">{t('duplicates.noDuplicatesHint')}</p>
        </div>
      )}

      <div className="space-y-6">
        {dupEntries.map(([normalizedUrl, items], idx) => (
          <div key={normalizedUrl} className="rounded-lg border border-border p-4 bg-card/50">
            <div className="text-sm font-medium text-muted mb-3">
              {t('duplicates.cluster', { index: idx + 1, count: items.length })}
            </div>

            <div className="space-y-2">
              {items.map((item, itemIdx) => (
                <div
                  key={item.id}
                  className="rounded bg-card-hover/50 border border-border p-3 hover:border-border transition"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {itemIdx === 0 ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Trash2 className="w-4 h-4 text-muted" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sky-400 hover:text-sky-300 text-sm break-all"
                        >
                          {item.title || item.url}
                        </a>
                        {itemIdx === 0 && (
                          <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded flex-shrink-0">
                            {t('duplicates.keep')}
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-muted mt-1 break-all">{item.url}</div>

                      <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted">
                        {item.path && item.path.length > 0 && (
                          <span>📁 {item.path.join(' / ')}</span>
                        )}
                        {item.addDate && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(item.addDate)}
                          </span>
                        )}
                        <span className="text-muted">
                          {t('duplicates.source', { source: item.sourceFile })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
