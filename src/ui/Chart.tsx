import { useEffect, useRef, useState } from 'react'
import type { EChartsOption } from 'echarts'
import type { EChartsType } from 'echarts/core'

interface ChartProps {
  option: EChartsOption
  height?: number
  /** Accessible label describing the chart */
  'aria-label'?: string
  /** Chart description for screen readers */
  description?: string
}

// Cached promise prevents multiple concurrent imports across Chart instances
let echartsInitPromise: Promise<{
  init: (dom: HTMLElement) => EChartsType
  getInstanceByDom: (dom: HTMLElement) => EChartsType | undefined
}> | null = null

function getEChartsInit() {
  if (echartsInitPromise) {
    return echartsInitPromise
  }

  echartsInitPromise = (async () => {
    const echarts = await import('echarts/core')

    // Parallel imports for faster loading
    const [charts, components, renderers] = await Promise.all([
      import('echarts/charts'),
      import('echarts/components'),
      import('echarts/renderers'),
    ])

    const { PieChart, BarChart, LineChart } = charts
    const { TitleComponent, TooltipComponent, GridComponent, LegendComponent } = components
    const { CanvasRenderer } = renderers

    echarts.use([
      PieChart,
      BarChart,
      LineChart,
      TitleComponent,
      TooltipComponent,
      GridComponent,
      LegendComponent,
      CanvasRenderer,
    ])

    return {
      init: echarts.init,
      getInstanceByDom: echarts.getInstanceByDom,
    }
  })()

  return echartsInitPromise
}

export default function Chart({ option, height = 320, 'aria-label': ariaLabel = '图表', description }: ChartProps) {
  const ref = useRef<HTMLDivElement | null>(null)
  const instRef = useRef<EChartsType | null>(null)
  const optionRef = useRef(option)
  optionRef.current = option
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let active = true
    let onResize: (() => void) | null = null
    let resizeObserver: ResizeObserver | null = null

    void (async () => {
      try {
        if (!ref.current) return

        const { init, getInstanceByDom } = await getEChartsInit()

        if (!active || !ref.current) return

        const inst = getInstanceByDom(ref.current) ?? init(ref.current)
        instRef.current = inst
        inst.setOption(optionRef.current, { notMerge: true, lazyUpdate: true })
        requestAnimationFrame(() => inst.resize())

        if (active) setIsLoading(false)

        onResize = () => inst.resize()
        window.addEventListener('resize', onResize)

        if (typeof ResizeObserver !== 'undefined') {
          resizeObserver = new ResizeObserver(() => {
            inst.resize()
          })
          resizeObserver.observe(ref.current)
        }
      } catch (error) {
        console.error('Failed to initialize chart:', error)
        if (active) setIsLoading(false)
      }
    })()

    return () => {
      active = false
      if (onResize) window.removeEventListener('resize', onResize)
      resizeObserver?.disconnect()
      instRef.current?.dispose()
      instRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!instRef.current) return
    instRef.current.setOption(optionRef.current, { notMerge: true, lazyUpdate: true })
  }, [option])

  useEffect(() => {
    if (!instRef.current) return
    requestAnimationFrame(() => instRef.current?.resize())
  }, [height])

  return (
    <div style={{ width: '100%', height, position: 'relative' }}>
      {isLoading && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(15, 23, 42, 0.5)'
          }}
          role="status"
          aria-label="图表加载中"
        >
          <div className="w-8 h-8 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      {/* Screen reader description */}
      {description && (
        <div className="sr-only" id={`${ref.current?.id || 'chart'}-desc`}>
          {description}
        </div>
      )}
      <div
        ref={ref}
        style={{ width: '100%', height }}
        role="img"
        aria-label={ariaLabel}
        aria-describedby={description ? `${ref.current?.id || 'chart'}-desc` : undefined}
        tabIndex={0}
      />
    </div>
  )
}
