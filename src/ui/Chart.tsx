import { useEffect, useRef } from 'react'
import * as echarts from 'echarts'

type Props = { option: any, height?: number }

export default function Chart({ option, height = 320 }: Props) {
  const ref = useRef<HTMLDivElement | null>(null)
  const instRef = useRef<echarts.ECharts | null>(null)

  useEffect(() => {
    if (!ref.current) return
    const inst = echarts.getInstanceByDom(ref.current) ?? echarts.init(ref.current)
    instRef.current = inst

    const onResize = () => inst.resize()
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      instRef.current = null
      inst.dispose()
    }
  }, [])

  useEffect(() => {
    if (!instRef.current) return
    instRef.current.setOption(option, { notMerge: true, lazyUpdate: true })
  }, [option])

  useEffect(() => {
    if (!instRef.current) return
    requestAnimationFrame(() => instRef.current?.resize())
  }, [height])
  return <div ref={ref} style={{ width: '100%', height }} />
}
