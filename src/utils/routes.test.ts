import { describe, expect, it } from 'vitest'
import { normalizeLegacyHashRoute } from './routes'

describe('normalizeLegacyHashRoute', () => {
  it('rewrites legacy workspace hashes into app hashes', () => {
    expect(normalizeLegacyHashRoute('#/search')).toBe('#/app/search')
    expect(normalizeLegacyHashRoute('#/duplicates')).toBe('#/app/duplicates')
  })

  it('ignores root and already-normalized app hashes', () => {
    expect(normalizeLegacyHashRoute('#/')).toBeNull()
    expect(normalizeLegacyHashRoute('#/app/search')).toBeNull()
    expect(normalizeLegacyHashRoute('')).toBeNull()
    expect(normalizeLegacyHashRoute('#')).toBeNull()
    expect(normalizeLegacyHashRoute('#features')).toBeNull()
    expect(normalizeLegacyHashRoute('#faq')).toBeNull()
  })
})
