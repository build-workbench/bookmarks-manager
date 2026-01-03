/**
 * Property-based testing generators using fast-check
 * These generators create random test data for property tests
 */
import * as fc from 'fast-check'

// Bookmark generator
export const bookmarkArb = fc.record({
  id: fc.uuid(),
  title: fc.string({ minLength: 1, maxLength: 200 }),
  url: fc.webUrl(),
  addDate: fc.integer({ min: 0, max: Math.floor(Date.now() / 1000) }),
  lastModified: fc.option(fc.integer({ min: 0, max: Math.floor(Date.now() / 1000) })),
  iconHref: fc.option(fc.webUrl()),
  path: fc.array(fc.string({ minLength: 1, maxLength: 50 }), { minLength: 0, maxLength: 5 }),
  sourceFile: fc.string({ minLength: 1, maxLength: 100 })
})

// LLM Config generator
export const llmConfigArb = fc.record({
  provider: fc.constantFrom('openai', 'claude', 'custom') as fc.Arbitrary<'openai' | 'claude' | 'custom'>,
  apiKey: fc.string({ minLength: 10, maxLength: 100 }),
  model: fc.string({ minLength: 1, maxLength: 50 }),
  baseUrl: fc.option(fc.webUrl()),
  maxTokens: fc.integer({ min: 100, max: 4000 }),
  temperature: fc.float({ min: 0, max: 2, noNaN: true })
})

// Prompt template generator
export const promptTemplateArb = fc.record({
  id: fc.string({ minLength: 1, maxLength: 50 }),
  name: fc.string({ minLength: 1, maxLength: 100 }),
  description: fc.string({ minLength: 0, maxLength: 500 }),
  template: fc.string({ minLength: 10, maxLength: 2000 }),
  variables: fc.array(fc.string({ minLength: 1, maxLength: 30 }), { minLength: 0, maxLength: 10 }),
  isDefault: fc.boolean(),
  createdAt: fc.integer({ min: 0, max: Date.now() }),
  updatedAt: fc.integer({ min: 0, max: Date.now() })
})

// Category suggestion generator
export const categorySuggestionArb = fc.record({
  bookmarkId: fc.uuid(),
  suggestedCategory: fc.string({ minLength: 1, maxLength: 50 }),
  confidence: fc.float({ min: 0, max: 1, noNaN: true }),
  reasoning: fc.string({ minLength: 1, maxLength: 500 })
})

// Bookmark summary generator
export const bookmarkSummaryArb = fc.record({
  bookmarkId: fc.uuid(),
  summary: fc.string({ minLength: 1, maxLength: 200 }),
  keywords: fc.array(fc.string({ minLength: 1, maxLength: 30 }), { minLength: 1, maxLength: 5 }),
  generatedAt: fc.integer({ min: 0, max: Date.now() })
})

// Health issue generator
export const healthIssueArb = fc.record({
  bookmarkId: fc.uuid(),
  issueType: fc.constantFrom('outdated', 'low_value', 'broken_pattern', 'redundant') as fc.Arbitrary<'outdated' | 'low_value' | 'broken_pattern' | 'redundant'>,
  description: fc.string({ minLength: 1, maxLength: 200 }),
  suggestion: fc.string({ minLength: 1, maxLength: 200 }),
  dismissed: fc.boolean()
})

// Usage record generator
export const usageRecordArb = fc.record({
  id: fc.uuid(),
  timestamp: fc.integer({ min: 0, max: Date.now() }),
  operation: fc.string({ minLength: 1, maxLength: 50 }),
  promptTokens: fc.integer({ min: 0, max: 10000 }),
  completionTokens: fc.integer({ min: 0, max: 10000 }),
  totalTokens: fc.integer({ min: 0, max: 20000 }),
  estimatedCost: fc.float({ min: 0, max: 10, noNaN: true }),
  model: fc.string({ minLength: 1, maxLength: 50 })
})

// Cache entry generator
export const cacheEntryArb = <T>(valueArb: fc.Arbitrary<T>) => fc.record({
  key: fc.string({ minLength: 1, maxLength: 100 }),
  value: valueArb,
  createdAt: fc.integer({ min: 0, max: Date.now() }),
  expiresAt: fc.integer({ min: Date.now(), max: Date.now() + 86400000 }),
  bookmarkHash: fc.string({ minLength: 32, maxLength: 32 })
})

// Non-empty string generator
export const nonEmptyStringArb = fc.string({ minLength: 1, maxLength: 200 })

// Valid URL generator
export const validUrlArb = fc.webUrl()

// Whitespace-only string generator (for testing validation)
export const whitespaceOnlyArb = fc.stringMatching(/^[\s]+$/).filter(s => s.length > 0 && s.length <= 20)

// Property test configuration
export const PBT_CONFIG = {
  numRuns: 100,
  verbose: false
}
