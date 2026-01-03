import { useEffect, useState } from 'react'
import {
  Key, Save, Play, Sparkles, AlertCircle, Settings, Zap,
  Tag, FileText, Copy, Heart, Search, BarChart3, Loader2,
  CheckCircle, XCircle, RefreshCw, Trash2, Download
} from 'lucide-react'
import { useAIStore } from '../store/useAIStore'
import useBookmarksStore from '../store/useBookmarksStore'
import { LLM_PROVIDERS } from '../ai/constants'
import type { LLMConfig } from '../ai/types'
import { aiService } from '../ai/aiService'

type TabType = 'config' | 'categorize' | 'summarize' | 'health' | 'search' | 'report' | 'usage'

export default function AI() {
  const { mergedItems, stats, duplicates } = useBookmarksStore()
  const {
    config, isConfigured, connectionStatus, connectionError,
    isProcessing, currentOperation, progress,
    categorySuggestions, summaries, healthIssues, latestReport,
    lastSearchResult, usageStats, usageLimits,
    loadConfig, saveConfig, testConnection,
    categorizeBookmarks, summarizeBookmarks, analyzeHealth,
    searchWithAI, generateReport, dismissHealthIssue,
    refreshUsageStats, setUsageLimits, clearCache
  } = useAIStore()

  const [activeTab, setActiveTab] = useState<TabType>('config')
  const [localConfig, setLocalConfig] = useState<Partial<LLMConfig>>({
    provider: 'openai',
    apiKey: '',
    model: 'gpt-4o-mini',
    maxTokens: 2000,
    temperature: 0.7
  })
  const [searchQuery, setSearchQuery] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    loadConfig()
    refreshUsageStats()
  }, [loadConfig, refreshUsageStats])

  useEffect(() => {
    if (config) {
      setLocalConfig(config)
    }
  }, [config])

  const handleSaveConfig = async () => {
    if (!localConfig.apiKey) return
    await saveConfig(localConfig as LLMConfig)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleTestConnection = async () => {
    await testConnection()
  }

  const handleCategorize = async () => {
    if (mergedItems.length === 0) return
    await categorizeBookmarks(mergedItems.slice(0, 50))
  }

  const handleSummarize = async () => {
    if (mergedItems.length === 0) return
    await summarizeBookmarks(mergedItems.slice(0, 20))
  }

  const handleHealthCheck = async () => {
    if (mergedItems.length === 0) return
    await analyzeHealth(mergedItems.slice(0, 50))
  }

  const handleSearch = async () => {
    if (!searchQuery.trim() || mergedItems.length === 0) return
    await searchWithAI(searchQuery, mergedItems)
  }

  const handleGenerateReport = async () => {
    if (mergedItems.length === 0 || !stats) return
    await generateReport(mergedItems, {
      domainStats: stats.byDomain,
      yearStats: stats.byYear,
      folderStats: {}
    })
  }

  const provider = LLM_PROVIDERS[localConfig.provider || 'openai']

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'config', label: '配置', icon: <Settings className="w-4 h-4" /> },
    { id: 'categorize', label: '分类', icon: <Tag className="w-4 h-4" /> },
    { id: 'summarize', label: '摘要', icon: <FileText className="w-4 h-4" /> },
    { id: 'health', label: '健康检查', icon: <Heart className="w-4 h-4" /> },
    { id: 'search', label: 'AI 搜索', icon: <Search className="w-4 h-4" /> },
    { id: 'report', label: '报告', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'usage', label: '用量', icon: <Zap className="w-4 h-4" /> }
  ]


  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="rounded-lg border border-slate-800 p-6 bg-gradient-to-br from-purple-500/5 to-pink-500/5">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-6 h-6 text-purple-400" />
          <h2 className="text-xl font-semibold">AI 智能分析</h2>
          {isConfigured && connectionStatus === 'connected' && (
            <span className="px-2 py-0.5 text-xs bg-green-500/20 text-green-400 rounded-full">已连接</span>
          )}
        </div>
        <p className="text-sm text-slate-400">
          使用 AI 大模型分析和管理你的书签。支持智能分类、内容摘要、健康检查、自然语言搜索和集合报告。
        </p>
      </div>

      {/* Processing indicator */}
      {isProcessing && (
        <div className="rounded-lg border border-sky-800 p-4 bg-sky-900/20">
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-sky-400 animate-spin" />
            <div className="flex-1">
              <div className="text-sm font-medium">{currentOperation}</div>
              {progress && (
                <div className="mt-2">
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-sky-500 transition-all"
                      style={{ width: `${(progress.current / progress.total) * 100}%` }}
                    />
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    {progress.current} / {progress.total}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-800/50 rounded-lg overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-slate-700 text-white'
                : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="rounded-lg border border-slate-800 p-6 bg-slate-900/50">
        {/* Config Tab */}
        {activeTab === 'config' && (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Key className="w-4 h-4 text-sky-400" />
                <span>API 配置</span>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">提供商</label>
                  <select
                    value={localConfig.provider}
                    onChange={e => setLocalConfig({ ...localConfig, provider: e.target.value as LLMConfig['provider'], model: LLM_PROVIDERS[e.target.value]?.defaultModel || '' })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 focus:border-sky-500 focus:outline-none"
                  >
                    <option value="openai">OpenAI</option>
                    <option value="claude">Claude (Anthropic)</option>
                    <option value="custom">自定义端点</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-1">模型</label>
                  <select
                    value={localConfig.model}
                    onChange={e => setLocalConfig({ ...localConfig, model: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 focus:border-sky-500 focus:outline-none"
                  >
                    {provider?.models.map(model => (
                      <option key={model} value={model}>{model}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">API Key</label>
                <input
                  type="password"
                  value={localConfig.apiKey}
                  onChange={e => setLocalConfig({ ...localConfig, apiKey: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 focus:border-sky-500 focus:outline-none"
                  placeholder="在此粘贴你的 API Key"
                />
              </div>

              {localConfig.provider === 'custom' && (
                <div>
                  <label className="block text-sm text-slate-400 mb-1">自定义端点 URL</label>
                  <input
                    type="text"
                    value={localConfig.baseUrl || ''}
                    onChange={e => setLocalConfig({ ...localConfig, baseUrl: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 focus:border-sky-500 focus:outline-none"
                    placeholder="https://api.example.com/v1"
                  />
                </div>
              )}

              <div className="flex items-center gap-3">
                <button
                  onClick={handleSaveConfig}
                  disabled={!localConfig.apiKey}
                  className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2 text-sm font-medium"
                >
                  <Save className="w-4 h-4" />
                  {saved ? '已保存' : '保存配置'}
                </button>

                <button
                  onClick={handleTestConnection}
                  disabled={!isConfigured || connectionStatus === 'testing'}
                  className="px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2 text-sm font-medium"
                >
                  {connectionStatus === 'testing' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : connectionStatus === 'connected' ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : connectionStatus === 'error' ? (
                    <XCircle className="w-4 h-4 text-red-400" />
                  ) : (
                    <Zap className="w-4 h-4" />
                  )}
                  测试连接
                </button>
              </div>

              {connectionError && (
                <div className="text-sm text-red-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  {connectionError}
                </div>
              )}

              <div className="flex items-start gap-2 text-xs text-slate-400 bg-slate-800/50 p-3 rounded">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium mb-1">隐私说明</p>
                  <p>API Key 仅存储在你的浏览器 IndexedDB 中，不会上传到任何服务器。分析时只发送书签的标题和 URL，不发送其他个人数据。</p>
                </div>
              </div>
            </div>
          </div>
        )}


        {/* Categorize Tab */}
        {activeTab === 'categorize' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">智能分类</h3>
                <p className="text-sm text-slate-400">AI 分析书签内容并建议分类</p>
              </div>
              <button
                onClick={handleCategorize}
                disabled={!isConfigured || isProcessing || mergedItems.length === 0}
                className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2 text-sm font-medium"
              >
                <Tag className="w-4 h-4" />
                开始分类
              </button>
            </div>

            {categorySuggestions.size > 0 && (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {Array.from(categorySuggestions.values()).map(suggestion => {
                  const bookmark = mergedItems.find(b => b.id === suggestion.bookmarkId)
                  return (
                    <div key={suggestion.bookmarkId} className="p-3 bg-slate-800/50 rounded-lg">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{bookmark?.title || '未知'}</div>
                          <div className="text-xs text-slate-400 truncate">{bookmark?.url}</div>
                        </div>
                        <div className="text-right">
                          <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-sm">
                            {suggestion.suggestedCategory}
                          </span>
                          <div className="text-xs text-slate-400 mt-1">
                            置信度: {Math.round(suggestion.confidence * 100)}%
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-slate-400 mt-2">{suggestion.reasoning}</div>
                    </div>
                  )
                })}
              </div>
            )}

            {categorySuggestions.size === 0 && !isProcessing && (
              <div className="text-center py-8 text-slate-400">
                <Tag className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>点击"开始分类"让 AI 分析你的书签</p>
              </div>
            )}
          </div>
        )}

        {/* Summarize Tab */}
        {activeTab === 'summarize' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">内容摘要</h3>
                <p className="text-sm text-slate-400">AI 为书签生成简短描述</p>
              </div>
              <button
                onClick={handleSummarize}
                disabled={!isConfigured || isProcessing || mergedItems.length === 0}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2 text-sm font-medium"
              >
                <FileText className="w-4 h-4" />
                生成摘要
              </button>
            </div>

            {summaries.size > 0 && (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {Array.from(summaries.values()).map(summary => {
                  const bookmark = mergedItems.find(b => b.id === summary.bookmarkId)
                  return (
                    <div key={summary.bookmarkId} className="p-3 bg-slate-800/50 rounded-lg">
                      <div className="font-medium truncate">{bookmark?.title || '未知'}</div>
                      <div className="text-sm text-slate-300 mt-1">{summary.summary}</div>
                      <div className="flex gap-1 mt-2">
                        {summary.keywords.map(kw => (
                          <span key={kw} className="px-2 py-0.5 bg-slate-700 rounded text-xs">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {summaries.size === 0 && !isProcessing && (
              <div className="text-center py-8 text-slate-400">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>点击"生成摘要"让 AI 描述你的书签内容</p>
              </div>
            )}
          </div>
        )}

        {/* Health Tab */}
        {activeTab === 'health' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">健康检查</h3>
                <p className="text-sm text-slate-400">识别可能过时或有问题的书签</p>
              </div>
              <button
                onClick={handleHealthCheck}
                disabled={!isConfigured || isProcessing || mergedItems.length === 0}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2 text-sm font-medium"
              >
                <Heart className="w-4 h-4" />
                开始检查
              </button>
            </div>

            {healthIssues.filter(i => !i.dismissed).length > 0 && (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {healthIssues.filter(i => !i.dismissed).map(issue => {
                  const bookmark = mergedItems.find(b => b.id === issue.bookmarkId)
                  return (
                    <div key={issue.bookmarkId} className="p-3 bg-slate-800/50 rounded-lg">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{bookmark?.title || '未知'}</div>
                          <div className="text-xs text-slate-400 truncate">{bookmark?.url}</div>
                        </div>
                        <button
                          onClick={() => dismissHealthIssue(issue.bookmarkId)}
                          className="text-slate-400 hover:text-white"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="mt-2">
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          issue.issueType === 'outdated' ? 'bg-yellow-500/20 text-yellow-300' :
                          issue.issueType === 'broken_pattern' ? 'bg-red-500/20 text-red-300' :
                          'bg-slate-500/20 text-slate-300'
                        }`}>
                          {issue.issueType === 'outdated' ? '可能过时' :
                           issue.issueType === 'broken_pattern' ? '链接异常' :
                           issue.issueType === 'low_value' ? '低价值' : '冗余'}
                        </span>
                      </div>
                      <div className="text-sm text-slate-400 mt-2">{issue.description}</div>
                      <div className="text-sm text-emerald-400 mt-1">💡 {issue.suggestion}</div>
                    </div>
                  )
                })}
              </div>
            )}

            {healthIssues.filter(i => !i.dismissed).length === 0 && !isProcessing && (
              <div className="text-center py-8 text-slate-400">
                <Heart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>点击"开始检查"让 AI 分析书签健康状况</p>
              </div>
            )}
          </div>
        )}


        {/* Search Tab */}
        {activeTab === 'search' && (
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">自然语言搜索</h3>
              <p className="text-sm text-slate-400">用自然语言描述你想找的书签</p>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                className="flex-1 px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 focus:border-sky-500 focus:outline-none"
                placeholder="例如：找出所有关于 React 的文章"
              />
              <button
                onClick={handleSearch}
                disabled={!isConfigured || isProcessing || !searchQuery.trim()}
                className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2 text-sm font-medium"
              >
                <Search className="w-4 h-4" />
                搜索
              </button>
            </div>

            {lastSearchResult && (
              <div className="space-y-3">
                <div className="text-sm text-slate-400">
                  理解: {lastSearchResult.interpretation}
                </div>

                {lastSearchResult.matchedIds.length > 0 ? (
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {lastSearchResult.matchedIds.map(id => {
                      const bookmark = mergedItems.find(b => b.id === id)
                      if (!bookmark) return null
                      return (
                        <a
                          key={id}
                          href={bookmark.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block p-3 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition"
                        >
                          <div className="font-medium truncate">{bookmark.title}</div>
                          <div className="text-xs text-slate-400 truncate">{bookmark.url}</div>
                        </a>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-4 text-slate-400">
                    <p>未找到匹配的书签</p>
                    {lastSearchResult.suggestions && (
                      <p className="text-sm mt-2">
                        建议: {lastSearchResult.suggestions.join(', ')}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {!lastSearchResult && !isProcessing && (
              <div className="text-center py-8 text-slate-400">
                <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>输入自然语言查询，AI 会帮你找到相关书签</p>
              </div>
            )}
          </div>
        )}

        {/* Report Tab */}
        {activeTab === 'report' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">集合分析报告</h3>
                <p className="text-sm text-slate-400">AI 生成书签集合的洞察报告</p>
              </div>
              <div className="flex gap-2">
                {latestReport && (
                  <>
                    <button
                      onClick={() => {
                        const md = aiService.exportReportToMarkdown(latestReport)
                        const blob = new Blob([md], { type: 'text/markdown' })
                        const url = URL.createObjectURL(blob)
                        const a = document.createElement('a')
                        a.href = url
                        a.download = `bookmark-report-${new Date().toISOString().split('T')[0]}.md`
                        a.click()
                      }}
                      className="px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition flex items-center gap-2 text-sm"
                    >
                      <Download className="w-4 h-4" />
                      导出 MD
                    </button>
                  </>
                )}
                <button
                  onClick={handleGenerateReport}
                  disabled={!isConfigured || isProcessing || mergedItems.length === 0}
                  className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2 text-sm font-medium"
                >
                  <BarChart3 className="w-4 h-4" />
                  生成报告
                </button>
              </div>
            </div>

            {latestReport && (
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="p-4 bg-slate-800/50 rounded-lg">
                    <div className="text-2xl font-bold">{latestReport.totalBookmarks}</div>
                    <div className="text-sm text-slate-400">书签总数</div>
                  </div>
                  <div className="p-4 bg-slate-800/50 rounded-lg">
                    <div className="text-2xl font-bold">{latestReport.domainPatterns.length}</div>
                    <div className="text-sm text-slate-400">不同域名</div>
                  </div>
                  <div className="p-4 bg-slate-800/50 rounded-lg">
                    <div className="text-2xl font-bold">{Object.keys(latestReport.categoryDistribution).length}</div>
                    <div className="text-sm text-slate-400">分类数量</div>
                  </div>
                </div>

                <div className="p-4 bg-slate-800/50 rounded-lg">
                  <h4 className="font-medium mb-2">洞察</h4>
                  <ul className="space-y-1 text-sm text-slate-300">
                    {latestReport.insights.map((insight, i) => (
                      <li key={i}>• {insight}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-4 bg-slate-800/50 rounded-lg">
                  <h4 className="font-medium mb-2">建议</h4>
                  <ul className="space-y-1 text-sm text-emerald-300">
                    {latestReport.recommendations.map((rec, i) => (
                      <li key={i}>💡 {rec}</li>
                    ))}
                  </ul>
                </div>

                <div className="text-xs text-slate-500">
                  生成时间: {new Date(latestReport.generatedAt).toLocaleString()}
                </div>
              </div>
            )}

            {!latestReport && !isProcessing && (
              <div className="text-center py-8 text-slate-400">
                <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>点击"生成报告"获取 AI 分析洞察</p>
              </div>
            )}
          </div>
        )}

        {/* Usage Tab */}
        {activeTab === 'usage' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">API 用量统计</h3>
                <p className="text-sm text-slate-400">监控 Token 使用量和成本</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={refreshUsageStats}
                  className="px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition flex items-center gap-2 text-sm"
                >
                  <RefreshCw className="w-4 h-4" />
                  刷新
                </button>
                <button
                  onClick={clearCache}
                  className="px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition flex items-center gap-2 text-sm"
                >
                  <Trash2 className="w-4 h-4" />
                  清除缓存
                </button>
              </div>
            </div>

            {usageStats && (
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="p-4 bg-slate-800/50 rounded-lg">
                    <div className="text-2xl font-bold">{usageStats.totalTokens.toLocaleString()}</div>
                    <div className="text-sm text-slate-400">总 Token 数</div>
                  </div>
                  <div className="p-4 bg-slate-800/50 rounded-lg">
                    <div className="text-2xl font-bold">${usageStats.totalCost.toFixed(4)}</div>
                    <div className="text-sm text-slate-400">估算成本</div>
                  </div>
                </div>

                {Object.keys(usageStats.operationBreakdown).length > 0 && (
                  <div className="p-4 bg-slate-800/50 rounded-lg">
                    <h4 className="font-medium mb-2">按操作分类</h4>
                    <div className="space-y-2">
                      {Object.entries(usageStats.operationBreakdown).map(([op, data]) => (
                        <div key={op} className="flex justify-between text-sm">
                          <span className="text-slate-400">{op}</span>
                          <span>{data.tokens.toLocaleString()} tokens (${data.cost.toFixed(4)})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {!usageStats && (
              <div className="text-center py-8 text-slate-400">
                <Zap className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>暂无使用记录</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
