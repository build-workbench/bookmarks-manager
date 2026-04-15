/**
 * Virtual List Component
 * Efficiently renders large lists by only rendering visible items
 */

import { useRef, useState, useEffect, useCallback, useMemo } from 'react'

interface VirtualListProps<T> {
  items: T[]
  renderItem: (item: T, index: number) => React.ReactNode
  itemHeight: number
  containerHeight?: number
  overscan?: number
  className?: string
  /** Accessible label for the list */
  'aria-label'?: string
  /** Role for the list container */
  role?: string
}

export function VirtualList<T>({
  items,
  renderItem,
  itemHeight,
  containerHeight = 400,
  overscan = 5,
  className = '',
  'aria-label': ariaLabel = '列表',
  role = 'list'
}: VirtualListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scrollTop, setScrollTop] = useState(0)

  // Calculate visible range
  const { virtualItems, totalHeight } = useMemo(() => {
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
    const visibleCount = Math.ceil(containerHeight / itemHeight)
    const end = Math.min(items.length, start + visibleCount + overscan * 2)

    const virtualItems = []
    for (let i = start; i < end; i++) {
      virtualItems.push({
        item: items[i],
        index: i,
        style: {
          position: 'absolute' as const,
          top: i * itemHeight,
          left: 0,
          right: 0,
          height: itemHeight
        }
      })
    }

    return {
      virtualItems,
      totalHeight: items.length * itemHeight
    }
  }, [items, scrollTop, itemHeight, containerHeight, overscan])

  // Handle scroll
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }, [])

  // Use native scroll event for better performance
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let rafId: number | null = null
    let currentScrollTop = 0

    const updateScrollTop = () => {
      if (scrollTop !== currentScrollTop) {
        setScrollTop(currentScrollTop)
      }
      rafId = null
    }

    const onScroll = () => {
      currentScrollTop = container.scrollTop
      if (rafId === null) {
        rafId = requestAnimationFrame(updateScrollTop)
      }
    }

    container.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      container.removeEventListener('scroll', onScroll)
      if (rafId !== null) {
        cancelAnimationFrame(rafId)
      }
    }
  }, [scrollTop])

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        height: containerHeight,
        overflow: 'auto',
        position: 'relative'
      }}
      onScroll={handleScroll}
      role={role}
      aria-label={ariaLabel}
      aria-rowcount={items.length}
      tabIndex={0}
    >
      <div style={{ height: totalHeight, position: 'relative' }} role="presentation">
        {virtualItems.map(({ item, index, style }) => (
          <div key={index} style={style} role="listitem" aria-setsize={items.length} aria-posinset={index + 1}>
            {renderItem(item, index)}
          </div>
        ))}
      </div>
      {items.length === 0 && (
        <div className="flex items-center justify-center h-full text-slate-500" role="status">
          暂无数据
        </div>
      )}
    </div>
  )
}

// Hook for using virtual list with window scrolling
export function useVirtualList<T>(items: T[], itemHeight: number, overscan = 5) {
  const [scrollTop, setScrollTop] = useState(0)

  const virtualItems = useMemo(() => {
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
    const visibleCount = Math.ceil(window.innerHeight / itemHeight)
    const end = Math.min(items.length, start + visibleCount + overscan * 2)

    const result = []
    for (let i = start; i < end; i++) {
      result.push({
        item: items[i],
        index: i
      })
    }
    return result
  }, [items, scrollTop, itemHeight, overscan])

  useEffect(() => {
    let rafId: number | null = null
    let currentScrollTop = 0

    const updateScrollTop = () => {
      setScrollTop(currentScrollTop)
      rafId = null
    }

    const onScroll = () => {
      currentScrollTop = window.scrollY
      if (rafId === null) {
        rafId = requestAnimationFrame(updateScrollTop)
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (rafId !== null) {
        cancelAnimationFrame(rafId)
      }
    }
  }, [])

  return { virtualItems, totalHeight: items.length * itemHeight }
}

export default VirtualList
