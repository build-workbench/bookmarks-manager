import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, useLocation } from 'react-router-dom'
import App from '@/App'

const loadFromDB = vi.hoisted(() => vi.fn().mockResolvedValue(undefined))
const useBookmarksStoreMock = vi.hoisted(() =>
  vi.fn(() => ({
    needsMerge: false,
    loadFromDB
  }))
)

vi.mock('@/store/useBookmarksStore', () => ({
  default: useBookmarksStoreMock
}))

vi.mock('@/pages/LandingPage', () => ({
  default: () => <div>Landing Page</div>
}))

vi.mock('@/pages/UploadMerge', () => ({
  default: () => <div>Upload Page</div>
}))

vi.mock('@/pages/Dashboard', () => ({
  default: () => <div>Dashboard Page</div>
}))

vi.mock('@/pages/Search', () => ({
  default: () => <div>Search Page</div>
}))

vi.mock('@/pages/Duplicates', () => ({
  default: () => <div>Duplicates Page</div>
}))

vi.mock('@/pages/AI', () => ({
  default: () => <div>AI Page</div>
}))

vi.mock('@/pages/Cleanup', () => ({
  default: () => <div>Cleanup Page</div>
}))

vi.mock('@/pages/Backup', () => ({
  default: () => <div>Backup Page</div>
}))

function LocationDisplay() {
  const location = useLocation()
  return <div data-testid="location-display">{location.pathname}</div>
}

describe('App routing after closure hardening', () => {
  it('does not expose cleanup in the main navigation', async () => {
    render(
      <MemoryRouter
        initialEntries={['/app/upload']}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <App />
      </MemoryRouter>
    )

    expect(screen.getByRole('link', { name: '上传合并' })).toBeInTheDocument()

    expect(screen.queryByRole('link', { name: '整理' })).not.toBeInTheDocument()
  })

  it('redirects the retired cleanup route back to upload', async () => {
    render(
      <MemoryRouter
        initialEntries={['/app/cleanup']}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <App />
        <LocationDisplay />
      </MemoryRouter>
    )

    expect(await screen.findByTestId('location-display')).toHaveTextContent('/app/upload')
  })
})
