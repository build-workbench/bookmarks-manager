import { Trash2, Check, Calendar, AlertCircle } from 'lucide-react'
import useBookmarksStore from '@/store/useBookmarksStore'
import type { Bookmark } from '@/utils/bookmarkParser'

export default function Duplicates() {
  const { duplicates, needsMerge, hasFullMergeData } = useBookmarksStore()
  const dupEntries = Object.entries(duplicates) as Array<[string, Bookmark[]]>

  function formatDate(ts?: number) {
    if (!ts) return 'N/A'
    return new Date(ts * 1000).toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })
  }

  if (needsMerge) {
    return (
      <div className="text-center py-12 text-slate-400">
        <AlertCircle className="w-12 h-12 mx-auto mb-3 text-amber-400 opacity-80" />
        <p>当前导入会话已变更，重复簇结果已失效</p>
        <p className="text-xs mt-2">请先回到“上传合并”重新执行合并去重</p>
      </div>
    )
  }

  if (!hasFullMergeData && dupEntries.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400">
        <AlertCircle className="w-12 h-12 mx-auto mb-3 text-slate-500 opacity-80" />
        <p>当前只恢复了上次合并快照，未保留重复簇明细</p>
        <p className="text-xs mt-2">如需查看重复簇，请重新导入原始书签并执行合并去重</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">重复书签簇</h2>
        <div className="text-sm text-slate-400">{dupEntries.length} 组重复</div>
      </div>

      {dupEntries.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          <Check className="w-12 h-12 mx-auto mb-3 text-green-500 opacity-50" />
          <p>没有发现重复书签</p>
          <p className="text-xs mt-2">请先在“上传合并”页面进行合并去重</p>
        </div>
      )}

      <div className="space-y-6">
        {dupEntries.map(([normalizedUrl, items], idx) => (
          <div key={normalizedUrl} className="rounded-lg border border-slate-800 p-4 bg-slate-900/50">
            <div className="text-sm font-medium text-slate-300 mb-3">
              重复组 #{idx + 1} ({items.length} 个副本)
            </div>

            <div className="space-y-2">
              {items.map((item, itemIdx) => (
                <div key={item.id} className="rounded bg-slate-800/50 border border-slate-700 p-3 hover:border-slate-600 transition">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {itemIdx === 0 ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Trash2 className="w-4 h-4 text-slate-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:text-sky-300 text-sm break-all">
                          {item.title || item.url}
                        </a>
                        {itemIdx === 0 && (
                          <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded flex-shrink-0">保留</span>
                        )}
                      </div>

                      <div className="text-xs text-slate-500 mt-1 break-all">{item.url}</div>

                      <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-400">
                        {item.path && item.path.length > 0 && (
                          <span>📁 {item.path.join(' / ')}</span>
                        )}
                        {item.addDate && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(item.addDate)}
                          </span>
                        )}
                        <span className="text-slate-500">来源: {item.sourceFile}</span>
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
