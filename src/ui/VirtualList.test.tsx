import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { VirtualList } from './VirtualList'

describe('VirtualList', () => {
  const items = Array.from({ length: 100 }, (_, i) => ({
    id: `item-${i}`,
    name: `Item ${i}`,
  }))

  const renderItem = (item: { id: string; name: string }) => (
    <div data-testid={item.id}>{item.name}</div>
  )

  it('renders visible items only', () => {
    render(
      <VirtualList
        items={items}
        renderItem={renderItem}
        itemHeight={50}
        containerHeight={200}
      />
    )

    // With containerHeight=200 and itemHeight=50, we should see ~4-5 items (plus overscan)
    const renderedItems = screen.getAllByRole('listitem')
    expect(renderedItems.length).toBeLessThan(items.length)
    expect(renderedItems.length).toBeGreaterThan(0)
  })

  it('has correct accessibility attributes', () => {
    render(
      <VirtualList
        items={items}
        renderItem={renderItem}
        itemHeight={50}
        containerHeight={200}
        aria-label="书签列表"
      />
    )

    const list = screen.getByRole('list', { name: '书签列表' })
    expect(list).toBeInTheDocument()
    expect(list).toHaveAttribute('aria-rowcount', '100')
    expect(list).toHaveAttribute('tabIndex', '0')
  })

  it('uses custom aria-label', () => {
    render(
      <VirtualList
        items={items}
        renderItem={renderItem}
        itemHeight={50}
        containerHeight={200}
        aria-label="自定义列表"
      />
    )

    expect(screen.getByRole('list', { name: '自定义列表' })).toBeInTheDocument()
  })

  it('shows empty state when no items', () => {
    render(
      <VirtualList
        items={[]}
        renderItem={renderItem}
        itemHeight={50}
        containerHeight={200}
      />
    )

    // The empty state is a status element with text "暂无数据"
    const statusElements = screen.getAllByRole('status')
    expect(statusElements.length).toBeGreaterThan(0)
    expect(statusElements[0]).toHaveTextContent('暂无数据')
  })

  it('renders items with correct aria-posinset', () => {
    render(
      <VirtualList
        items={items.slice(0, 10)}
        renderItem={renderItem}
        itemHeight={50}
        containerHeight={500}
      />
    )

    const listItems = screen.getAllByRole('listitem')
    listItems.forEach((item, index) => {
      expect(item).toHaveAttribute('aria-setsize', '10')
      expect(item).toHaveAttribute('aria-posinset', String(index + 1))
    })
  })

  it('handles scroll events', () => {
    render(
      <VirtualList
        items={items}
        renderItem={renderItem}
        itemHeight={50}
        containerHeight={200}
      />
    )

    const listElement = screen.getByRole('list')

    // Simulate scroll
    fireEvent.scroll(listElement, { target: { scrollTop: 500 } })

    // The component should still render items after scroll
    expect(screen.getAllByRole('listitem').length).toBeGreaterThan(0)
  })

  it('applies custom className', () => {
    render(
      <VirtualList
        items={items}
        renderItem={renderItem}
        itemHeight={50}
        containerHeight={200}
        className="custom-class"
      />
    )

    const list = screen.getByRole('list')
    expect(list).toHaveClass('custom-class')
  })

  it('supports custom role', () => {
    render(
      <VirtualList
        items={items}
        renderItem={renderItem}
        itemHeight={50}
        containerHeight={200}
        role="grid"
        aria-label="网格"
      />
    )

    expect(screen.getByRole('grid', { name: '网格' })).toBeInTheDocument()
  })
})
