import { useState } from 'react'
import useBookmarksStore from '../store/useBookmarksStore'

export default function UploadMerge() {
  const { rawItems, mergedItems, duplicates, importing, importFiles, mergeAndDedup, clear, exportHTML } = useBookmarksStore()
  const [readyToExport, setReadyToExport] = useState(false)

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return
    await importFiles(files)
  }

  async function onMerge() {
    await mergeAndDedup()
    setReadyToExport(true)
  }

  function onExport() {
    const html = exportHTML()
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'bookmarks_merged.html'
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="rounded border border-slate-800 p-4">
        <div className="text-sm mb-2">选择导出的书签 HTML 文件，支持多选</div>
        <input type="file" multiple accept=".html,.htm" onChange={onChange} className="block" />
        <div className="text-xs text-slate-400 mt-2">Chrome、Firefox、Edge、Safari 导出的 Netscape Bookmark 格式</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded border border-slate-800 p-4">
          <div className="text-slate-400 text-sm">原始条目</div>
          <div className="text-2xl font-semibold mt-1">{rawItems.length}</div>
        </div>
        <div className="rounded border border-slate-800 p-4">
          <div className="text-slate-400 text-sm">合并后</div>
          <div className="text-2xl font-semibold mt-1">{mergedItems.length}</div>
        </div>
        <div className="rounded border border-slate-800 p-4">
          <div className="text-slate-400 text-sm">重复总数</div>
          <div className="text-2xl font-semibold mt-1">{Object.keys(duplicates).length}</div>
        </div>
      </div>

      <div className="flex gap-3">
        <button disabled={importing} onClick={onMerge} className="px-4 py-2 rounded bg-sky-600 hover:bg-sky-700 disabled:opacity-50">合并去重</button>
        <button disabled={!readyToExport || mergedItems.length === 0} onClick={onExport} className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50">导出 HTML</button>
        <button onClick={() => { clear(); setReadyToExport(false) }} className="px-4 py-2 rounded bg-slate-700 hover:bg-slate-600">清空</button>
      </div>

      {importing && <div className="text-sm text-slate-400">正在导入与解析</div>}
    </div>
  )
}
