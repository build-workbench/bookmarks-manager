import { useEffect, useState } from 'react'

export default function AI() {
  const [apiKey, setApiKey] = useState('')
  const [prompt, setPrompt] = useState('')
  const [output, setOutput] = useState('')
  useEffect(() => {
    const v = localStorage.getItem('ai_key') || ''
    setApiKey(v)
  }, [])
  function save() {
    localStorage.setItem('ai_key', apiKey)
  }
  function run() {
    setOutput('此页面为占位，后续接入 BYOK 的 LLM 接口并生成分析报告')
  }
  return (
    <div className="space-y-4 max-w-2xl">
      <div className="space-y-2">
        <div className="text-sm">API Key</div>
        <input value={apiKey} onChange={e=>setApiKey(e.target.value)} className="w-full px-3 py-2 rounded bg-slate-900 border border-slate-800" placeholder="在此粘贴你的模型 API Key" />
        <div className="flex gap-2">
          <button onClick={save} className="px-4 py-2 rounded bg-sky-600 hover:bg-sky-700">保存</button>
          <button onClick={run} className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-700">运行示例</button>
        </div>
      </div>
      <div className="space-y-2">
        <div className="text-sm">自定义问题</div>
        <textarea value={prompt} onChange={e=>setPrompt(e.target.value)} className="w-full h-32 px-3 py-2 rounded bg-slate-900 border border-slate-800" placeholder="例如：请总结我的收藏主题并给出重组建议" />
      </div>
      <div className="rounded border border-slate-800 p-4 min-h-[120px] whitespace-pre-wrap">{output}</div>
    </div>
  )
}
