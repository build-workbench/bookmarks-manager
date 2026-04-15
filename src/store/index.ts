/**
 * Store entry point with Worker support toggle
 * Re-exports all Zustand stores for convenient access
 */

import { useBookmarksStoreWithWorker } from './useBookmarksStore.worker'
import useBookmarksStoreOriginal from './useBookmarksStore'
import { useAIStore } from './useAIStore'
import useCleanupStore from './useCleanupStore'

// Use original store by default for stability
// Worker store can be enabled via feature flag
const USE_WORKER_STORE = import.meta.env.VITE_USE_WORKER === 'true'

// Export the appropriate bookmarks store based on feature flag
export const useBookmarksStore = USE_WORKER_STORE
  ? useBookmarksStoreWithWorker
  : useBookmarksStoreOriginal

// Re-export all stores
export { useAIStore }
export { useCleanupStore }

// Re-export the original store as default for backward compatibility
export default useBookmarksStoreOriginal

// Type exports for external use
export type { Bookmark } from '@/utils/bookmarkParser'
export type { LLMConfig, UsageStats, UsageLimits } from '@/ai/types'
