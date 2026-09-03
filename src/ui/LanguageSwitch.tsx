import { Globe } from 'lucide-react'
import { usePreferencesStore } from '@/store/usePreferencesStore'

export function LanguageSwitch() {
  const { language, setLanguage } = usePreferencesStore()

  const toggleLanguage = () => {
    setLanguage(language === 'zh-CN' ? 'en-US' : 'zh-CN')
  }

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-1.5 rounded-xl bg-card-hover/40 border border-border/40 px-2.5 py-1.5 text-xs font-semibold text-muted transition-all duration-200 hover:bg-card-hover hover:text-foreground shadow-subtle"
      aria-label={language === 'zh-CN' ? 'Switch to English' : '切换到中文'}
    >
      <Globe className="h-3.5 w-3.5 text-sky-500" />
      <span>{language === 'zh-CN' ? 'EN' : '中文'}</span>
    </button>
  )
}
