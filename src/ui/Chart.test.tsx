import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import Chart from './Chart'
import type { EChartsOption } from 'echarts'

// Mock echarts/core with named exports
vi.mock('echarts/core', () => {
  const mockInstance = {
    setOption: vi.fn(),
    resize: vi.fn(),
    dispose: vi.fn(),
  }
  return {
    default: {
      init: vi.fn(() => mockInstance),
      getInstanceByDom: vi.fn(() => null),
      use: vi.fn(),
    },
    // Named exports used by Chart.tsx
    init: vi.fn(() => mockInstance),
    use: vi.fn(),
    ECharts: vi.fn(),
  }
})

vi.mock('echarts/charts', () => ({
  PieChart: class PieChart {},
  BarChart: class BarChart {},
  LineChart: class LineChart {},
}))

vi.mock('echarts/components', () => ({
  TitleComponent: class TitleComponent {},
  TooltipComponent: class TooltipComponent {},
  GridComponent: class GridComponent {},
  LegendComponent: class LegendComponent {},
}))

vi.mock('echarts/renderers', () => ({
  CanvasRenderer: class CanvasRenderer {},
}))

describe('Chart', () => {
  const mockOption: EChartsOption = {
    xAxis: { type: 'category' as const, data: ['A', 'B'] },
    yAxis: { type: 'value' as const },
    series: [{ type: 'bar' as const, data: [10, 20] }],
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders with correct aria-label', async () => {
    render(<Chart option={mockOption} aria-label="测试图表" />)

    await waitFor(() => {
      const chart = screen.getByRole('img', { name: '测试图表' })
      expect(chart).toBeInTheDocument()
    })
  })

  it('applies custom height', async () => {
    render(<Chart option={mockOption} height={500} />)

    await waitFor(() => {
      const chart = screen.getByRole('img')
      expect(chart).toHaveStyle({ height: '500px' })
    })
  })

  it('shows loading state initially', () => {
    render(<Chart option={mockOption} />)

    // The loading spinner should be present
    const loadingStatus = screen.getByRole('status', { name: '图表加载中' })
    expect(loadingStatus).toBeInTheDocument()
  })

  it('is focusable for keyboard navigation', async () => {
    render(<Chart option={mockOption} />)

    await waitFor(() => {
      const chart = screen.getByRole('img')
      expect(chart).toHaveAttribute('tabIndex', '0')
    })
  })

  it('has default aria-label when not specified', async () => {
    render(<Chart option={mockOption} />)

    await waitFor(() => {
      const chart = screen.getByRole('img', { name: '图表' })
      expect(chart).toBeInTheDocument()
    })
  })
})
