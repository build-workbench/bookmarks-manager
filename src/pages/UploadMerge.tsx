import { useMemo, useRef, useState, type ChangeEvent } from 'react'
import { Upload, FileText, Trash2, Download, AlertCircle, CheckCircle } from 'lucide-react'
import useBookmarksStore from '../store/useBookmarksStore'

export default function UploadMerge() {
  const { rawItems, mergedItems, duplicates, importing, needsMerge, importFiles, mergeAndDedup, clear, exportHTML, removeSourceFile } = useBookmarksStore()
  const readyToExport = mergedItems.length > 0 && !needsMerge
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const dragCounter = useRef(0)

  const importedFiles = useMemo(() => {
    const counts = new Map<string, number>()
    for (const it of rawItems) {
      const key = it.sourceFile || 'Unknown'
      counts.set(key, (counts.get(key) || 0) + 1)
    }
    return Array.from(counts.entries()).sort((a, b) => a[0].localeCompare(b[0]))
  }, [rawItems])

  const isBookmarkFile = (f: File) => {
    const name = f.name.toLowerCase()
    return name.endsWith('.html') || name.endsWith('.htm')
  }

  async function doImport(files: FileList | File[]) {
    const list = Array.isArray(files) ? files : Array.from(files)
    const accepted = list.filter(isBookmarkFile)
    if (accepted.length === 0) {
      setMessage({ type: 'error', text: '未检测到可导入的 HTML 书签文件（.html/.htm）' })
      return
    }
    setMessage(null)
    try {
      await importFiles(accepted)
      setMessage({ type: 'success', text: `成功导入 ${accepted.length} 个文件` })
    } catch {
      setMessage({ type: 'error', text: '导入文件失败，请检查文件格式' })
    }
  }

  async function onChange(e: ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return
    await doImport(files)
    e.target.value = ''
  }

  async function onMerge() {
    if (rawItems.length === 0) {
      setMessage({ type: 'error', text: '请先导入书签文件' })
      return
    }
    setMessage(null)
    try {
      await mergeAndDedup()
      setMessage({ type: 'success', text: '合并完成！数据已保存到本地数据库' })
    } catch (error) {
      setMessage({ type: 'error', text: '合并失败' })
    }
  }

  function onExport() {
    try {
      const html = exportHTML()
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const timestamp = new Date().toISOString().split('T')[0]
      a.download = `bookmarks_merged_${timestamp}.html`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      setMessage({ type: 'success', text: '导出成功' })
    } catch (error) {
      setMessage({ type: 'error', text: '导出失败' })
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-slate-800 p-6 bg-slate-900/50">
        <div className="flex items-center gap-2 mb-3">
          <Upload className="w-5 h-5 text-sky-400" />
          <h3 className="font-medium">选择导出的书签 HTML 文件，支持多选</h3>
        </div>
        <label className="block cursor-pointer">
          <div
            onDragEnter={(e) => {
              e.preventDefault()
              e.stopPropagation()
              dragCounter.current += 1
              setDragActive(true)
            }}
            onDragOver={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setDragActive(true)
            }}
            onDragLeave={(e) => {
              e.preventDefault()
              e.stopPropagation()
              dragCounter.current -= 1
              if (dragCounter.current <= 0) {
                dragCounter.current = 0
                setDragActive(false)
              }
            }}
            onDrop={(e) => {
              e.preventDefault()
              e.stopPropagation()
              dragCounter.current = 0
              setDragActive(false)
              void doImport(Array.from(e.dataTransfer.files))
            }}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition ${
              dragActive ? 'border-sky-500 bg-sky-500/10' : 'border-slate-700 hover:border-sky-500'
            } ${importing ? 'opacity-60 pointer-events-none' : ''}`}
          >
            <FileText className="w-12 h-12 mx-auto mb-3 text-slate-400" />
            <div className="text-sm text-slate-300 mb-1">点击选择文件或拖拽到此处</div>
            <div className="text-xs text-slate-500">支持 Chrome、Firefox、Edge、Safari 导出的 Netscape Bookmark 格式</div>
          </div>
          <input type="file" multiple accept=".html,.htm" onChange={onChange} className="hidden" />
        </label>
      </div>

      {importedFiles.length > 0 && (
        <div className="rounded-lg border border-slate-800 p-6 bg-slate-900/30">
          <div className="text-sm font-medium mb-3">已导入文件</div>
          <div className="space-y-2">
            {importedFiles.map(([name, count]) => (
              <div
                key={name}
                className="flex items-center justify-between gap-3 rounded border border-slate-800 bg-slate-900/50 px-3 py-2"
              >
                <div className="min-w-0">
                  <div className="text-sm text-slate-200 truncate">{name}</div>
                  <div className="text-xs text-slate-500">{count} 条书签</div>
                </div>
                <button
                  onClick={() => {
                    removeSourceFile(name)
                    setMessage({ type: 'success', text: `已移除文件：${name}` })
                  }}
                  className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm transition"
                >
                  移除
                </button>
              </div>
            ))}
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

      {needsMerge && mergedItems.length > 0 && (
        <div className="rounded-lg border p-4 flex items-start gap-3 bg-amber-500/10 border-amber-500/50 text-amber-400">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            你已导入新的书签文件，但当前统计/搜索/导出仍基于上一次合并结果。请点击“合并去重”更新。
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg border border-slate-800 p-5 bg-slate-900/30">
          <div className="text-slate-400 text-sm mb-1">原始条目</div>
          <div className="text-3xl font-bold text-sky-400">{rawItems.length}</div>
          <div className="text-xs text-slate-500 mt-2">已导入的总书签数</div>
        </div>
        <div className="rounded-lg border border-slate-800 p-5 bg-slate-900/30">
          <div className="text-slate-400 text-sm mb-1">合并后</div>
          <div className="text-3xl font-bold text-emerald-400">{mergedItems.length}</div>
          <div className="text-xs text-slate-500 mt-2">去重后的书签数</div>
        </div>
        <div className="rounded-lg border border-slate-800 p-5 bg-slate-900/30">
          <div className="text-slate-400 text-sm mb-1">重复总数</div>
          <div className="text-3xl font-bold text-orange-400">{Object.keys(duplicates).length}</div>
          <div className="text-xs text-slate-500 mt-2">检测到的重复簇</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button 
          disabled={importing || rawItems.length === 0} 
          onClick={onMerge} 
          className="px-5 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition flex items-center gap-2"
        >
          <CheckCircle className="w-4 h-4" />
          合并去重
        </button>
        <button 
          disabled={!readyToExport || mergedItems.length === 0} 
          onClick={onExport} 
          className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          导出 HTML
        </button>
        <button 
          onClick={() => { void clear(); setMessage(null) }} 
          className="px-5 py-2.5 rounded-lg bg-slate-700 hover:bg-slate-600 font-medium transition flex items-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
          清空
        </button>
      </div>

      {importing && (
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <div className="w-4 h-4 border-2 border-sky-400 border-t-transparent rounded-full animate-spin"></div>
          <span>正在导入与解析...</span>
        </div>
      )}
    </div>
  )
}
