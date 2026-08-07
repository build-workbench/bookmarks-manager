import { useMemo, useState } from 'react'
import {
  ChevronDown,
  ExternalLink,
  TrendingUp,
  Database,
  Calendar,
  AlertCircle
} from 'lucide-react'
import useBookmarksStore from '@/store/useBookmarksStore'
import Chart from '@/ui/Chart'
import { SafeExternalLink } from '@/ui/SafeExternalLink'
import type { EChartsOption } from 'echarts'
import { t } from '@/locales'

const pie = (total: number, duplicates: number): EChartsOption => ({
  tooltip: { trigger: 'item' },
  series: [
    {
      type: 'pie',
      radius: ['40%', '70%'],
      data: [
        { name: t('dashboard.deduplicated'), value: total },
        { name: t('dashboard.duplicates'), value: duplicates }
      ]
    }
  ]
})

const bar = (domains: Array<[string, number]>): EChartsOption => ({
  tooltip: {},
  xAxis: {
    type: 'category',
    data: domains.map((d) => d[0]),
    axisLabel: { interval: 0, rotate: 30 }
  },
  yAxis: { type: 'value' },
  series: [{ type: 'bar', data: domains.map((d) => d[1]) }]
})

const line = (years: Array<[string, number]>): EChartsOption => ({
  tooltip: {},
  xAxis: { type: 'category', data: years.map((y) => y[0]) },
  yAxis: { type: 'value' },
  series: [{ type: 'line', areaStyle: {}, data: years.map((y) => y[1]) }]
})

export default function Dashboard() {
  const { stats, mergedItems, needsMerge, hasFullMergeData } = useBookmarksStore()
  const [showList, setShowList] = useState(false)
  const [limit, setLimit] = useState(20)

  const domains = useMemo(
    () =>
      Object.entries(stats.byDomain)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10),
    [stats.byDomain]
  )
  const years = useMemo(
    () => Object.entries(stats.byYear).sort((a, b) => a[0].localeCompare(b[0])),
    [stats.byYear]
  )
  const categories = useMemo(
    () => Object.entries(stats.byCategory || {}).sort((a, b) => b[1] - a[1]),
    [stats.byCategory]
  )
  const displayItems = useMemo(() => mergedItems.slice(0, limit), [mergedItems, limit])
  const pieOption = useMemo(
    () => pie(stats.total, stats.duplicates),
    [stats.total, stats.duplicates]
  )
  const barOption = useMemo(() => bar(domains), [domains])
  const lineOption = useMemo(() => line(years), [years])
  const categoryOption = useMemo(() => bar(categories), [categories])

  if (needsMerge) {
    return (
      <div className="text-center py-12 text-muted">
        <AlertCircle className="w-12 h-12 mx-auto mb-3 text-amber-400 opacity-80" />
        <p>{t('dashboard.needsMerge')}</p>
        <p className="text-xs mt-2">{t('dashboard.needsMergeHint')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {!hasFullMergeData && mergedItems.length > 0 && (
        <div className="rounded border border-border bg-card/50 p-4 text-sm text-muted">
          {t('dashboard.restoredWarning')}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded border border-border p-4">
          <div className="flex items-center gap-2 text-muted text-sm mb-1">
            <Database className="w-4 h-4" />
            <span>{t('dashboard.totalBookmarks')}</span>
          </div>
          <div className="text-2xl font-semibold mt-1">{stats.total}</div>
        </div>
        <div className="rounded border border-border p-4">
          <div className="flex items-center gap-2 text-muted text-sm mb-1">
            <TrendingUp className="w-4 h-4" />
            <span>{t('dashboard.duplicateCount')}</span>
          </div>
          <div className="text-2xl font-semibold mt-1">{stats.duplicates}</div>
        </div>
        <div className="rounded border border-border p-4">
          <div className="flex items-center gap-2 text-muted text-sm mb-1">
            <Calendar className="w-4 h-4" />
            <span>{t('dashboard.domainCount')}</span>
          </div>
          <div className="text-2xl font-semibold mt-1">{Object.keys(stats.byDomain).length}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded border border-border p-4">
          <div className="text-sm mb-2 font-medium">{t('dashboard.duplicateRatio')}</div>
          <Chart
            option={pieOption}
            height={300}
            aria-label={t('dashboard.chart.pieAria')}
            description={t('dashboard.chart.pieDescription', {
              total: stats.total,
              duplicates: stats.duplicates
            })}
          />
        </div>
        <div className="rounded border border-border p-4">
          <div className="text-sm mb-2 font-medium">{t('dashboard.topDomains')}</div>
          <Chart
            option={barOption}
            height={300}
            aria-label={t('dashboard.chart.barAria')}
            description={t('dashboard.chart.barDescription', {
              domains: domains.map(([d, c]) => `${d}(${c})`).join(', ')
            })}
          />
        </div>
      </div>

      <div className="rounded border border-border p-4">
        <div className="text-sm mb-2 font-medium">{t('dashboard.byYear')}</div>
        <Chart
          option={lineOption}
          height={320}
          aria-label={t('dashboard.chart.lineAria')}
          description={t('dashboard.chart.lineDescription', {
            years: years.map(([y, c]) => `${y}:${c}`).join(', ')
          })}
        />
      </div>

      {categories.length > 0 && (
        <div className="rounded border border-border p-4">
          <div className="text-sm mb-2 font-medium">{t('dashboard.byCategory')}</div>
          <Chart
            option={categoryOption}
            height={300}
            aria-label={t('dashboard.chart.categoryAria')}
            description={t('dashboard.chart.barDescription', {
              domains: categories.map(([c, n]) => `${c}(${n})`).join(', ')
            })}
          />
        </div>
      )}

      {mergedItems.length > 0 && (
        <div className="rounded border border-border p-4">
          <button
            onClick={() => setShowList(!showList)}
            className="flex items-center gap-2 text-sm font-medium mb-3 hover:text-sky-400 transition"
            aria-expanded={showList}
            aria-controls="bookmark-list"
          >
            <ChevronDown
              className={`w-4 h-4 transition-transform ${showList ? 'rotate-180' : ''}`}
            />
            <span>
              {t('dashboard.bookmarkList')} ({mergedItems.length} {t('dashboard.items')})
            </span>
          </button>

          {showList && (
            <div
              className="space-y-2"
              id="bookmark-list"
              role="list"
              aria-label={t('dashboard.chart.listAria')}
            >
              {displayItems.map((item) => (
                <div
                  key={item.id}
                  className="rounded bg-card/50 border border-border p-3 hover:border-border transition"
                  role="listitem"
                >
                  <SafeExternalLink
                    href={item.url}
                    className="flex items-start gap-2 group"
                    unsafeClassName="flex items-start gap-2 group"
                    ariaLabel={item.title || item.url}
                  >
                    <ExternalLink
                      className="w-4 h-4 text-muted mt-0.5 flex-shrink-0 group-hover:text-sky-400 transition"
                      aria-hidden="true"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-sky-400 group-hover:text-sky-300 break-all">
                        {item.title || item.url}
                      </div>
                      <div className="text-xs text-muted mt-1 break-all">{item.url}</div>
                      {item.path && item.path.length > 0 && (
                        <div
                          className="text-xs text-muted mt-1"
                          aria-label={t('dashboard.folderLabel', { path: item.path.join(' / ') })}
                        >
                          📁 {item.path.join(' / ')}
                        </div>
                      )}
                    </div>
                  </SafeExternalLink>
                </div>
              ))}

              {mergedItems.length > limit && (
                <button
                  onClick={() => setLimit(limit + 20)}
                  className="w-full py-2 text-sm text-muted hover:text-sky-400 transition"
                  aria-label={`${t('dashboard.loadMore')}, ${mergedItems.length - limit} ${t('dashboard.items')}`}
                >
                  {t('dashboard.loadMore')} ({mergedItems.length - limit} {t('dashboard.items')})
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
