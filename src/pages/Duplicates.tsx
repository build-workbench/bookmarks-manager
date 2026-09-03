import { Trash2, Check, Calendar, AlertCircle, Copy, Layers } from 'lucide-react'
import { t, getI18nLanguage } from '@/locales'
import useBookmarksStore from '@/store/useBookmarksStore'
import type { Bookmark } from '@/utils/bookmarkParser'
import { SafeExternalLink } from '@/ui/SafeExternalLink'

export default function Duplicates() {
  const { duplicates, needsMerge, hasFullMergeData } = useBookmarksStore()
  const dupEntries = Object.entries(duplicates) as Array<[string, Bookmark[]]>

  function formatDate(ts?: number) {
    if (!ts) return 'N/A'
    const locale = getI18nLanguage()
    return new Date(ts * 1000).toLocaleDateString(locale, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }

  if (needsMerge) {
    return (
      <div className="text-center py-16 text-muted rounded-2xl border border-dashed border-border/70 bg-card/30">
        <AlertCircle className="w-12 h-12 mx-auto mb-3 text-amber-400 opacity-90" />
        <p className="font-medium">{t('duplicates.needsMerge')}</p>
        <p className="text-xs mt-2">{t('duplicates.needsMergeHint')}</p>
      </div>
    )
  }

  if (!hasFullMergeData && dupEntries.length === 0) {
    return (
      <div className="text-center py-16 text-muted rounded-2xl border border-dashed border-border/70 bg-card/30">
        <AlertCircle className="w-12 h-12 mx-auto mb-3 text-muted opacity-80" />
        <p className="font-medium">{t('duplicates.noFullMergeData')}</p>
        <p className="text-xs mt-2">{t('duplicates.noFullMergeDataHint')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-border/80 bg-card/70 backdrop-blur-md p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="icon-badge h-11 w-11 bg-gradient-to-br from-rose-500/15 via-rose-500/10 to-amber-500/15 border border-rose-500/20 text-rose-500 dark:text-rose-400">
            <Copy className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight text-foreground">{t('duplicates.clusterTitle')}</h2>
            <p className="text-xs text-muted mt-0.5">{t('duplicates.groupCount', { count: dupEntries.length })}</p>
          </div>
        </div>
        <div className="chip bg-rose-500/10 border-rose-500/20 text-rose-500 dark:text-rose-400">
          <Layers className="w-3.5 h-3.5" />
          {dupEntries.length}
        </div>
      </div>

      {dupEntries.length === 0 && (
        <div className="text-center py-16 text-muted rounded-2xl border border-dashed border-border/70 bg-card/30">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500">
            <Check className="w-8 h-8" />
          </div>
          <p className="font-medium">{t('duplicates.empty')}</p>
          <p className="text-xs mt-2">{t('duplicates.noDuplicatesHint')}</p>
        </div>
      )}

      <div className="space-y-5">
        {dupEntries.map(([normalizedUrl, items], idx) => (
          <div
            key={normalizedUrl}
            className="glass-card overflow-hidden animate-fade-in-down"
            style={{ animationDelay: `${Math.min(idx * 40, 240)}ms` }}
          >
            <div className="flex items-center justify-between gap-3 border-b border-border/60 bg-card-hover/40 px-5 py-3.5">
              <div className="flex items-center gap-2.5">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-amber-500 text-xs font-bold text-white shadow-sm">
                  {idx + 1}
                </span>
                <span className="text-sm font-semibold text-muted">
                  {t('duplicates.cluster', { index: idx + 1, count: items.length })}
                </span>
              </div>
              <span className="text-xs font-mono text-muted truncate max-w-[45%] hidden sm:block">
                {normalizedUrl}
              </span>
            </div>

            <div className="space-y-2.5 p-4">
              {items.map((item, itemIdx) => (
                <div
                  key={item.id}
                  className="group rounded-xl bg-card-hover/40 border border-border/60 p-3.5 hover:border-sky-500/40 hover:bg-card hover:shadow-card transition-all duration-200"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`icon-badge h-8 w-8 mt-0.5 ${
                        itemIdx === 0
                          ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/25'
                          : 'bg-card-hover text-muted border border-border/60'
                      }`}
                    >
                      {itemIdx === 0 ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <SafeExternalLink
                          href={item.url}
                          className="text-sky-500 hover:text-sky-400 text-sm font-medium break-all dark:text-sky-400 transition-colors"
                          unsafeClassName="text-sky-500 dark:text-sky-400 text-sm font-medium break-all"
                        >
                          {item.title || item.url}
                        </SafeExternalLink>
                        {itemIdx === 0 && (
                          <span className="text-xs bg-emerald-500/15 text-emerald-500 border border-emerald-500/25 px-2 py-0.5 rounded-full flex-shrink-0 font-medium">
                            {t('duplicates.keep')}
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-muted mt-1 break-all font-mono opacity-80">{item.url}</div>

                      <div className="flex flex-wrap items-center gap-3 mt-2.5 text-xs text-muted">
                        {item.path && item.path.length > 0 && (
                          <span className="chip">📁 {item.path.join(' / ')}</span>
                        )}
                        {item.addDate && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(item.addDate)}
                          </span>
                        )}
                        <span>
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
