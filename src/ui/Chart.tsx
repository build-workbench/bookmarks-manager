import { useEffect, useRef } from 'react'
import * as echarts from 'echarts'

type Props = { option: any, height?: number }

export default function Chart({ option, height = 320 }: Props) {
  const ref = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    if (!ref.current) return
    const inst = echarts.init(ref.current)
    inst.setOption(option)
    const onResize = () => inst.resize()
    window.addEventListener('resize', onResize)
    return () => { window.removeEventListener('resize', onResize); inst.dispose() }
  }, [option])
  return <div ref={ref} style={{ width: '100%', height }} />
}
