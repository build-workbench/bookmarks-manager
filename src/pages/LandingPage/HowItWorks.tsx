import { Upload, Cpu, Download, ArrowRight, CheckCircle } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { t } from '@/locales'

export default function HowItWorks() {
  const steps = [
    {
      icon: Upload,
      number: '01',
      title: t('howItWorks.step1.title'),
      description: t('howItWorks.step1.description'),
      features: [
        t('howItWorks.step1.feature1'),
        t('howItWorks.step1.feature2'),
        t('howItWorks.step1.feature3')
      ],
      color: 'from-sky-500 to-blue-500'
    },
    {
      icon: Cpu,
      number: '02',
      title: t('howItWorks.step2.title'),
      description: t('howItWorks.step2.description'),
      features: [
        t('howItWorks.step2.feature1'),
        t('howItWorks.step2.feature2'),
        t('howItWorks.step2.feature3')
      ],
      color: 'from-violet-500 to-purple-500'
    },
    {
      icon: Download,
      number: '03',
      title: t('howItWorks.step3.title'),
      description: t('howItWorks.step3.description'),
      features: [
        t('howItWorks.step3.feature1'),
        t('howItWorks.step3.feature2'),
        t('howItWorks.step3.feature3')
      ],
      color: 'from-emerald-500 to-teal-500'
    }
  ]

  const [visibleSteps, setVisibleSteps] = useState<Set<number>>(new Set())
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = parseInt(entry.target.getAttribute('data-step') || '0')
          if (entry.isIntersecting) {
            setVisibleSteps((prev) => new Set([...prev, index]))
          }
        })
      },
      { threshold: 0.3 }
    )

    const stepElements = sectionRef.current?.querySelectorAll('[data-step]')
    stepElements?.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} className="relative py-24 lg:py-32 bg-background overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-sky-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16 lg:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-sm mb-6">
            <span>{t('howItWorks.badge')}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            {t('howItWorks.title')}
          </h2>
          <p className="text-lg text-muted max-w-2xl mx-auto">{t('howItWorks.subtitle')}</p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connection Line (Desktop) */}
          <div className="hidden lg:block absolute top-24 left-0 right-0 h-0.5">
            <div className="mx-auto max-w-4xl h-full bg-gradient-to-r from-sky-500/20 via-violet-500/20 to-emerald-500/20" />
          </div>

          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isVisible = visibleSteps.has(index)

              return (
                <div
                  key={step.number}
                  data-step={index}
                  className={`relative transition-all duration-700 ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                  }`}
                  style={{ transitionDelay: `${index * 200}ms` }}
                >
                  {/* Card */}
                  <div className="relative bg-card/60 backdrop-blur-sm border border-border rounded-2xl p-8 hover:border-sky-500/40 transition-all hover:shadow-xl hover:shadow-sky-500/5 group">
                    {/* Step Number Badge */}
                    <div
                      className={`absolute -top-4 left-8 px-4 py-1 rounded-full bg-gradient-to-r ${step.color} text-white text-sm font-bold shadow-lg`}
                    >
                      Step {step.number}
                    </div>

                    {/* Icon */}
                    <div
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                    >
                      <Icon className="w-8 h-8 text-white" />
                    </div>

                    {/* Content */}
                    <h3 className="text-2xl font-bold text-foreground mb-4">{step.title}</h3>
                    <p className="text-muted mb-6 leading-relaxed">{step.description}</p>

                    {/* Feature List */}
                    <div className="space-y-3">
                      {step.features.map((feature) => (
                        <div key={feature} className="flex items-center gap-3 text-sm">
                          <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                          <span className="text-muted">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Arrow (Desktop, not on last item) */}
                  {index < steps.length - 1 && (
                    <div className="hidden lg:flex absolute top-24 -right-6 z-10 w-12 h-12 items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-card-hover border border-border flex items-center justify-center">
                        <ArrowRight className="w-5 h-5 text-muted" />
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Bottom Note */}
        <div className="mt-16 text-center">
          <p className="text-muted">{t('howItWorks.bottomNote')}</p>
        </div>
      </div>
    </section>
  )
}
