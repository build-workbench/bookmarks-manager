import useBookmarksStore from '../store/useBookmarksStore'
import Chart from '../ui/Chart'

export default function Dashboard() {
  const { stats } = useBookmarksStore()
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
    xAxis: { type: 'category', data: domains.map(d=>d[0]) },
    yAxis: { type: 'value' },
    series: [{ type: 'bar', data: domains.map(d=>d[1]) }]
  }
  const line = {
    tooltip: {},
    xAxis: { type: 'category', data: years.map(y=>y[0]) },
    yAxis: { type: 'value' },
    series: [{ type: 'line', areaStyle: {}, data: years.map(y=>y[1]) }]
  }
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded border border-slate-800 p-4"><div className="text-slate-400 text-sm">书签总量</div><div className="text-2xl font-semibold mt-1">{stats.total}</div></div>
        <div className="rounded border border-slate-800 p-4"><div className="text-slate-400 text-sm">重复数量</div><div className="text-2xl font-semibold mt-1">{stats.duplicates}</div></div>
        <div className="rounded border border-slate-800 p-4"><div className="text-slate-400 text-sm">域名数</div><div className="text-2xl font-semibold mt-1">{Object.keys(stats.byDomain).length}</div></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded border border-slate-800 p-4"><div className="text-sm mb-2">重复占比</div><Chart option={pie} height={300} /></div>
        <div className="rounded border border-slate-800 p-4"><div className="text-sm mb-2">Top 域名</div><Chart option={bar} height={300} /></div>
      </div>
      <div className="rounded border border-slate-800 p-4"><div className="text-sm mb-2">按年份新增</div><Chart option={line} height={320} /></div>
    </div>
  )
}
