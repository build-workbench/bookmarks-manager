import { describe, it, expect } from 'vitest'
import { parseJSONResponse } from './llmHelpers'

describe('llmHelpers', () => {
  it('parses fenced json blocks', () => {
    const parsed = parseJSONResponse<{ ok: boolean; value: number }>('```json\n{"ok":true,"value":1}\n```')
    expect(parsed).toEqual({ ok: true, value: 1 })
  })

  it('parses json embedded in prose', () => {
    const parsed = parseJSONResponse<{ ok: boolean }>('Here is the result:\n{"ok":true}\nThanks')
    expect(parsed).toEqual({ ok: true })
  })

  it('throws on invalid json response', () => {
    expect(() => parseJSONResponse('not json at all')).toThrow()
  })
})
