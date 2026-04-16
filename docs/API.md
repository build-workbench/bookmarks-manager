# API Documentation

> Module interfaces and function references for Bookmarks Manager

## Table of Contents

- [Bookmark Parser](#bookmark-parser)
- [URL Utilities](#url-utilities)
- [Search Utilities](#search-utilities)
- [Export Utilities](#export-utilities)
- [Folder Utilities](#folder-utilities)
- [Database Layer](#database-layer)
- [AI Services](#ai-services)

---

## Bookmark Parser

**Module**: `src/utils/bookmarkParser.ts`

### `parseNetscapeBookmarks`

Parses Netscape Bookmark HTML format and extracts bookmark data.

```typescript
function parseNetscapeBookmarks(
  html: string,
  fileName: string
): ParseResult;
```

**Parameters**:
| Name | Type | Description |
|------|------|-------------|
| `html` | `string` | HTML content of the bookmark file |
| `fileName` | `string` | Original filename for source tracking |

**Returns**: `ParseResult`

```typescript
interface ParseResult {
  bookmarks: Bookmark[];      // Extracted bookmarks
  error?: string;             // Error message if parsing failed
}
```

**Example**:
```typescript
const html = await file.text();
const result = parseNetscapeBookmarks(html, 'bookmarks.html');

if (result.error) {
  console.error('Parse error:', result.error);
} else {
  console.log(`Parsed ${result.bookmarks.length} bookmarks`);
}
```

---

## URL Utilities

**Module**: `src/utils/url.ts`

### `normalizeUrl`

Normalizes URL for deduplication.

```typescript
function normalizeUrl(url: string): string;
```

**Normalization Rules**:
1. Convert protocol to lowercase (`HTTP` → `http`)
2. Convert hostname to lowercase (`Example.COM` → `example.com`)
3. Standardize port (remove default ports `:80`, `:443`)
4. Handle trailing slashes consistently
5. Sort query parameters alphabetically
6. Remove tracking parameters:
   - `utm_*` (utm_source, utm_medium, etc.)
   - `gclid`
   - `fbclid`
   - `ref`, `referral`

**Example**:
```typescript
normalizeUrl('https://Example.COM/page?utm_source=email');
// Returns: 'https://example.com/page'
```

### `extractDomain`

Extracts domain from URL.

```typescript
function extractDomain(url: string): string;
```

**Example**:
```typescript
extractDomain('https://github.com/user/repo');
// Returns: 'github.com'
```

---

## Search Utilities

**Module**: `src/utils/search.ts`

### `createSearchIndex`

Creates a MiniSearch index for full-text search.

```typescript
function createSearchIndex(
  bookmarks: Bookmark[]
): MiniSearch<Bookmark>;
```

**Index Configuration**:
- `fields`: ['title', 'url', 'path']
- `storeFields`: ['id']
- `searchOptions`: fuzzy matching (0.2 tolerance)

### `search`

Searches bookmarks using the index.

```typescript
function search(
  index: MiniSearch<Bookmark>,
  query: string,
  bookmarks: Bookmark[]
): SearchResultItem[];
```

**Parameters**:
| Name | Type | Description |
|------|------|-------------|
| `index` | `MiniSearch` | Search index instance |
| `query` | `string` | Search query |
| `bookmarks` | `Bookmark[]` | All bookmarks for result lookup |

**Returns**: `SearchResultItem[]`

```typescript
interface SearchResultItem {
  bookmark: Bookmark;
  score: number;        // Relevance score
  match: {
    title?: string[];   // Matched title terms
    url?: string[];     // Matched URL terms
    path?: string[];    // Matched path terms
  };
}
```

### `resetSearchIndex`

Clears the search index. Call after clearing bookmarks.

```typescript
function resetSearchIndex(): void;
```

---

## Export Utilities

**Module**: `src/utils/exporters/`

### `exportToHtml`

Exports bookmarks to Netscape Bookmark HTML format.

```typescript
function exportToHtml(
  bookmarks: Bookmark[],
  options?: HtmlExportOptions
): string;
```

**Options**:
```typescript
interface HtmlExportOptions {
  flatten?: boolean;      // Flatten directory structure
  title?: string;         // Document title
}
```

### `exportToJson`

Exports bookmarks to JSON format.

```typescript
function exportToJson(
  bookmarks: Bookmark[],
  options?: JsonExportOptions
): string;
```

**Options**:
```typescript
interface JsonExportOptions {
  includeMetadata?: boolean;  // Include addDate, lastModified
  pretty?: boolean;           // Pretty print JSON
}
```

### `exportToCsv`

Exports bookmarks to CSV format.

```typescript
function exportToCsv(
  bookmarks: Bookmark[],
  options?: CsvExportOptions
): string;
```

**Options**:
```typescript
interface CsvExportOptions {
  delimiter?: ',' | ';' | '\t';  // Field delimiter
  includeHeader?: boolean;        // Include header row
}
```

### `exportToMarkdown`

Exports bookmarks to Markdown format.

```typescript
function exportToMarkdown(
  bookmarks: Bookmark[],
  options?: MarkdownExportOptions
): string;
```

**Options**:
```typescript
interface MarkdownExportOptions {
  includeToc?: boolean;     // Include table of contents
  title?: string;           // Document title
}
```

---

## Folder Utilities

**Module**: `src/utils/folders.ts`

### `normalizePath`

Normalizes root directory aliases.

```typescript
function normalizePath(path: string[]): string[];
```

**Alias Mapping**:
| Original | Normalized |
|----------|------------|
| `Bookmarks Bar` | `书签栏` |
| `Other Bookmarks` | `其他书签` |
| `Mobile Bookmarks` | `移动书签` |

### `buildFolderTree`

Builds a hierarchical tree structure from flat bookmark paths.

```typescript
function buildFolderTree(
  bookmarks: Bookmark[]
): FolderNode[];
```

**Returns**: `FolderNode[]`

```typescript
interface FolderNode {
  name: string;
  path: string[];
  bookmarks: Bookmark[];
  children: FolderNode[];
}
```

---

## Database Layer

**Module**: `src/utils/db.ts`

### `db`

Singleton Dexie database instance.

```typescript
const db: BookmarksDB;
```

### `saveBookmarks`

Saves bookmarks to IndexedDB.

```typescript
async function saveBookmarks(
  bookmarks: StoredBookmark[]
): Promise<void>;
```

### `loadBookmarks`

Loads bookmarks from IndexedDB.

```typescript
async function loadBookmarks(): Promise<StoredBookmark[]>;
```

### `clearBookmarks`

Clears all bookmarks from IndexedDB.

```typescript
async function clearBookmarks(): Promise<void>;
```

---

## AI Services

**Module**: `src/ai/`

### ConfigService

**File**: `src/ai/configService.ts`

Manages AI provider configuration.

```typescript
class ConfigService {
  async getConfig(): Promise<AIConfig | null>;
  async saveConfig(config: AIConfig): Promise<void>;
  async validateApiKey(config: AIConfig): Promise<boolean>;
  getAvailableModels(provider: ProviderType): string[];
}
```

**Configuration**:
```typescript
interface AIConfig {
  id: string;
  provider: 'openai' | 'claude' | 'custom';
  apiKey: string;
  model: string;
  baseUrl?: string;       // For custom endpoints
  maxTokens: number;
  temperature: number;
}
```

### PromptService

**File**: `src/ai/promptService.ts`

Manages prompt templates.

```typescript
class PromptService {
  async getPrompts(): Promise<AIPrompt[]>;
  async updatePrompt(id: string, template: string): Promise<void>;
  renderPrompt(template: string, variables: Record<string, string>): string;
  resetToDefaults(): Promise<void>;
}
```

**Prompt Template Variables**:
| Variable | Description |
|----------|-------------|
| `{{bookmarks}}` | JSON array of bookmarks |
| `{{query}}` | User search query |
| `{{count}}` | Number of bookmarks |

### CacheService

**File**: `src/ai/cacheService.ts`

Caches AI analysis results.

```typescript
class CacheService {
  async get(key: string): Promise<AICacheEntry | null>;
  async set(key: string, value: unknown, type: CacheType): Promise<void>;
  async clear(type?: CacheType): Promise<void>;
  async getStats(): Promise<CacheStats>;
}
```

**Cache Key Format**: `{operation}:{contentHash}`

### UsageService

**File**: `src/ai/usageService.ts`

Tracks API usage and costs.

```typescript
class UsageService {
  async recordUsage(record: AIUsageRecord): Promise<void>;
  async getUsageStats(
    startDate?: Date,
    endDate?: Date
  ): Promise<UsageStats>;
  async checkLimits(): Promise<LimitCheckResult>;
  async getLimits(): Promise<AIUsageLimit[]>;
  async updateLimit(limit: AIUsageLimit): Promise<void>;
}
```

**Usage Record**:
```typescript
interface AIUsageRecord {
  timestamp: number;
  operation: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCost: number;
  model: string;
}
```

### AIService

**File**: `src/ai/aiService.ts`

Main AI analysis orchestrator.

```typescript
class AIService {
  // Classification
  async classify(
    bookmarks: Bookmark[]
  ): Promise<ClassificationResult[]>;

  // Summarization
  async summarize(
    bookmarks: Bookmark[]
  ): Promise<SummaryResult[]>;

  // Duplicate analysis
  async analyzeDuplicates(
    duplicateGroups: Bookmark[][]
  ): Promise<DuplicateAnalysis[]>;

  // Health check
  async healthCheck(
    bookmarks: Bookmark[]
  ): Promise<HealthCheckResult[]>;

  // Natural language search
  async naturalLanguageSearch(
    query: string,
    bookmarks: Bookmark[]
  ): Promise<SearchResult[]>;

  // Collection report
  async generateReport(
    bookmarks: Bookmark[],
    stats: BookmarkStats
  ): Promise<ReportResult>;
}
```

**Rate Limiting**:
- Exponential backoff for retryable errors
- Respects `Retry-After` header for 429 errors
- Pre-request limit checking

---

## Type Definitions

### Bookmark Types

```typescript
interface Bookmark {
  id: string;
  title: string;
  url: string;
  addDate?: number;
  lastModified?: number;
  iconHref?: string;
  path: string[];
  sourceFile: string;
}

interface StoredBookmark extends Bookmark {
  normalized: string;  // Normalized URL for deduplication
}

interface BookmarkStats {
  total: number;
  duplicates: number;
  domains: Record<string, number>;
  byYear: Record<number, number>;
}
```

### AI Types

```typescript
type ProviderType = 'openai' | 'claude' | 'custom';
type CacheType = 'category' | 'summary' | 'duplicate' | 'health' | 'search' | 'report';

interface ClassificationResult {
  bookmarkId: string;
  category: string;
  tags: string[];
  confidence: number;
}

interface SummaryResult {
  bookmarkId: string;
  summary: string;
  keywords: string[];
}

interface DuplicateAnalysis {
  groupId: string;
  recommendedKeep: string;  // Bookmark ID
  reason: string;
}

interface HealthCheckResult {
  bookmarkId: string;
  issues: HealthIssue[];
  suggestions: string[];
}

interface ReportResult {
  title: string;
  summary: string;
  insights: string[];
  recommendations: string[];
  markdown: string;
}
```

---

## Error Handling

### Standard Error Types

```typescript
class BookmarkError extends Error {
  constructor(
    message: string,
    public code: 'PARSE_ERROR' | 'VALIDATION_ERROR' | 'STORAGE_ERROR'
  ) {
    super(message);
  }
}

class AIError extends Error {
  constructor(
    message: string,
    public code: 'API_ERROR' | 'RATE_LIMIT' | 'INVALID_KEY' | 'TIMEOUT',
    public retryable: boolean
  ) {
    super(message);
  }
}
```

---

## Related Documentation

- [Architecture Overview](./ARCHITECTURE.md)
- [Product Requirements (PRD)](./PRD.md)
- [Contributing Guide](./CONTRIBUTING.md)
