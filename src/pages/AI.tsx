import { Settings } from 'lucide-react'
import { AISettings } from '@/ui/AISettings'

export default function AI() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <section className="rounded-lg border border-slate-800 bg-slate-900/50 p-6">
        <div className="mb-4 flex items-center gap-2">
          <Settings className="h-6 w-6 text-sky-400" />
          <h1 className="text-xl font-semibold text-white">AI 可选配置</h1>
        </div>
        <p className="text-sm text-slate-400">
          Bookmarks Manager 的核心工作流不依赖 AI。这里仅保留本地 BYOK
          配置与连接测试，所有密钥和设置都只存储在当前浏览器中。
        </p>
      </section>

      <AISettings />
    </div>
  )
}
