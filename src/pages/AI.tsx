import { Settings } from 'lucide-react'
import { AISettings } from '@/ui/AISettings'
import { t } from '@/locales'

export default function AI() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <section className="rounded-lg border border-border bg-card/50 p-6">
        <div className="mb-4 flex items-center gap-2">
          <Settings className="h-6 w-6 text-sky-400" />
          <h1 className="text-xl font-semibold text-foreground">{t('ai.pageTitle')}</h1>
        </div>
        <p className="text-sm text-muted">{t('ai.description')}</p>
      </section>

      <AISettings />
    </div>
  )
}
