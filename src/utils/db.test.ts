import { describe, expect, it, vi } from 'vitest'
import { clearAIConfig, db, saveBookmarks, type StoredBookmark } from './db'

describe('BookmarksDB active schema', () => {
  it('keeps only retained tables in the active schema', () => {
    expect(db.tables.map((table) => table.name).sort()).toEqual([
      'aiConfig',
      'bookmarks',
      'settings'
    ])
  })

  it('rolls back bookmark replacement when the new snapshot fails to save', async () => {
    const existing: StoredBookmark = {
      id: 'existing',
      title: 'Existing',
      url: 'https://existing.example.com',
      normalized: 'https://existing.example.com',
      path: ['Root'],
      sourceFile: 'existing.html'
    }

    await db.bookmarks.add(existing)

    const bulkAddSpy = vi
      .spyOn(db.bookmarks, 'bulkAdd')
      .mockRejectedValueOnce(new Error('disk full'))

    await expect(
      saveBookmarks([
        {
          id: 'next',
          title: 'Next',
          url: 'https://next.example.com',
          normalized: 'https://next.example.com',
          path: ['Root'],
          sourceFile: 'next.html'
        }
      ])
    ).rejects.toThrow('disk full')

    expect(await db.bookmarks.toArray()).toEqual([existing])

    bulkAddSpy.mockRestore()
  })

  it('deletes ai config rows instead of keeping an empty sentinel record', async () => {
    await db.aiConfig.put({
      id: 'default',
      provider: 'openai',
      apiKey: 'secret',
      model: 'gpt-4o-mini',
      maxTokens: 1000,
      temperature: 0.2,
      updatedAt: Date.now()
    })

    await clearAIConfig()

    expect(await db.aiConfig.toArray()).toEqual([])
  })
})
