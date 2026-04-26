import { describe, expect, it } from 'vitest'
import { db } from './db'

describe('BookmarksDB active schema', () => {
  it('keeps only retained tables in the active schema', () => {
    expect(db.tables.map((table) => table.name).sort()).toEqual([
      'aiConfig',
      'bookmarks',
      'settings'
    ])
  })
})
