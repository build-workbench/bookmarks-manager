import { useEffect, useRef } from 'react'
import type * as ECharts from 'echarts'

type Props = { option: ECharts.EChartsOption, height?: number }

export default function Chart({ option, height = 320 }: Props) {
  const ref = useRef<HTMLDivElement | null>(null)
  const instRef = useRef<ECharts.ECharts | null>(null)
  const optionRef = useRef(option)
  optionRef.current = option

  useEffect(() => {
    let active = true
    let onResize: (() => void) | null = null
    let resizeObserver: ResizeObserver | null = null

    void (async () => {
      if (!ref.current) return
      const echarts = await import('echarts')
      if (!active || !ref.current) return

      const inst = echarts.getInstanceByDom(ref.current) ?? echarts.init(ref.current)
      instRef.current = inst
      inst.setOption(optionRef.current, { notMerge: true, lazyUpdate: true })
      requestAnimationFrame(() => inst.resize())

      onResize = () => inst.resize()
      window.addEventListener('resize', onResize)

      if (typeof ResizeObserver !== 'undefined') {
        resizeObserver = new ResizeObserver(() => {
          inst.resize()
        })
        resizeObserver.observe(ref.current)
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

  return <div ref={ref} style={{ width: '100%', height }} />
}
