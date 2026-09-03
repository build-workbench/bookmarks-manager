import { Sun, Moon, Monitor } from 'lucide-react'
import { usePreferencesStore, type Theme } from '@/store/usePreferencesStore'
import { t } from '@/locales'

const themeOptions: { value: Theme; icon: typeof Sun; labelKey: 'theme.light' | 'theme.dark' | 'theme.auto' }[] = [
  { value: 'light', icon: Sun, labelKey: 'theme.light' },
  { value: 'dark', icon: Moon, labelKey: 'theme.dark' },
  { value: 'auto', icon: Monitor, labelKey: 'theme.auto' }
]

export function ThemeSwitch() {
  const { theme, setTheme } = usePreferencesStore()
  usePreferencesStore((state) => state.language)

  return (
    <div
      className="flex items-center gap-0.5 rounded-xl bg-card-hover/40 border border-border/40 p-1 shadow-subtle backdrop-blur-sm"
      role="radiogroup"
      aria-label={t('aria.themeSwitch')}
    >
      {themeOptions.map((option) => {
        const Icon = option.icon
        const isActive = theme === option.value
        const label = t(option.labelKey)

        return (
          <button
            key={option.value}
            onClick={() => setTheme(option.value)}
            className={`rounded-lg p-1.5 transition-all duration-200 ${
              isActive
                ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-sm shadow-sky-500/25 scale-[1.02]'
                : 'text-muted hover:bg-card-hover hover:text-foreground'
            }`}
            role="radio"
            aria-checked={isActive}
            aria-label={label}
            title={label}
          >
            <Icon className="h-4 w-4" />
          </button>
        )
      })}
    </div>
  )
}
