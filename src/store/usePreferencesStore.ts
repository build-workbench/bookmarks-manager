import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { setI18nLanguage } from '@/locales'

export type Theme = 'light' | 'dark' | 'auto'
export type Language = 'zh-CN' | 'en-US'

interface PreferencesState {
  theme: Theme
  language: Language
  setTheme: (theme: Theme) => void
  setLanguage: (language: Language) => void
}

// 主题应用函数
function applyTheme(theme: Theme) {
  const root = document.documentElement
  const isDark =
    theme === 'dark' ||
    (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)

  root.classList.toggle('dark', isDark)

  // 更新 meta theme-color
  const themeColor = document.querySelector('meta[name="theme-color"]')
  if (themeColor) {
    themeColor.setAttribute('content', isDark ? '#020617' : '#f8fafc')
  }
}

// 语言应用函数
function applyLanguage(language: Language) {
  document.documentElement.lang = language
  setI18nLanguage(language)
}

// 检测浏览器语言
export function detectBrowserLanguage(): Language {
  const browserLang = navigator.language
  if (browserLang.startsWith('zh')) return 'zh-CN'
  return 'en-US'
}

// 检测系统主题偏好
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

// 初始化函数：在应用启动时调用
export function initializePreferences() {
  const state = usePreferencesStore.getState()

  // 检查是否是首次访问（localStorage 中没有数据）
  const stored = localStorage.getItem('preferences')
  if (!stored) {
    // 首次访问：检测浏览器偏好
    const detectedLang = detectBrowserLanguage()
    const detectedTheme = detectSystemTheme()

    usePreferencesStore.setState({
      theme: detectedTheme,
      language: detectedLang
    })

    applyTheme(detectedTheme)
    applyLanguage(detectedLang)
  } else {
    // 后续访问：恢复保存的设置
    applyTheme(state.theme)
    applyLanguage(state.language)
  }
}

// 监听系统主题变化
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
