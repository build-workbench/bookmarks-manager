import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SafeExternalLink } from './SafeExternalLink'

describe('SafeExternalLink', () => {
  it('renders safe http links as anchors', () => {
    render(
      <SafeExternalLink href="https://example.com/docs" ariaLabel="Safe bookmark">
        Safe bookmark
      </SafeExternalLink>
    )

    expect(screen.getByRole('link', { name: 'Safe bookmark' })).toHaveAttribute(
      'href',
      'https://example.com/docs'
    )
  })

  it('renders unsafe bookmark URLs as plain text instead of clickable anchors', () => {
    render(
      <SafeExternalLink href="javascript:alert(1)" ariaLabel="Unsafe bookmark">
        Unsafe bookmark
      </SafeExternalLink>
    )

    expect(screen.queryByRole('link', { name: 'Unsafe bookmark' })).not.toBeInTheDocument()
    expect(screen.getByText('Unsafe bookmark')).toBeInTheDocument()
  })
})
