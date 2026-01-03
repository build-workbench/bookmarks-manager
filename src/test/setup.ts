import '@testing-library/jest-dom'
import 'fake-indexeddb/auto'
import { beforeEach } from 'vitest'

// Reset IndexedDB before each test
beforeEach(() => {
  indexedDB = new IDBFactory()
})
