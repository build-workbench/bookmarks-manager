import { useMemo, useState } from 'react'
import {
  ChevronDown,
  ExternalLink,
  TrendingUp,
  Database,
  Calendar,
  AlertCircle,
  Folder
} from 'lucide-react'
import useBookmarksStore from '@/store/useBookmarksStore'
import { usePreferencesStore } from '@/store/usePreferencesStore'
import Chart from '@/ui/Chart'
import { SafeExternalLink } from '@/ui/SafeExternalLink'
import type { EChartsOption } from 'echarts'
import { t } from '@/locales'

const pie = (total: number, duplicates: number, isDark = false): EChartsOption => ({
  tooltip: {
    trigger: 'item',
    backgroundColor: isDark ? '#0b132b' : '#ffffff',
    borderColor: isDark ? '#1e293b' : '#e2e8f0',
    borderWidth: 1,
    padding: [8, 12],
    textStyle: { color: isDark ? '#f8fafc' : '#0f172a', fontSize: 13 },
    extraCssText: 'box-shadow: 0 8px 20px -4px rgba(0, 0, 0, 0.15); border-radius: 10px;'
  },
  series: [
    {
      type: 'pie',
      radius: ['45%', '72%'],
      center: ['50%', '50%'],
      itemStyle: {
        borderRadius: 6,
        borderColor: isDark ? '#0b132b' : '#ffffff',
        borderWidth: 2
      },
      data: [
        {
          name: t('dashboard.deduplicated'),
          value: total,
          itemStyle: { color: '#10b981' }
        },
        {
          name: t('dashboard.duplicates'),
          value: duplicates,
          itemStyle: { color: '#f43f5e' }
        }
      ],
      label: {
        color: isDark ? '#94a3b8' : '#64748b',
        fontSize: 12
      }
    }
  ]
})

const bar = (domains: Array<[string, number]>, isDark = false): EChartsOption => ({
  tooltip: {
    backgroundColor: isDark ? '#0b132b' : '#ffffff',
    borderColor: isDark ? '#1e293b' : '#e2e8f0',
    borderWidth: 1,
    padding: [8, 12],
    textStyle: { color: isDark ? '#f8fafc' : '#0f172a', fontSize: 13 },
    extraCssText: 'box-shadow: 0 8px 20px -4px rgba(0, 0, 0, 0.15); border-radius: 10px;'
  },
  grid: { left: '3%', right: '4%', bottom: '15%', top: '10%', containLabel: true },
  xAxis: {
    type: 'category',
    data: domains.map((d) => d[0]),
    axisLabel: { interval: 0, rotate: 28, color: isDark ? '#94a3b8' : '#64748b', fontSize: 11 },
    axisLine: { lineStyle: { color: isDark ? '#334155' : '#e2e8f0' } },
    axisTick: { show: false }
  },
  yAxis: {
    type: 'value',
    axisLabel: { color: isDark ? '#94a3b8' : '#64748b', fontSize: 11 },
    splitLine: { lineStyle: { color: isDark ? '#1e293b' : '#f1f5f9', type: 'dashed' } }
  },
  series: [
    {
      type: 'bar',
      data: domains.map((d) => d[1]),
      itemStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: '#38bdf8' },
            { offset: 1, color: '#0284c7' }
          ]
        },
        borderRadius: [6, 6, 0, 0]
      }
    }
  ]
})

const line = (years: Array<[string, number]>, isDark = false): EChartsOption => ({
  tooltip: {
    trigger: 'axis',
    backgroundColor: isDark ? '#0b132b' : '#ffffff',
    borderColor: isDark ? '#1e293b' : '#e2e8f0',
    borderWidth: 1,
    padding: [8, 12],
    textStyle: { color: isDark ? '#f8fafc' : '#0f172a', fontSize: 13 },
    extraCssText: 'box-shadow: 0 8px 20px -4px rgba(0, 0, 0, 0.15); border-radius: 10px;'
  },
  grid: { left: '3%', right: '4%', bottom: '10%', top: '10%', containLabel: true },
  xAxis: {
    type: 'category',
    data: years.map((y) => y[0]),
    axisLabel: { color: isDark ? '#94a3b8' : '#64748b', fontSize: 11 },
    axisLine: { lineStyle: { color: isDark ? '#334155' : '#e2e8f0' } },
    axisTick: { show: false }
  },
  yAxis: {
    type: 'value',
    axisLabel: { color: isDark ? '#94a3b8' : '#64748b', fontSize: 11 },
    splitLine: { lineStyle: { color: isDark ? '#1e293b' : '#f1f5f9', type: 'dashed' } }
  },
  series: [
    {
      type: 'line',
      smooth: true,
      symbolSize: 7,
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(14, 165, 233, 0.45)' },
            { offset: 1, color: 'rgba(14, 165, 233, 0.02)' }
          ]
        }
      },
      itemStyle: { color: '#0ea5e9' },
      lineStyle: { width: 3, color: '#0ea5e9' },
      data: years.map((y) => y[1])
    }
  ]
})

export default function Dashboard() {
  const { stats, mergedItems, needsMerge, hasFullMergeData } = useBookmarksStore()
  const theme = usePreferencesStore((state) => state.theme)
  const isDark =
    theme === 'dark' ||
    (theme === 'auto' &&
      typeof window !== 'undefined' &&
      Boolean(window.matchMedia?.('(prefers-color-scheme: dark)').matches))

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
    () => pie(stats.total, stats.duplicates, isDark),
    [stats.total, stats.duplicates, isDark]
  )
  const barOption = useMemo(() => bar(domains, isDark), [domains, isDark])
  const lineOption = useMemo(() => line(years, isDark), [years, isDark])
  const categoryOption = useMemo(() => bar(categories, isDark), [categories, isDark])

  if (needsMerge) {
    return (
      <div className="text-center py-16 text-muted rounded-2xl border border-border/80 bg-card/60 backdrop-blur-md p-8 shadow-sm">
        <AlertCircle className="w-12 h-12 mx-auto mb-3 text-amber-400 opacity-90" />
        <p className="text-base font-semibold text-foreground">{t('dashboard.needsMerge')}</p>
        <p className="text-xs text-muted mt-2 max-w-md mx-auto">{t('dashboard.needsMergeHint')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {!hasFullMergeData && mergedItems.length > 0 && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 backdrop-blur-sm p-3.5 text-sm text-amber-600 dark:text-amber-300 shadow-subtle flex items-center gap-3 animate-fade-in-down">
          <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-500 flex-shrink-0">
            <AlertCircle className="w-4 h-4" />
          </div>
          <span className="font-medium">{t('dashboard.restoredWarning')}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="group relative overflow-hidden rounded-2xl border border-border/80 bg-card/75 backdrop-blur-md p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-sky-500/40 hover:shadow-card-hover">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">{t('dashboard.totalBookmarks')}</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-500 dark:text-sky-400 group-hover:scale-110 group-hover:bg-sky-500/20 transition-all duration-300">
              <Database className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-foreground">{stats.total}</span>
            <span className="text-xs text-muted">{t('dashboard.items')}</span>
          </div>
          <div className="mt-3.5 h-1.5 w-full rounded-full bg-border/40 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 rounded-full w-full opacity-80" />
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-2xl border border-border/80 bg-card/75 backdrop-blur-md p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-rose-500/40 hover:shadow-card-hover">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">{t('dashboard.duplicateCount')}</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500 dark:text-rose-400 group-hover:scale-110 group-hover:bg-rose-500/20 transition-all duration-300">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-rose-500 dark:text-rose-400">{stats.duplicates}</span>
            <span className="text-xs text-muted">
              {stats.total > 0 ? `${((stats.duplicates / stats.total) * 100).toFixed(1)}%` : '0%'}
            </span>
          </div>
          <div className="mt-3.5 h-1.5 w-full rounded-full bg-border/40 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-rose-500 to-amber-500 rounded-full transition-all duration-500"
              style={{ width: `${stats.total > 0 ? Math.min(100, Math.round((stats.duplicates / stats.total) * 100)) : 0}%` }}
            />
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-2xl border border-border/80 bg-card/75 backdrop-blur-md p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-500/40 hover:shadow-card-hover">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">{t('dashboard.domainCount')}</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all duration-300">
              <Calendar className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold tracking-tight text-foreground">{Object.keys(stats.byDomain).length}</span>
            <span className="text-xs text-muted">{t('search.allDomains')}</span>
          </div>
          <div className="mt-3.5 h-1.5 w-full rounded-full bg-border/40 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full w-full opacity-80" />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-border/80 bg-card/75 backdrop-blur-md p-5 shadow-sm transition-all duration-300 hover:border-sky-500/30">
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-border/50">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500" />
              <h3 className="text-sm font-semibold text-foreground tracking-tight">{t('dashboard.duplicateRatio')}</h3>
            </div>
          </div>
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
        <div className="rounded-2xl border border-border/80 bg-card/75 backdrop-blur-md p-5 shadow-sm transition-all duration-300 hover:border-sky-500/30">
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-border/50">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-sky-500" />
              <h3 className="text-sm font-semibold text-foreground tracking-tight">{t('dashboard.topDomains')}</h3>
            </div>
          </div>
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

      <div className="rounded-2xl border border-border/80 bg-card/75 backdrop-blur-md p-5 shadow-sm transition-all duration-300 hover:border-sky-500/30">
        <div className="flex items-center justify-between pb-3 mb-2 border-b border-border/50">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-indigo-500" />
            <h3 className="text-sm font-semibold text-foreground tracking-tight">{t('dashboard.byYear')}</h3>
          </div>
        </div>
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
        <div className="rounded-2xl border border-border/80 bg-card/75 backdrop-blur-md p-5 shadow-sm transition-all duration-300 hover:border-sky-500/30">
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-border/50">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-purple-500" />
              <h3 className="text-sm font-semibold text-foreground tracking-tight">{t('dashboard.byCategory')}</h3>
            </div>
          </div>
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

      {/* Bookmarks List Section */}
      {mergedItems.length > 0 && (
        <div className="rounded-2xl border border-border/80 bg-card/75 backdrop-blur-md p-5 shadow-sm">
          <button
            onClick={() => setShowList(!showList)}
            className="flex w-full items-center justify-between rounded-xl p-2.5 text-sm font-semibold text-foreground hover:bg-card-hover/80 transition-all duration-200"
            aria-expanded={showList}
            aria-controls="bookmark-list"
          >
            <div className="flex items-center gap-2.5">
              <ChevronDown
                className={`w-4 h-4 text-sky-500 transition-transform duration-300 ${showList ? 'rotate-180' : ''}`}
              />
              <span>
                {t('dashboard.bookmarkList')} ({mergedItems.length} {t('dashboard.items')})
              </span>
            </div>
            <span className="text-xs text-muted font-normal">
              {showList ? '收起' : '展开'}
            </span>
          </button>

          {showList && (
            <div
              className="mt-4 space-y-2.5 pt-2"
              id="bookmark-list"
              role="list"
              aria-label={t('dashboard.chart.listAria')}
            >
              {displayItems.map((item) => (
                <div
                  key={item.id}
                  className="group rounded-xl bg-card/60 border border-border/60 p-3.5 hover:bg-card hover:border-sky-500/40 hover:shadow-subtle transition-all duration-200"
                  role="listitem"
                >
                  <SafeExternalLink
                    href={item.url}
                    className="flex items-start gap-3 group"
                    unsafeClassName="flex items-start gap-3 group"
                    ariaLabel={item.title || item.url}
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-card-hover text-muted group-hover:text-sky-500 group-hover:bg-sky-500/10 transition-all flex-shrink-0 mt-0.5">
                      <ExternalLink
                        className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-foreground group-hover:text-sky-500 dark:group-hover:text-sky-400 break-all transition-colors">
                        {item.title || item.url}
                      </div>
                      <div className="text-xs text-muted mt-1 break-all font-mono opacity-80">{item.url}</div>
                      {item.path && item.path.length > 0 && (
                        <div
                          className="chip mt-2"
                          aria-label={t('dashboard.folderLabel', { path: item.path.join(' / ') })}
                        >
                          <Folder className="w-3 h-3" />
                          <span>{item.path.join(' / ')}</span>
                        </div>
                      )}
                    </div>
                  </SafeExternalLink>
                </div>
              ))}

              {mergedItems.length > limit && (
                <button
                  onClick={() => setLimit(limit + 20)}
                  className="w-full mt-2 py-3 rounded-xl border border-border/60 bg-card/40 hover:bg-card hover:border-sky-500/30 text-sm font-medium text-muted hover:text-sky-500 transition-all shadow-subtle"
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
