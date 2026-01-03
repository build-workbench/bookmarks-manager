/**
 * AI Settings Component
 * Provides UI for configuring AI API settings
 */

import { useState, useEffect } from 'react'
import { Settings, Key, Server, Cpu, CheckCircle, XCircle, Loader2, Eye, EyeOff } from 'lucide-react'
import { configService } from '../ai/configService'
import { LLM_PROVIDERS } from '../ai/constants'
import type { LLMConfig } from '../ai/types'

type Provider = 'openai' | 'claude' | 'custom'

interface AISettingsProps {
  onConfigSaved?: () => void
}

export function AISettings({ onConfigSaved }: AISettingsProps) {
  const [provider, setProvider] = useState<Provider>('openai')
  const [apiKey, setApiKey] = useState('')
  const [model, setModel] = useState('')
  const [baseUrl, setBaseUrl] = useState('')
  const [showApiKey, setShowApiKey] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)
  const [saveResult, setSaveResult] = useState<{ success: boolean; message: string } | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load existing config on mount
  useEffect(() => {
    loadConfig()
  }, [])

  // Update model when provider changes
  useEffect(() => {
    if (!model || !configService.getModelsForProvider(provider).includes(model)) {
      setModel(configService.getDefaultModel(provider))
    }
  }, [provider])

  const loadConfig = async () => {
    setIsLoading(true)
    try {
      const config = await configService.getConfig()
      if (config) {
        setProvider(config.provider)
        setApiKey(config.apiKey)
        setModel(config.model)
        setBaseUrl(config.baseUrl || '')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const getConfig = (): LLMConfig => ({
    provider,
    apiKey,
    model,
    baseUrl: provider === 'custom' ? baseUrl : undefined
  })

  const handleTestConnection = async () => {
    setIsTesting(true)
    setTestResult(null)
    try {
      const result = await configService.testConnection(getConfig())
      setTestResult({
        success: result.success,
        message: result.success ? '连接成功！' : result.error || '连接失败'
      })
    } catch (error) {
      setTestResult({
        success: false,
        message: error instanceof Error ? error.message : '连接测试失败'
      })
    } finally {
      setIsTesting(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    setSaveResult(null)
    try {
      const result = await configService.saveConfig(getConfig())
      setSaveResult({
        success: result.success,
        message: result.success ? '配置已保存' : result.error || '保存失败'
      })
      if (result.success && onConfigSaved) {
        onConfigSaved()
      }
    } catch (error) {
      setSaveResult({
        success: false,
        message: error instanceof Error ? error.message : '保存失败'
      })
    } finally {
      setIsSaving(false)
    }
  }

  const models = configService.getModelsForProvider(provider)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-sky-400" />
        <span className="ml-2 text-gray-400">加载配置中...</span>
      </div>
    )
  }

  return (
    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
      <div className="flex items-center gap-3 mb-6">
        <Settings className="w-6 h-6 text-sky-400" />
        <h2 className="text-xl font-semibold text-white">AI 配置</h2>
      </div>

      <div className="space-y-6">
        {/* Provider Selection */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
            <Server className="w-4 h-4" />
            服务提供商
          </label>
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value as Provider)}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          >
            <option value="openai">{LLM_PROVIDERS.openai.name}</option>
            <option value="claude">{LLM_PROVIDERS.claude.name}</option>
            <option value="custom">{LLM_PROVIDERS.custom.name}</option>
          </select>
        </div>

        {/* API Key */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
            <Key className="w-4 h-4" />
            API Key
          </label>
          <div className="relative">
            <input
              type={showApiKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="输入你的 API Key"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 pr-10 text-white placeholder-gray-500 focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            API Key 安全存储在本地 IndexedDB 中，不会上传到任何服务器
          </p>
        </div>

        {/* Custom Base URL */}
        {provider === 'custom' && (
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
              <Server className="w-4 h-4" />
              API 端点 URL
            </label>
            <input
              type="url"
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              placeholder="https://your-api.com/v1"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
            <p className="mt-1 text-xs text-gray-500">
              支持 OpenAI 兼容的 API 端点（如本地 LLM 服务）
            </p>
          </div>
        )}

        {/* Model Selection */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
            <Cpu className="w-4 h-4" />
            模型
          </label>
          {provider === 'custom' ? (
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="输入模型名称"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
          ) : (
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            >
              {models.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          )}
        </div>

        {/* Test Result */}
        {testResult && (
          <div className={`flex items-center gap-2 p-3 rounded-lg ${
            testResult.success ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'
          }`}>
            {testResult.success ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <XCircle className="w-5 h-5" />
            )}
            <span>{testResult.message}</span>
          </div>
        )}

        {/* Save Result */}
        {saveResult && (
          <div className={`flex items-center gap-2 p-3 rounded-lg ${
            saveResult.success ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'
          }`}>
            {saveResult.success ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <XCircle className="w-5 h-5" />
            )}
            <span>{saveResult.message}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={handleTestConnection}
            disabled={!apiKey || isTesting || (provider === 'custom' && !baseUrl)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 text-white rounded-lg transition-colors"
          >
            {isTesting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Server className="w-4 h-4" />
            )}
            测试连接
          </button>
          <button
            onClick={handleSave}
            disabled={!apiKey || !model || isSaving || (provider === 'custom' && !baseUrl)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-500 disabled:bg-gray-800 disabled:text-gray-500 text-white rounded-lg transition-colors"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
            保存配置
          </button>
        </div>
      </div>
    </div>
  )
}
