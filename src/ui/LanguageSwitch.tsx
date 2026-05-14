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
      className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-muted transition-colors hover:bg-card-hover hover:text-foreground"
      aria-label={language === 'zh-CN' ? 'Switch to English' : '切换到中文'}
    >
      <Globe className="h-4 w-4" />
      <span>{language === 'zh-CN' ? 'EN' : '中文'}</span>
    </button>
  )
}
