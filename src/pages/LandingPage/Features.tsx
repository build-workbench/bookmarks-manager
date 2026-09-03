import { GitMerge, Search, Brain, BarChart3, Shield, Zap, Lock } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { t } from '@/locales'

const features = [
  {
    icon: GitMerge,
    titleKey: 'features.smartMerge.title',
    descKey: 'features.smartMerge.desc',
    color: 'from-blue-500 to-cyan-500',
    tone: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20'
  },
  {
    icon: Zap,
    titleKey: 'features.smartDedup.title',
    descKey: 'features.smartDedup.desc',
    color: 'from-amber-500 to-orange-500',
    tone: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20'
  },
  {
    icon: Search,
    titleKey: 'features.search.title',
    descKey: 'features.search.desc',
    color: 'from-emerald-500 to-teal-500',
    tone: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20'
  },
  {
    icon: Brain,
    titleKey: 'features.ai.title',
    descKey: 'features.ai.desc',
    color: 'from-violet-500 to-purple-500',
    tone: 'text-violet-400',
    bgColor: 'bg-violet-500/10',
    borderColor: 'border-violet-500/20'
  },
  {
    icon: BarChart3,
    titleKey: 'features.stats.title',
    descKey: 'features.stats.desc',
    color: 'from-rose-500 to-pink-500',
    tone: 'text-rose-400',
    bgColor: 'bg-rose-500/10',
    borderColor: 'border-rose-500/20'
  },
  {
    icon: Shield,
    titleKey: 'features.privacy.title',
    descKey: 'features.privacy.desc',
    color: 'from-sky-500 to-indigo-500',
    tone: 'text-sky-400',
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
    <section ref={sectionRef} className="relative py-24 lg:py-32 bg-background">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-sky-500/5 via-transparent to-transparent dark:from-slate-900/50 dark:via-slate-950 dark:to-slate-950" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16 lg:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm mb-6">
            <Zap className="w-4 h-4" />
            <span>{t('features.badge')}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            {t('features.title')}
          </h2>
          <p className="text-lg text-muted max-w-2xl mx-auto">{t('features.subtitle')}</p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            const isVisible = visibleItems.has(index)

            return (
              <div
                key={feature.titleKey}
                data-index={index}
                className={`group relative p-6 lg:p-8 rounded-2xl bg-card/60 backdrop-blur-sm border border-border hover:border-sky-500/40 transition-all duration-500 hover:shadow-xl hover:shadow-sky-500/5 ${
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
                  <Icon className={`w-7 h-7 ${feature.tone}`} />
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-foreground mb-3 group-hover:text-sky-400 transition-colors">
                  {t(feature.titleKey)}
                </h3>
                <p className="text-muted leading-relaxed text-sm">{t(feature.descKey)}</p>

                {/* Hover Arrow */}
                <div className="mt-6 flex items-center text-sm text-muted group-hover:text-sky-400 transition-colors">
                  <span>{t('features.learnMore')}</span>
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
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-card/50 border border-border">
            <Lock className="w-5 h-5 text-emerald-400" />
            <span className="text-muted">{t('features.privacyNote')}</span>
            <span className="text-emerald-400 font-medium">{t('features.privacyHighlight')}</span>
          </div>
        </div>
      </div>
    </section>
  )
}
