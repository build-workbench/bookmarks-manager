import { GitMerge, Search, Brain, BarChart3, Shield, Zap, Lock } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

const features = [
  {
    icon: GitMerge,
    title: '智能合并',
    description:
      '支持 Chrome、Firefox、Edge、Safari 等多浏览器书签文件一键导入，自动识别并合并重复文件夹结构。',
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20'
  },
  {
    icon: Zap,
    title: '智能去重',
    description:
      'URL 规范化算法智能识别重复书签，自动处理 http/https、追踪参数、大小写等差异，保留最早添加的版本。',
    color: 'from-amber-500 to-orange-500',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20'
  },
  {
    icon: Search,
    title: '全文搜索',
    description:
      '基于 MiniSearch 的高性能搜索引擎，支持标题、URL、文件夹路径全文检索，模糊匹配，毫秒级响应。',
    color: 'from-emerald-500 to-teal-500',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20'
  },
  {
    icon: Brain,
    title: 'AI 可选配置',
    description:
      '按需接入 OpenAI、Claude 等模型，仅保留自备 Key 的本地配置与连接测试。默认不上传任何数据。',
    color: 'from-violet-500 to-purple-500',
    bgColor: 'bg-violet-500/10',
    borderColor: 'border-violet-500/20'
  },
  {
    icon: BarChart3,
    title: '可视化统计',
    description:
      'ECharts 驱动的本地统计视图，展示域名分布、时间趋势和重复占比，帮助你快速判断整理结果。',
    color: 'from-rose-500 to-pink-500',
    bgColor: 'bg-rose-500/10',
    borderColor: 'border-rose-500/20'
  },
  {
    icon: Shield,
    title: '隐私优先',
    description:
      '所有处理在浏览器本地完成，IndexedDB 存储，不上传任何数据。开源代码可审计，真正掌控你的数据。',
    color: 'from-sky-500 to-indigo-500',
    bgColor: 'bg-sky-500/10',
    borderColor: 'border-sky-500/20'
  }
]

export default function Features() {
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set())
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = parseInt(entry.target.getAttribute('data-index') || '0')
          if (entry.isIntersecting) {
            setVisibleItems((prev) => new Set([...prev, index]))
          }
        })
      },
      { threshold: 0.2, rootMargin: '0px 0px -50px 0px' }
    )

    const cards = sectionRef.current?.querySelectorAll('[data-index]')
    cards?.forEach((card) => observer.observe(card))

    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} className="relative py-24 lg:py-32 bg-slate-950">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900/50 via-slate-950 to-slate-950" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16 lg:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm mb-6">
            <Zap className="w-4 h-4" />
            <span>核心功能</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            一站式书签清理与管理
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            从导入、去重到搜索、备份与导出，覆盖完整的本地书签整理流程
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            const isVisible = visibleItems.has(index)

            return (
              <div
                key={feature.title}
                data-index={index}
                className={`group relative p-6 lg:p-8 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-all duration-500 hover:shadow-2xl hover:shadow-slate-900/50 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                {/* Gradient Border Effect */}
                <div
                  className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
                />

                {/* Icon */}
                <div
                  className={`w-14 h-14 rounded-xl ${feature.bgColor} border ${feature.borderColor} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                >
                  <Icon
                    className={`w-7 h-7 bg-gradient-to-br ${feature.color} bg-clip-text`}
                    style={{ color: 'inherit' }}
                  />
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-sky-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-slate-400 leading-relaxed text-sm">{feature.description}</p>

                {/* Hover Arrow */}
                <div className="mt-6 flex items-center text-sm text-slate-500 group-hover:text-sky-400 transition-colors">
                  <span>了解更多</span>
                  <svg
                    className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            )
          })}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-slate-900/50 border border-slate-800">
            <Lock className="w-5 h-5 text-emerald-400" />
            <span className="text-slate-300">所有数据在本地处理，</span>
            <span className="text-emerald-400 font-medium">永不上传到服务器</span>
          </div>
        </div>
      </div>
    </section>
  )
}
