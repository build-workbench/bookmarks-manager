import '@testing-library/jest-dom'
import 'fake-indexeddb/auto'
import Dexie from 'dexie'
import { beforeEach } from 'vitest'
import { db } from '@/utils/db'

beforeEach(async () => {
  db.close()
  await Dexie.delete(db.name)
  await db.open()
})
