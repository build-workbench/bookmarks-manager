import { useEffect, useState } from 'react'
import { Key, Save, Play, Sparkles, AlertCircle } from 'lucide-react'
import { getSetting, setSetting } from '../utils/db'
import useBookmarksStore from '../store/useBookmarksStore'

export default function AI() {
  const { mergedItems } = useBookmarksStore()
  const [apiKey, setApiKey] = useState('')
  const [prompt, setPrompt] = useState('')
  const [output, setOutput] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    async function loadKey() {
      const key = await getSetting('ai_key')
      if (key) setApiKey(key)
    }
    loadKey()
  }, [])

  async function save() {
    await setSetting('ai_key', apiKey)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function run() {
    if (!apiKey.trim()) {
      setOutput('❌ 请先设置 API Key')
      return
    }
    if (mergedItems.length === 0) {
      setOutput('❌ 请先在"上传合并"页面导入书签')
      return
    }
    
    const domains = new Set(mergedItems.map(item => {
      try {
        return new URL(item.url).hostname
      } catch {
        return ''
      }
    }).filter(Boolean))

    const folders = new Set(mergedItems.flatMap(item => item.path).filter(Boolean))

    setOutput(`📊 书签统计报告

总书签数: ${mergedItems.length}
不同域名: ${domains.size}
文件夹数: ${folders.size}

前10个域名:
${Array.from(domains).slice(0, 10).map((d, i) => `${i + 1}. ${d}`).join('\n')}

主要文件夹:
${Array.from(folders).slice(0, 10).map((f, i) => `${i + 1}. ${f}`).join('\n')}

💡 未来功能:
- 接入 BYOK LLM API 进行智能分析
- 主题聚类与分类建议
- 自然语言查询
- 阅读清单生成
- 过期链接检测建议

⚠️ 当前为演示模式，实际 AI 分析功能正在开发中...`)
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="rounded-lg border border-slate-800 p-6 bg-gradient-to-br from-purple-500/5 to-pink-500/5">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-6 h-6 text-purple-400" />
          <h2 className="text-xl font-semibold">AI 智能分析 (BYOK)</h2>
        </div>
        <p className="text-sm text-slate-400">
          使用你自己的 API Key 来分析书签集合，生成主题摘要、整理建议和智能洞察。所有分析在本地完成，保护你的隐私。
        </p>
      </div>

      <div className="rounded-lg border border-slate-800 p-6 bg-slate-900/50 space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Key className="w-4 h-4 text-sky-400" />
            <span>API Key 配置</span>
          </div>
          <input 
            type="password"
            value={apiKey} 
            onChange={e=>setApiKey(e.target.value)} 
            className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 focus:border-sky-500 focus:outline-none" 
            placeholder="在此粘贴你的模型 API Key (OpenAI, Claude, etc.)" 
          />
          <div className="flex items-center gap-2">
            <button 
              onClick={save} 
              className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 transition flex items-center gap-2 text-sm font-medium"
            >
              <Save className="w-4 h-4" />
              {saved ? '已保存' : '保存'}
            </button>
            {saved && <span className="text-xs text-green-400">✓ 已保存到本地数据库</span>}
          </div>
          <div className="flex items-start gap-2 text-xs text-slate-400 bg-slate-800/50 p-3 rounded">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium mb-1">隐私说明</p>
              <p>API Key 仅存储在你的浏览器 IndexedDB 中，不会上传到任何服务器。你可以使用 OpenAI、Claude、Gemini 或任何兼容的 LLM API。</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-slate-800 p-6 bg-slate-900/50 space-y-4">
        <div className="space-y-2">
          <div className="text-sm font-medium">自定义分析问题</div>
          <textarea 
            value={prompt} 
            onChange={e=>setPrompt(e.target.value)} 
            className="w-full h-32 px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 focus:border-sky-500 focus:outline-none resize-none" 
            placeholder="例如：请总结我的收藏主题并给出重组建议&#10;或：找出所有技术文档类的书签&#10;或：推荐我接下来应该阅读哪些内容"
          />
        </div>

        <button 
          onClick={run} 
          className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 transition flex items-center gap-2 font-medium"
        >
          <Play className="w-4 h-4" />
          运行分析
        </button>
      </div>

      {output && (
        <div className="rounded-lg border border-slate-800 p-6 bg-slate-900/50">
          <div className="text-sm font-medium mb-3">分析结果</div>
          <div className="rounded bg-slate-950 p-4 min-h-[200px] whitespace-pre-wrap text-sm font-mono text-slate-300">
            {output}
          </div>
        </div>
      )}
    </div>
  )
}
