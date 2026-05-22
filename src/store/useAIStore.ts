import { create } from 'zustand'
import type { LLMConfig } from '@/ai/types'
import type { ConfigServiceResult } from '@/ai/configService'
import { createAdapter } from '@/ai/adapters'
import { configService } from '@/ai/configService'
import { t } from '@/locales'

interface AIState {
  config: LLMConfig | null
  connectionStatus: 'idle' | 'testing' | 'connected' | 'error'
  connectionError: string | null
  loadConfig: () => Promise<void>
  saveConfig: (config: LLMConfig) => Promise<ConfigServiceResult>
  testConnection: (config: LLMConfig) => Promise<boolean>
}

const initialState = {
  config: null,
  connectionStatus: 'idle' as const,
  connectionError: null
}

export const useAIStore = create<AIState>((set) => ({
  ...initialState,

  loadConfig: async () => {
    const config = await configService.getConfig()
    set({ config })
  },

  saveConfig: async (config: LLMConfig) => {
    const result = await configService.saveConfig(config)
    if (result.success) {
      set({ config })
    }
    return result
  },

  testConnection: async (config: LLMConfig) => {
    set({ connectionStatus: 'testing', connectionError: null })

    try {
      const adapter = createAdapter(config)
      const isValid = await adapter.validateApiKey()

      if (isValid) {
        set({ connectionStatus: 'connected', connectionError: null, config })
        return true
      }

      set({ connectionStatus: 'error', connectionError: t('ai.invalidApiKey') })
      return false
    } catch (error) {
      const message = error instanceof Error ? error.message : t('ai.connectionFailed')
      set({ connectionStatus: 'error', connectionError: message })
      return false
    }
  }
}))
