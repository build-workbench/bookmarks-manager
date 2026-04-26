import type { LLMProvider } from './types'

// Supported providers for the optional BYOK settings surface.
export const LLM_PROVIDERS: Record<string, LLMProvider> = {
  openai: {
    name: 'OpenAI',
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'],
    defaultModel: 'gpt-4o-mini',
    baseUrl: 'https://api.openai.com/v1'
  },
  claude: {
    name: 'Claude (Anthropic)',
    models: ['claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022', 'claude-3-opus-20240229'],
    defaultModel: 'claude-3-5-sonnet-20241022',
    baseUrl: 'https://api.anthropic.com/v1'
  },
  custom: {
    name: 'Custom Endpoint',
    models: [],
    defaultModel: '',
    baseUrl: ''
  }
}

// Approximate cost per 1K tokens (USD) for connection feedback and adapter estimates.
export const TOKEN_COSTS: Record<string, { input: number; output: number }> = {
  'gpt-4o': { input: 0.0025, output: 0.01 },
  'gpt-4o-mini': { input: 0.00015, output: 0.0006 },
  'gpt-4-turbo': { input: 0.01, output: 0.03 },
  'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 },
  'claude-3-5-sonnet-20241022': { input: 0.003, output: 0.015 },
  'claude-3-5-haiku-20241022': { input: 0.001, output: 0.005 },
  'claude-3-opus-20240229': { input: 0.015, output: 0.075 }
}

// Defaults for locally stored provider configuration.
export const DEFAULT_MAX_TOKENS = 2000
export const DEFAULT_TEMPERATURE = 0.7
