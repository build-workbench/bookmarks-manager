import { useState, useEffect } from 'react'
import {
  Settings,
  Key,
  Server,
  Cpu,
  CheckCircle,
  XCircle,
  Loader2,
  Eye,
  EyeOff
} from 'lucide-react'
import { useAIStore } from '@/store/useAIStore'
import { t } from '@/locales'
import { configService } from '@/ai/configService'
import type { LLMConfig } from '@/ai/types'

type Provider = 'openai' | 'claude' | 'custom'

interface AISettingsProps {
  onConfigSaved?: () => void
}

export function AISettings({ onConfigSaved }: AISettingsProps) {
  const { config, saveConfig, testConnection, connectionStatus, connectionError, loadConfig } =
    useAIStore()
  const [provider, setProvider] = useState<Provider>('openai')
  const [apiKey, setApiKey] = useState('')
  const [model, setModel] = useState('')
  const [baseUrl, setBaseUrl] = useState('')
  const [maxTokens, setMaxTokens] = useState(2000)
  const [temperature, setTemperature] = useState(0.7)
  const [showApiKey, setShowApiKey] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [saveResult, setSaveResult] = useState<{ success: boolean; message: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    void loadConfig()
  }, [loadConfig])

  useEffect(() => {
    if (config) {
      setProvider(config.provider)
      setApiKey(config.apiKey)
      setModel(config.model)
      setBaseUrl(config.baseUrl || '')
      setMaxTokens(config.maxTokens ?? 2000)
      setTemperature(config.temperature ?? 0.7)
    }
    setIsLoading(false)
  }, [config])

  useEffect(() => {
    if (!model || !configService.getModelsForProvider(provider).includes(model)) {
      setModel(configService.getDefaultModel(provider))
    }
  }, [provider, model])

  const getConfig = (): LLMConfig => ({
    provider,
    apiKey,
    model,
    baseUrl: provider === 'custom' ? baseUrl : undefined,
    maxTokens,
    temperature
  })

  const handleTestConnection = async () => {
    setIsTesting(true)
    try {
      await testConnection(getConfig())
    } finally {
      setIsTesting(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    setSaveResult(null)
    try {
      const result = await saveConfig(getConfig())
      if (result.success) {
        setSaveResult({ success: true, message: t('ai.configSaved') })
        onConfigSaved?.()
      } else {
        setSaveResult({ success: false, message: result.error || t('ai.saveFailed') })
      }
    } catch {
      setSaveResult({ success: false, message: t('ai.saveFailed') })
    } finally {
      setIsSaving(false)
    }
  }

  const models = configService.getModelsForProvider(provider)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-sky-400" />
        <span className="ml-2 text-muted-foreground">{t('ai.loadingConfig')}</span>
      </div>
    )
  }

  return (
    <div className="bg-card rounded-xl p-6 border border-border">
      <div className="flex items-center gap-3 mb-6">
        <Settings className="w-6 h-6 text-sky-400" />
        <h2 className="text-xl font-semibold text-foreground">{t('ai.configTitle')}</h2>
      </div>

      <div className="space-y-6">
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
            <Server className="w-4 h-4" />
            {t('ai.provider')}
          </label>
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value as Provider)}
            className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-foreground focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          >
            <option value="openai">OpenAI</option>
            <option value="claude">Claude (Anthropic)</option>
            <option value="custom">{t('ai.customEndpoint')}</option>
          </select>
        </div>

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
            <Key className="w-4 h-4" />
            API Key
          </label>
          <div className="relative">
            <input
              type={showApiKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={t('ai.apiKeyPlaceholder')}
              className="w-full bg-background border border-border rounded-lg px-4 py-2.5 pr-10 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{t('ai.apiKeyHint')}</p>
        </div>

        {provider === 'custom' && (
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
              <Server className="w-4 h-4" />
              {t('ai.endpointUrl')}
            </label>
            <input
              type="url"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://your-api.com/v1"
              className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
          </div>
        )}

        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
            <Cpu className="w-4 h-4" />
            {t('ai.model')}
          </label>
          {provider === 'custom' ? (
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder={t('ai.modelPlaceholder')}
              className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
          ) : (
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-foreground focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            >
              {models.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label>
            <div className="text-sm font-medium text-foreground mb-2">{t('ai.maxTokens')}</div>
            <input
              type="number"
              min={1}
              value={maxTokens}
              onChange={(e) => setMaxTokens(Number(e.target.value) || 1)}
              className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-foreground focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
          </label>
          <label>
            <div className="text-sm font-medium text-foreground mb-2">Temperature</div>
            <input
              type="number"
              min={0}
              max={2}
              step={0.1}
              value={temperature}
              onChange={(e) => setTemperature(Number(e.target.value))}
              className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-foreground focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
          </label>
        </div>

        {connectionStatus !== 'idle' && (
          <div
            className={`flex items-center gap-2 p-3 rounded-lg ${
              connectionStatus === 'connected'
                ? 'bg-green-900/30 text-green-400'
                : connectionStatus === 'error'
                  ? 'bg-red-900/30 text-red-400'
                  : 'bg-card-hover/50 text-muted'
            }`}
          >
            {connectionStatus === 'connected' ? (
              <CheckCircle className="w-5 h-5" />
            ) : connectionStatus === 'error' ? (
              <XCircle className="w-5 h-5" />
            ) : (
              <Loader2 className="w-5 h-5 animate-spin" />
            )}
            <span>
              {connectionStatus === 'connected'
                ? t('ai.connected')
                : connectionError || t('ai.testing')}
            </span>
          </div>
        )}

        {saveResult && (
          <div
            className={`flex items-center gap-2 p-3 rounded-lg ${
              saveResult.success ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'
            }`}
          >
            {saveResult.success ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <XCircle className="w-5 h-5" />
            )}
            <span>{saveResult.message}</span>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            onClick={handleTestConnection}
            disabled={!apiKey || isTesting || (provider === 'custom' && !baseUrl)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-muted hover:bg-card-hover disabled:bg-muted disabled:text-muted-foreground text-foreground rounded-lg transition-colors"
          >
            {isTesting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Server className="w-4 h-4" />
            )}
            {t('ai.testConnection')}
          </button>
          <button
            onClick={handleSave}
            disabled={!apiKey || !model || isSaving || (provider === 'custom' && !baseUrl)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-500 disabled:bg-muted disabled:text-muted-foreground text-white rounded-lg transition-colors"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
            {t('ai.saveConfig')}
          </button>
        </div>
      </div>
    </div>
  )
}
