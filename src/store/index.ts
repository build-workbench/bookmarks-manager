/**
 * Store entry point
 * Re-exports all Zustand stores for convenient access
 */

import useBookmarksStore from './useBookmarksStore'
import { useAIStore } from './useAIStore'
import {
  usePreferencesStore,
  initializePreferences,
  watchSystemTheme,
  detectBrowserLanguage
} from './usePreferencesStore'

// Re-export all stores
export {
  useBookmarksStore,
  useAIStore,
  usePreferencesStore,
  initializePreferences,
  watchSystemTheme,
  detectBrowserLanguage
}

// Re-export the store as default
export default useBookmarksStore

// Type exports for external use
export type { Bookmark } from '@/utils/bookmarkParser'
export type { LLMConfig } from '@/ai/types'
