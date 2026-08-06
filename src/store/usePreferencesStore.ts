import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { setI18nLanguage, detectBrowserLanguage, type Language } from '@/locales'

export type Theme = 'light' | 'dark' | 'auto'
export type { Language }

interface PreferencesState {
  theme: Theme
  language: Language
  setTheme: (theme: Theme) => void
  setLanguage: (language: Language) => void
}

function applyTheme(theme: Theme) {
  const root = document.documentElement
  const isDark =
    theme === 'dark' ||
    (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)

  root.classList.toggle('dark', isDark)

  const themeColor = document.querySelector('meta[name="theme-color"]')
  if (themeColor) {
    themeColor.setAttribute('content', isDark ? '#020617' : '#f8fafc')
  }
}

function applyLanguage(language: Language) {
  document.documentElement.lang = language
  setI18nLanguage(language)
}

function detectSystemTheme(): Theme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      theme: 'auto',
      language: 'zh-CN',

      setTheme: (theme) => {
        set({ theme })
        applyTheme(theme)
      },

      setLanguage: (language) => {
        set({ language })
        applyLanguage(language)
      }
    }),
    {
      name: 'preferences'
    }
  )
)

export function initializePreferences() {
  const state = usePreferencesStore.getState()

  const stored = localStorage.getItem('preferences')
  if (!stored) {
    const detectedLang = detectBrowserLanguage()
    const detectedTheme = detectSystemTheme()

    usePreferencesStore.setState({
      theme: detectedTheme,
      language: detectedLang
    })

    applyTheme(detectedTheme)
    applyLanguage(detectedLang)
  } else {
    applyTheme(state.theme)
    applyLanguage(state.language)
  }
}

export function watchSystemTheme() {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

  const handler = () => {
    const { theme } = usePreferencesStore.getState()
    if (theme === 'auto') {
      applyTheme('auto')
    }
  }

  mediaQuery.addEventListener('change', handler)
  return () => mediaQuery.removeEventListener('change', handler)
}
