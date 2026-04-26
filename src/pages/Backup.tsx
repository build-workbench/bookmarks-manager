import { useState, useRef, useEffect } from 'react'
import { Download, Upload, Database, Settings, Brain, AlertCircle, CheckCircle } from 'lucide-react'
import {
  exportBackupAsJSON,
  parseBackup,
  restoreFromBackup,
  estimateBackupSize,
  formatBytes,
  type BackupOptions
} from '@/utils/backup'
import useBookmarksStore from '@/store/useBookmarksStore'

export default function Backup() {
  const [isCreatingBackup, setIsCreatingBackup] = useState(false)
  const [isRestoring, setIsRestoring] = useState(false)
  const [message, setMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)
  const [backupSize, setBackupSize] = useState<number>(0)

  const [options, setOptions] = useState<BackupOptions>({
    includeBookmarks: true,
    includeAIConfig: true
  })

  const fileInputRef = useRef<HTMLInputElement>(null)
  const { loadFromDB } = useBookmarksStore()

  useEffect(() => {
    estimateBackupSize(options).then(setBackupSize)
  }, [options])

  async function handleCreateBackup() {
    setIsCreatingBackup(true)
    setMessage(null)

    try {
      const json = await exportBackupAsJSON(options)
      const blob = new Blob([json], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const timestamp = new Date().toISOString().split('T')[0]
      a.download = `bookmarks_backup_${timestamp}.json`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)

      setMessage({ type: 'success', text: `备份成功！文件大小: ${formatBytes(blob.size)}` })
    } catch (error) {
      setMessage({ type: 'error', text: `备份失败: ${String(error)}` })
    } finally {
      setIsCreatingBackup(false)
    }
  }

  function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    setIsRestoring(true)
    setMessage(null)

    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string
        const parseResult = parseBackup(content)

        if (!parseResult.success || !parseResult.data) {
          setMessage({ type: 'error', text: parseResult.error || '备份文件解析失败' })
          setIsRestoring(false)
          return
        }

        // Show confirmation dialog with stats
        const backup = parseResult.data
        const confirmMessage = [
          '确定要恢复以下数据吗？',
          '',
          `书签: ${backup.bookmarks?.length || 0} 条`,
          `AI配置: ${backup.aiConfig ? '有' : '无'}`,
          '',
          '⚠️ 这将替换当前所有数据！'
        ].join('\n')

        if (!confirm(confirmMessage)) {
          setIsRestoring(false)
          return
        }

        const restoreResult = await restoreFromBackup(parseResult.data, 'replace')

        if (restoreResult.success) {
          const stats = restoreResult.stats
          setMessage({
            type: 'success',
            text: `恢复成功！书签: ${stats.bookmarksRestored} 条${stats.aiConfigRestored ? '，AI 配置已恢复' : ''}`
          })
          // Reload bookmarks
          await loadFromDB()
        } else {
          setMessage({ type: 'error', text: `恢复失败: ${restoreResult.error}` })
        }
      } catch (error) {
        setMessage({ type: 'error', text: `恢复失败: ${String(error)}` })
      } finally {
        setIsRestoring(false)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }
    }

    reader.readAsText(file)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="rounded-lg border border-slate-800 bg-slate-900/50 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Database className="w-6 h-6 text-sky-400" />
          <h2 className="text-xl font-semibold">数据备份与恢复</h2>
        </div>

        <p className="text-slate-400 text-sm mb-6">
          备份功能可以将您的书签数据与可选 AI 配置导出为一个 JSON 文件。
          您可以使用该文件在另一台设备上恢复数据，或作为数据归档。
          <br />
          <span className="text-amber-400">注意：所有数据都在本地处理，不会上传到任何服务器。</span>
        </p>

        {message && (
          <div
            className={`rounded-lg border p-4 flex items-center gap-3 mb-6 ${
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

        {/* Backup Options */}
        <div className="rounded-lg border border-slate-800 bg-slate-900/30 p-4 mb-6">
          <div className="flex items-center gap-2 mb-3 text-sm font-medium text-slate-200">
            <Settings className="w-4 h-4" />
            备份选项
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={options.includeBookmarks}
                onChange={(e) => setOptions((o) => ({ ...o, includeBookmarks: e.target.checked }))}
                className="rounded border-slate-600"
              />
              <Database className="w-4 h-4 text-slate-400" />
              书签数据
            </label>

            <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={options.includeAIConfig}
                onChange={(e) => setOptions((o) => ({ ...o, includeAIConfig: e.target.checked }))}
                className="rounded border-slate-600"
              />
              <Brain className="w-4 h-4 text-slate-400" />
              AI 配置（API密钥等）
            </label>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-xs text-slate-500">
            预计备份大小: <span className="text-slate-300">{formatBytes(backupSize)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleCreateBackup}
            disabled={isCreatingBackup}
            className="px-5 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            {isCreatingBackup ? '正在创建备份...' : '创建备份'}
          </button>

          <label className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition flex items-center gap-2 cursor-pointer">
            <Upload className="w-4 h-4" />
            {isRestoring ? '正在恢复...' : '从备份恢复'}
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              disabled={isRestoring}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* FAQ */}
      <div className="rounded-lg border border-slate-800 bg-slate-900/30 p-6">
        <h3 className="font-medium mb-4">常见问题</h3>

        <div className="space-y-4 text-sm text-slate-400">
          <div>
            <div className="text-slate-200 font-medium mb-1">备份文件包含什么？</div>
            <p>
              备份文件是一个 JSON 格式的文本文件，包含您选择的书签数据，以及可选的 AI
              配置。您可以用文本编辑器查看其内容。
            </p>
          </div>

          <div>
            <div className="text-slate-200 font-medium mb-1">如何迁移到另一台设备？</div>
            <p>
              在旧设备上创建备份并下载 JSON
              文件，然后在新设备上打开此应用，进入备份页面选择"从备份恢复"即可。
            </p>
          </div>

          <div>
            <div className="text-slate-200 font-medium mb-1">API密钥安全吗？</div>
            <p>
              是的。备份文件存储在您的本地设备上，不会上传到任何服务器。建议您妥善保管备份文件，因为其中可能包含敏感的
              API 密钥。
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
