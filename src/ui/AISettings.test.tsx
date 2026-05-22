import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { AISettings } from './AISettings'
import { configService } from '@/ai/configService'

const validateApiKey = vi.fn()

vi.mock('@/ai/adapters', () => ({
  createAdapter: vi.fn(() => ({
    chat: vi.fn(),
    validateApiKey,
    estimateCost: vi.fn().mockReturnValue(0)
  }))
}))

vi.mock('@/ai/configService', () => ({
  configService: {
    getConfig: vi.fn(),
    saveConfig: vi.fn(),
    getModelsForProvider: vi.fn(() => ['gpt-4o-mini']),
    getDefaultModel: vi.fn(() => 'gpt-4o-mini')
  }
}))

describe('AISettings', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    validateApiKey.mockResolvedValue(true)
    vi.mocked(configService.getConfig).mockResolvedValue(null)
    vi.mocked(configService.saveConfig).mockResolvedValue({ success: true })
  })

  it('tests connection without persisting config first', async () => {
    const { container } = render(<AISettings />)
    const apiKeyInput = container.querySelector('input[type="password"], input[type="text"]')

    expect(apiKeyInput).not.toBeNull()
    fireEvent.change(apiKeyInput!, { target: { value: 'test-key-12345' } })
    fireEvent.click(screen.getByRole('button', { name: '测试连接' }))

    await waitFor(() => {
      expect(validateApiKey).toHaveBeenCalledOnce()
    })

    expect(configService.saveConfig).not.toHaveBeenCalled()
  })
})
