import { useState } from 'react'
import { ChevronDown, ExternalLink, TrendingUp, Database, Calendar } from 'lucide-react'
import useBookmarksStore from '../store/useBookmarksStore'
import Chart from '../ui/Chart'

export default function Dashboard() {
  const { stats, mergedItems } = useBookmarksStore()
  const [showList, setShowList] = useState(false)
  const [limit, setLimit] = useState(20)
  
  const domains = Object.entries(stats.byDomain).sort((a,b)=>b[1]-a[1]).slice(0,10)
  const years = Object.entries(stats.byYear).sort((a,b)=>a[0].localeCompare(b[0]))
  
  const pie = {
    tooltip: { trigger: 'item' },
    series: [{ type: 'pie', radius: ['40%','70%'], data: [
      { name: '去重后', value: stats.total },
      { name: '重复', value: stats.duplicates }
    ] }]
  }
  const bar = {
    tooltip: {},
    xAxis: { type: 'category', data: domains.map(d=>d[0]), axisLabel: { interval: 0, rotate: 30 } },
    yAxis: { type: 'value' },
    series: [{ type: 'bar', data: domains.map(d=>d[1]) }]
  }
  const line = {
    tooltip: {},
    xAxis: { type: 'category', data: years.map(y=>y[0]) },
    yAxis: { type: 'value' },
    series: [{ type: 'line', areaStyle: {}, data: years.map(y=>y[1]) }]
  }

  const displayItems = mergedItems.slice(0, limit)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded border border-slate-800 p-4">
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
            <Database className="w-4 h-4" />
            <span>书签总量</span>
          </div>
          <div className="text-2xl font-semibold mt-1">{stats.total}</div>
        </div>
        <div className="rounded border border-slate-800 p-4">
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
            <TrendingUp className="w-4 h-4" />
            <span>重复数量</span>
          </div>
          <div className="text-2xl font-semibold mt-1">{stats.duplicates}</div>
        </div>
        <div className="rounded border border-slate-800 p-4">
          <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
            <Calendar className="w-4 h-4" />
            <span>域名数</span>
          </div>
          <div className="text-2xl font-semibold mt-1">{Object.keys(stats.byDomain).length}</div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded border border-slate-800 p-4">
          <div className="text-sm mb-2 font-medium">重复占比</div>
          <Chart option={pie} height={300} />
        </div>
        <div className="rounded border border-slate-800 p-4">
          <div className="text-sm mb-2 font-medium">Top 10 域名</div>
          <Chart option={bar} height={300} />
        </div>
      </div>
      
      <div className="rounded border border-slate-800 p-4">
        <div className="text-sm mb-2 font-medium">按年份新增</div>
        <Chart option={line} height={320} />
      </div>

      {mergedItems.length > 0 && (
        <div className="rounded border border-slate-800 p-4">
          <button
            onClick={() => setShowList(!showList)}
            className="flex items-center gap-2 text-sm font-medium mb-3 hover:text-sky-400 transition"
          >
            <ChevronDown className={`w-4 h-4 transition-transform ${showList ? 'rotate-180' : ''}`} />
            <span>书签列表 ({mergedItems.length} 条)</span>
          </button>
          
          {showList && (
            <div className="space-y-2">
              {displayItems.map((item) => (
                <div key={item.id} className="rounded bg-slate-900/50 border border-slate-700 p-3 hover:border-slate-600 transition">
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="flex items-start gap-2 group">
                    <ExternalLink className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0 group-hover:text-sky-400 transition" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-sky-400 group-hover:text-sky-300 break-all">{item.title || item.url}</div>
                      <div className="text-xs text-slate-500 mt-1 break-all">{item.url}</div>
                      {item.path && item.path.length > 0 && (
                        <div className="text-xs text-slate-400 mt-1">📁 {item.path.join(' / ')}</div>
                      )}
                    </div>
                  </a>
                </div>
              ))}
              
              {mergedItems.length > limit && (
                <button
                  onClick={() => setLimit(limit + 20)}
                  className="w-full py-2 text-sm text-slate-400 hover:text-sky-400 transition"
                >
                  加载更多 ({mergedItems.length - limit} 条)
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
