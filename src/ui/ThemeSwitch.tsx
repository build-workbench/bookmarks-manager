import { Sun, Moon, Monitor } from 'lucide-react'
import { usePreferencesStore, type Theme } from '@/store/usePreferencesStore'
import { t } from '@/locales'

const themeOptions: { value: Theme; icon: typeof Sun; label: string }[] = [
  { value: 'light', icon: Sun, label: t('theme.light') },
  { value: 'dark', icon: Moon, label: t('theme.dark') },
  { value: 'auto', icon: Monitor, label: t('theme.auto') }
]

export function ThemeSwitch() {
  const { theme, setTheme } = usePreferencesStore()

  return (
    <div
      className="flex items-center gap-0.5 rounded-lg bg-card-hover/50 p-1"
      role="radiogroup"
      aria-label={t('aria.themeSwitch')}
    >
      {themeOptions.map((option) => {
        const Icon = option.icon
        const isActive = theme === option.value

        return (
          <button
            key={option.value}
            onClick={() => setTheme(option.value)}
            className={`rounded-md p-1.5 transition-colors ${
              isActive ? 'bg-sky-600 text-white' : 'text-muted hover:bg-card-hover hover:text-white'
            }`}
            role="radio"
            aria-checked={isActive}
            aria-label={option.label}
            title={option.label}
          >
            <Icon className="h-4 w-4" />
          </button>
        )
      })}
    </div>
  )
}
