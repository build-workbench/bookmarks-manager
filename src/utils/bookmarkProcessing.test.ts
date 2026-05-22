import { describe, expect, it } from 'vitest'
import type { Bookmark } from './bookmarkParser'
import { processBookmarks } from './bookmarkProcessing'

const bookmark = (overrides: Partial<Bookmark> = {}): Bookmark => ({
  id: crypto.randomUUID(),
  title: 'Example',
  url: 'https://example.com',
  path: ['Root'],
  sourceFile: 'bookmarks.html',
  ...overrides
})

describe('processBookmarks', () => {
  it('counts removed duplicate items instead of duplicate groups', () => {
    const result = processBookmarks([
      bookmark({ id: 'kept', url: 'https://example.com?a=1&utm_source=newsletter', addDate: 1 }),
      bookmark({ id: 'dup-1', url: 'https://example.com?utm_medium=email&a=1', addDate: 2 }),
      bookmark({ id: 'dup-2', url: 'https://example.com?a=1&utm_campaign=spring', addDate: 3 }),
      bookmark({ id: 'other', url: 'https://other.example.com', addDate: 4 })
    ])

    expect(result.merged.map((item) => item.id)).toEqual(['kept', 'other'])
    expect(result.stats.total).toBe(2)
    expect(result.stats.duplicates).toBe(2)
    expect(result.duplicates['https://example.com/?a=1'].map((item) => item.id)).toEqual([
      'kept',
      'dup-1',
      'dup-2'
    ])
  })

  it('keeps earliest bookmark when duplicates collapse', () => {
    const result = processBookmarks([
      bookmark({ id: 'late', url: 'https://example.com/docs', addDate: 30 }),
      bookmark({ id: 'earliest', url: 'https://example.com/docs', addDate: 10 }),
      bookmark({ id: 'middle', url: 'https://example.com/docs', addDate: 20 })
    ])

    expect(result.merged).toHaveLength(1)
    expect(result.merged[0]?.id).toBe('earliest')
    expect(result.duplicates['https://example.com/docs'].map((item) => item.id)).toEqual([
      'earliest',
      'late',
      'middle'
    ])
  })
})
