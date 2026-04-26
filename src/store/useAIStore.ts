import { create } from 'zustand'
import type { LLMConfig } from '@/ai/types'
import { configService } from '@/ai/configService'
import { createAdapter } from '@/ai/adapters'

interface AIState {
  config: LLMConfig | null
  isConfigured: boolean
  connectionStatus: 'idle' | 'testing' | 'connected' | 'error'
  connectionError: string | null
  loadConfig: () => Promise<void>
  saveConfig: (config: LLMConfig) => Promise<void>
  testConnection: () => Promise<boolean>
  reset: () => void
}

const initialState = {
  config: null,
  isConfigured: false,
  connectionStatus: 'idle' as const,
  connectionError: null
}

export const useAIStore = create<AIState>((set, get) => ({
  ...initialState,

  loadConfig: async () => {
    try {
      const config = await configService.getConfig()
      set({
        config,
        isConfigured: config !== null
      })
    } catch (error) {
      console.error('Failed to load AI config:', error)
    }
  },

  saveConfig: async (config: LLMConfig) => {
    try {
      await configService.saveConfig(config)
      set({
        config,
        isConfigured: true,
        connectionStatus: 'idle',
        connectionError: null
      })
    } catch (error) {
      console.error('Failed to save AI config:', error)
      throw error
    }
  },

  testConnection: async () => {
    const { config } = get()

    if (!config) {
      set({ connectionStatus: 'error', connectionError: '未配置 API' })
      return false
    }

    set({ connectionStatus: 'testing', connectionError: null })

    try {
      const adapter = createAdapter(config)
      const isValid = await adapter.validateApiKey()

      if (isValid) {
        set({ connectionStatus: 'connected', connectionError: null })
        return true
      }

      set({ connectionStatus: 'error', connectionError: 'API Key 无效' })
      return false
    } catch (error) {
      const message = error instanceof Error ? error.message : '连接测试失败'
      set({ connectionStatus: 'error', connectionError: message })
      return false
    }
  },

  reset: () => {
    set({ ...initialState })
  }
}))
