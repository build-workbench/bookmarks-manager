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
import { t } from '@/locales'

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
    estimateBackupSize(options)
      .then(setBackupSize)
      .catch(() => setBackupSize(0))
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

      setMessage({ type: 'success', text: t('backup.success', { size: formatBytes(blob.size) }) })
    } catch (error) {
      setMessage({ type: 'error', text: t('backup.failed', { error: String(error) }) })
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
          setMessage({ type: 'error', text: parseResult.error || t('backup.parseFailed') })
          setIsRestoring(false)
          return
        }

        // Show confirmation dialog with stats
        const backup = parseResult.data
        const confirmMessage = [
          t('backup.confirmRestore'),
          '',
          t('backup.bookmarkCount', { count: backup.bookmarks?.length || 0 }),
          `${t('backup.aiConfigLabel')}: ${backup.aiConfig ? t('common.yes') : t('common.no')}`,
          '',
          t('backup.warning')
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
            text: t('backup.restoreSuccess', {
              bookmarks: stats.bookmarksRestored,
              aiConfig: stats.aiConfigRestored ? t('backup.aiConfigRestored') : ''
            })
          })
          // Reload bookmarks
          await loadFromDB()
        } else {
          setMessage({
            type: 'error',
            text: t('backup.restoreFailed', { error: restoreResult.error })
          })
        }
      } catch (error) {
        setMessage({ type: 'error', text: t('backup.restoreFailed', { error: String(error) }) })
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
      <div className="rounded-lg border border-border bg-card/50 p-6">
        <div className="flex items-center gap-3 mb-4">
          <Database className="w-6 h-6 text-sky-400" />
          <h2 className="text-xl font-semibold">{t('backup.pageTitle')}</h2>
        </div>

        <p className="text-muted text-sm mb-6">
          {t('backup.description')}
          <br />
          <span className="text-amber-400">{t('backup.localNote')}</span>
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
        <div className="rounded-lg border border-border bg-card/30 p-4 mb-6">
          <div className="flex items-center gap-2 mb-3 text-sm font-medium text-foreground">
            <Settings className="w-4 h-4" />
            {t('backup.options')}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="flex items-center gap-2 text-sm text-muted cursor-pointer">
              <input
                type="checkbox"
                checked={options.includeBookmarks}
                onChange={(e) => setOptions((o) => ({ ...o, includeBookmarks: e.target.checked }))}
                className="rounded border-border"
              />
              <Database className="w-4 h-4 text-muted" />
              {t('backup.bookmarkData')}
            </label>

            <label className="flex items-center gap-2 text-sm text-muted cursor-pointer">
              <input
                type="checkbox"
                checked={options.includeAIConfig}
                onChange={(e) => setOptions((o) => ({ ...o, includeAIConfig: e.target.checked }))}
                className="rounded border-border"
              />
              <Brain className="w-4 h-4 text-muted" />
              {t('backup.aiConfigData')}
            </label>
          </div>

          <div className="mt-4 pt-3 border-t border-border text-xs text-muted">
            {t('backup.estimatedSize')}:{' '}
            <span className="text-muted">{formatBytes(backupSize)}</span>
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
            {isCreatingBackup ? t('backup.creating') : t('backup.create')}
          </button>

          <label className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition flex items-center gap-2 cursor-pointer">
            <Upload className="w-4 h-4" />
            {isRestoring ? t('backup.restoring') : t('backup.restore')}
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
      <div className="rounded-lg border border-border bg-card/30 p-6">
        <h3 className="font-medium mb-4">{t('backup.faq.title')}</h3>

        <div className="space-y-4 text-sm text-muted">
          <div>
            <div className="text-foreground font-medium mb-1">{t('backup.faq.q1')}</div>
            <p>{t('backup.faq.a1')}</p>
          </div>

          <div>
            <div className="text-foreground font-medium mb-1">{t('backup.faq.q2')}</div>
            <p>{t('backup.faq.a2')}</p>
          </div>

          <div>
            <div className="text-foreground font-medium mb-1">{t('backup.faq.q3')}</div>
            <p>{t('backup.faq.a3')}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
