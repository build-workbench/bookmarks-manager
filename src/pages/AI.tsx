import { Settings } from 'lucide-react'
import { AISettings } from '@/ui/AISettings'
import { t } from '@/locales'

export default function AI() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <section className="glass-card p-6">
        <div className="mb-4 flex items-center gap-3">
          <div className="icon-badge h-11 w-11 bg-gradient-to-br from-violet-500/15 via-violet-500/10 to-sky-500/15 border border-violet-500/20 text-violet-500 dark:text-violet-400">
            <Settings className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">{t('ai.pageTitle')}</h1>
        </div>
        <p className="text-sm text-muted leading-relaxed">{t('ai.description')}</p>
      </section>

      <AISettings />
    </div>
  )
}
