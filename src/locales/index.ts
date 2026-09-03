import zhCN from './zh-CN'
import enUS from './en-US'

export type Language = 'zh-CN' | 'en-US'
export type TranslationKey = keyof typeof zhCN

const translations = {
  'zh-CN': zhCN,
  'en-US': enUS
} as const

// 检测浏览器语言
export function detectBrowserLanguage(): Language {
  if (typeof navigator !== 'undefined') {
    const browserLang = navigator.language
    if (browserLang && browserLang.startsWith('zh')) return 'zh-CN'
  }
  return 'en-US'
}

function getInitialLanguage(): Language {
  try {
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem('preferences')
      if (stored) {
        const parsed = JSON.parse(stored)
        if (parsed.state?.language === 'zh-CN' || parsed.state?.language === 'en-US') {
          return parsed.state.language
        }
      }
    }
  } catch {}
  return 'zh-CN'
}

let currentLanguage: Language = typeof window !== 'undefined' ? getInitialLanguage() : 'zh-CN'
if (typeof document !== 'undefined') {
  document.documentElement.lang = currentLanguage
}

export function setI18nLanguage(lang: Language): void {
  currentLanguage = lang
  if (typeof document !== 'undefined') {
    document.documentElement.lang = lang
  }
}

export function getI18nLanguage(): Language {
  return currentLanguage
}

// Simple string interpolation: replaces {key} with params[key]
function interpolate(
  template: string,
  params?: Record<string, string | number | undefined>
): string {
  if (!params) return template
  return template.replace(/\{(\w+)\}/g, (_, key) =>
    params[key] !== undefined ? String(params[key]) : `{${key}}`
  )
}

// Overload for type-safe key without params
export function t(key: TranslationKey): string
// Overload for dynamic string key without params
export function t(key: string): string
// Overload for key with params
export function t(key: string, params: Record<string, string | number | undefined>): string
// Implementation
export function t(key: string, params?: Record<string, string | number | undefined>): string {
  const translationsForLang = translations[currentLanguage]
  // @ts-expect-error - Allow dynamic key access for flexibility
  const template = translationsForLang[key] || key
  return interpolate(template, params)
}
