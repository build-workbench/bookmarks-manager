/**
 * Bookmark Worker Client
 * Web Worker wrapper with Promise-based API and progress callbacks
 */

import type { Bookmark } from '@/utils/bookmarkParser'
import type { WorkerMessage, WorkerResponse } from './bookmarkWorker'

export interface ParseFilesResult {
  bookmarks: Bookmark[]
  errors: string[]
  progress?: { current: number; total: number; fileName: string }
}

export interface MergeDedupResult {
  merged: Bookmark[]
  duplicates: Record<string, Bookmark[]>
  stats: {
    total: number
    duplicates: number
    byDomain: Record<string, number>
    byYear: Record<string, number>
  }
}

export class BookmarkWorkerClient {
  private worker: Worker | null = null
  private messageId = 0
  private pendingResolvers = new Map<number, {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolve: (value: any) => void
    reject: (reason: Error) => void
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onProgress?: (progress: any) => void
  }>()

  constructor() {
    this.initWorker()
  }

  private initWorker() {
    this.worker = new Worker(
      new URL('./bookmarkWorker.ts', import.meta.url),
      { type: 'module' }
    )

    this.worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      const data = event.data

      // Handle progress updates - they don't have a specific resolver
      if (data.type.endsWith('_PROGRESS')) {
        return
      }

      // Handle results and errors
      const resolver = this.pendingResolvers.get(this.messageId)
      if (!resolver) return

      if (data.type === 'ERROR') {
        resolver.reject(new Error(data.payload.message))
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver.resolve(data.payload as any)
      }

      this.pendingResolvers.delete(this.messageId)
    }

    this.worker.onerror = (error) => {
      console.error('Worker error:', error)
      // Reject all pending
      this.pendingResolvers.forEach(({ reject }) => {
        reject(new Error('Worker error: ' + error.message))
      })
      this.pendingResolvers.clear()
    }
  }

  private postMessage<T>(
    message: WorkerMessage,
    onProgress?: (progress: unknown) => void
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      if (!this.worker) {
        reject(new Error('Worker not initialized'))
        return
      }

      this.messageId++
      this.pendingResolvers.set(this.messageId, { resolve, reject, onProgress })

      try {
        this.worker.postMessage(message)
      } catch (error) {
        this.pendingResolvers.delete(this.messageId)
        reject(error)
      }
    })
  }

  /**
   * Parse multiple bookmark files
   */
  async parseFiles(
    files: Array<{ name: string; content: string }>,
    onProgress?: (current: number, total: number, fileName: string) => void
  ): Promise<ParseFilesResult> {
    const result: ParseFilesResult = { bookmarks: [], errors: [] }

    // Set up progress listener
    const progressHandler = (event: MessageEvent<WorkerResponse>) => {
      if (event.data.type === 'PARSE_FILES_PROGRESS' && onProgress) {
        const { current, total, fileName } = event.data.payload
        onProgress(current, total, fileName)
      }
    }

    if (this.worker) {
      this.worker.addEventListener('message', progressHandler)
    }

    try {
      const payload = await this.postMessage<{
        bookmarks: Bookmark[]
        errors: string[]
      }>({ type: 'PARSE_FILES', payload: { files } })

      result.bookmarks = payload.bookmarks
      result.errors = payload.errors
    } finally {
      if (this.worker) {
        this.worker.removeEventListener('message', progressHandler)
      }
    }

    return result
  }

  /**
   * Merge and deduplicate bookmarks
   */
  async mergeAndDedup(
    bookmarks: Bookmark[],
    onProgress?: (stage: string) => void
  ): Promise<MergeDedupResult> {
    const result: MergeDedupResult = {
      merged: [],
      duplicates: {},
      stats: { total: 0, duplicates: 0, byDomain: {}, byYear: {} }
    }

    // Progress handler
    const progressHandler = (event: MessageEvent<WorkerResponse>) => {
      if (event.data.type === 'MERGE_DEDUP_PROGRESS' && onProgress) {
        onProgress(event.data.payload.stage)
      }
    }

    if (this.worker) {
      this.worker.addEventListener('message', progressHandler)
    }

    try {
      // Listen for both MERGE_DEDUP_RESULT and STATS_RESULT
      let mergeReceived = false
      let statsReceived = false

      await new Promise<void>((resolve, reject) => {
        const handler = (event: MessageEvent<WorkerResponse>) => {
          const data = event.data

          if (data.type === 'MERGE_DEDUP_RESULT') {
            result.merged = data.payload.merged
            result.duplicates = data.payload.duplicates
            mergeReceived = true
          }

          if (data.type === 'STATS_RESULT') {
            result.stats = data.payload
            statsReceived = true
          }

          if (data.type === 'ERROR') {
            reject(new Error(data.payload.message))
            return
          }

          if (mergeReceived && statsReceived) {
            resolve()
          }
        }

        if (this.worker) {
          // Replace the main handler temporarily
          const originalHandler = this.worker.onmessage
          this.worker.onmessage = (event) => {
            progressHandler(event)
            handler(event)
            // Also call original handler for cleanup
            if (originalHandler && mergeReceived && statsReceived) {
              originalHandler.call(this.worker!, event)
            }
          }
        }

        // Send the message
        this.postMessage({ type: 'MERGE_DEDUP', payload: { bookmarks } })
          .catch(reject)

        // Timeout after 60 seconds
        setTimeout(() => {
          if (!mergeReceived || !statsReceived) {
            reject(new Error('Worker timeout'))
          }
        }, 60000)
      })
    } finally {
      // Restore original handler
      this.initWorker()
    }

    return result
  }

  /**
   * Build search index (result is not returned, just completion signal)
   */
  async buildSearchIndex(bookmarks: Bookmark[]): Promise<boolean> {
    const result = await this.postMessage<{ success: boolean }>({
      type: 'BUILD_SEARCH_INDEX',
      payload: { bookmarks }
    })
    return result.success
  }

  /**
   * Terminate the worker
   */
  terminate(): void {
    if (this.worker) {
      this.worker.terminate()
      this.worker = null
    }
    this.pendingResolvers.clear()
  }
}

// Singleton instance
let workerClient: BookmarkWorkerClient | null = null

export function getWorkerClient(): BookmarkWorkerClient {
  if (!workerClient) {
    workerClient = new BookmarkWorkerClient()
  }
  return workerClient
}

export function terminateWorker(): void {
  if (workerClient) {
    workerClient.terminate()
    workerClient = null
  }
}
