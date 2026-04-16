# Architecture Documentation

> Technical architecture and design decisions for Bookmarks Manager

## Table of Contents

- [Overview](#overview)
- [System Architecture](#system-architecture)
- [Core Modules](#core-modules)
- [Data Flow](#data-flow)
- [State Management](#state-management)
- [Storage Layer](#storage-layer)
- [AI Module Architecture](#ai-module-architecture)
- [Performance Optimizations](#performance-optimizations)
- [Security Considerations](#security-considerations)
- [Technology Decisions](#technology-decisions)

---

## Overview

Bookmarks Manager is a **Local-first, Privacy-first** Progressive Web Application (PWA) built with modern web technologies. All data processing occurs client-side, ensuring complete data privacy.

### Core Principles

| Principle | Description |
|-----------|-------------|
| **Local-First** | All operations happen in the browser; no server required |
| **Privacy-First** | Data never leaves the device; no tracking or analytics |
| **BYOK (Bring Your Own Key)** | AI features use user's own API keys |
| **Progressive Enhancement** | Core features work offline; AI is optional |

### Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | React 18 + TypeScript |
| Build Tool | Vite 5 |
| Styling | Tailwind CSS |
| State Management | Zustand |
| Database | IndexedDB (via Dexie) |
| Search Engine | MiniSearch |
| Charts | Apache ECharts |
| Testing | Vitest + React Testing Library |

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     UI Layer (Pages)                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │  Upload  │ │ Dashboard│ │  Search  │ │   AI     │       │
│  │  (Merge) │ │ (Stats)  │ │ (Filter) │ │ (Analyze)│       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   State Layer (Zustand)                      │
│  ┌─────────────────────┐    ┌─────────────────────┐         │
│  │  Bookmark Store     │    │     AI Store        │         │
│  │  - Raw items        │    │  - Config           │         │
│  │  - Merged items     │    │  - Cache            │         │
│  │  - Statistics       │    │  - Usage            │         │
│  │  - Search index     │    │  - Prompts          │         │
│  └─────────────────────┘    └─────────────────────┘         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  Domain/Service Layer                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │  Parser  │ │  Search  │ │ Exporters│ │  AI Svc  │       │
│  │  Utils   │ │  Utils   │ │  Utils   │ │  (LLM)   │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Persistence Layer                          │
│           IndexedDB (Dexie) - Browser Storage                │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │bookmarks │ │ settings │ │ aiConfig │ │ aiCache  │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
└─────────────────────────────────────────────────────────────┘
```

---

## Core Modules

### 1. Bookmark Processing Module

**Location**: `src/utils/bookmarkParser.ts`

Responsible for parsing Netscape Bookmark HTML format and extracting bookmark data.

```typescript
interface Bookmark {
  id: string;              // UUID
  title: string;           // Bookmark title
  url: string;             // Original URL
  addDate?: number;        // Creation timestamp (seconds)
  lastModified?: number;   // Last modified timestamp
  iconHref?: string;       // Favicon URL
  path: string[];          // Directory path (normalized)
  sourceFile: string;      // Source filename
}
```

**Key Functions**:
- `parseNetscapeBookmarks(html, fileName)` - Parse HTML string to bookmark array
- `normalizePath(path)` - Normalize root directory aliases
- `normalizeUrl(url)` - URL normalization for deduplication

### 2. Deduplication Engine

**Location**: `src/store/useBookmarksStore.ts`

URL normalization rules:
1. Protocol standardization (http/https)
2. Hostname lowercase conversion
3. Port normalization
4. Trailing slash handling
5. Query parameter sorting
6. Tracking parameter removal (utm_*, gclid, fbclid)

**Retention Strategy**: Keep the bookmark with earliest `addDate`.

### 3. Search Module

**Location**: `src/utils/search.ts`

- **Engine**: MiniSearch (inverted index)
- **Fields**: title (weight: 3), url (weight: 2), path (weight: 1)
- **Features**: Fuzzy matching, prefix search, exact phrase

### 4. Export Module

**Location**: `src/utils/exporters/`

Supports multiple export formats:
- **HTML**: Standard Netscape Bookmark format
- **JSON**: Structured data with/without metadata
- **CSV**: Tabular format with field escaping
- **Markdown**: Hierarchical document with TOC

---

## Data Flow

### Import Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  File Drop   │────▶│ HTML Parser  │────▶│ Normalize    │
│  / Select    │     │              │     │ Path & URL   │
└──────────────┘     └──────────────┘     └──────────────┘
                                                   │
                              ┌────────────────────┘
                              ▼
                       ┌──────────────┐
                       │   rawItems   │
                       │  (In Memory) │
                       └──────────────┘
```

### Merge & Deduplication Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   rawItems   │────▶│    Merge     │────▶│   Group by   │
│              │     │              │     │ normalizedUrl│
└──────────────┘     └──────────────┘     └──────────────┘
                                                   │
          ┌────────────────────────────────────────┘
          ▼
┌─────────────────────┐     ┌──────────────┐     ┌──────────────┐
│ Select best from    │────▶│  Calculate   │────▶│  Save to DB  │
│ each duplicate group│     │   statistics │     │  (IndexedDB) │
└─────────────────────┘     └──────────────┘     └──────────────┘
```

### Search Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  User Query  │────▶│ MiniSearch   │────▶│  Highlight   │
│              │     │   Index      │     │   Results    │
└──────────────┘     └──────────────┘     └──────────────┘
```

---

## State Management

### Bookmark Store

**File**: `src/store/useBookmarksStore.ts`

```typescript
interface BookmarkState {
  // Data
  rawItems: Bookmark[];
  mergedItems: Bookmark[];
  duplicates: Record<string, Bookmark[]>;
  stats: BookmarkStats;
  
  // Import state
  importing: boolean;
  importProgress: { stage: string; progress: number };
  importedFiles: ImportedFile[];
  
  // Actions
  importFiles: (files: File[]) => Promise<void>;
  mergeAndDedup: () => Promise<void>;
  clear: () => Promise<void>;
  loadFromDB: () => Promise<void>;
}
```

### AI Store

**File**: `src/store/useAIStore.ts`

```typescript
interface AIState {
  // Config
  config: AIConfig;
  
  // Cache
  cache: Map<string, AICacheEntry>;
  
  // Usage tracking
  usage: AIUsageRecord[];
  usageLimits: AIUsageLimit[];
  
  // Prompts
  prompts: AIPrompt[];
  
  // Actions
  analyze: (bookmarks: Bookmark[], type: AnalysisType) => Promise<AIResult>;
  classify: (bookmarks: Bookmark[]) => Promise<Classification[]>;
  summarize: (bookmarks: Bookmark[]) => Promise<Summary[]>;
  search: (query: string) => Promise<SearchResult[]>;
}
```

---

## Storage Layer

### IndexedDB Schema

```typescript
// Database: BookmarksDB
class BookmarksDB extends Dexie {
  bookmarks!: Table<StoredBookmark, string>;
  settings!: Table<AppSettings, string>;
  
  // AI-related tables
  aiConfig!: Table<AIConfig, string>;
  aiCache!: Table<AICache, string>;
  aiUsage!: Table<AIUsage, number>;
  aiPrompts!: Table<AIPrompt, string>;
  aiUsageLimits!: Table<AIUsageLimit, string>;

  constructor() {
    super('BookmarksDB');
    this.version(2).stores({
      bookmarks: 'id, normalized, addDate',
      settings: 'id',
      aiConfig: 'id',
      aiCache: 'key, type, expiresAt',
      aiUsage: '++id, timestamp, operation',
      aiPrompts: 'id',
      aiUsageLimits: 'id'
    });
  }
}
```

---

## AI Module Architecture

### Adapter Pattern

```
┌─────────────────────────────────────────────────┐
│                 AIService                        │
│  (Core orchestration: classify, summarize, etc)  │
└─────────────────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│  OpenAI      │ │   Claude     │ │   Custom     │
│  Adapter     │ │   Adapter    │ │   Adapter    │
└──────────────┘ └──────────────┘ └──────────────┘
         │               │               │
         ▼               ▼               ▼
     OpenAI API    Anthropic API   Any OpenAI-compatible
```

### Service Components

| Service | Responsibility | File |
|---------|---------------|------|
| `ConfigService` | API key management, provider/model selection | `configService.ts` |
| `PromptService` | Template management, variable substitution | `promptService.ts` |
| `CacheService` | Result caching with content-based invalidation | `cacheService.ts` |
| `UsageService` | Token tracking, cost estimation, limits | `usageService.ts` |

### LLM Request Flow

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  User    │───▶│  Check   │───▶│  Render  │───▶│  Call    │───▶│ Record   │
│  Action  │    │  Cache   │    │  Prompt  │    │  LLM API │    │  Usage   │
└──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘
       │                                                         │
       │                                                         ▼
       │                                                    ┌──────────┐
       │                                                    │  Save    │
       │                                                    │  Result  │
       │                                                    │  to DB   │
       │                                                    └──────────┘
       │                                                         │
       └─────────────────────────────────────────────────────────┘
                              Return Result
```

---

## Performance Optimizations

### Web Workers

**File**: `src/workers/bookmarkWorker.ts`

Used for heavy computations when bookmark count > 500:
- Bookmark parsing
- Deduplication
- Search index building

**Benefits**:
- Prevents UI blocking
- Better perceived performance
- Automatic fallback to main thread on Worker error

### Virtual Scrolling

**File**: `src/ui/VirtualList.tsx`

Used when search results > 200:
- Renders only visible items (~15 DOM nodes)
- Reduces memory footprint
- Smooth scrolling for 1000+ items

### ECharts Optimization

- On-demand module loading (tree-shaking)
- Only import used chart types
- Reduced bundle size: 1042 KB → 534 KB (48.7% reduction)

### Search Debouncing

- 200ms debounce on search input
- Prevents excessive re-renders
- Cancellation of in-flight searches

---

## Security Considerations

### Data Privacy

| Aspect | Implementation |
|--------|---------------|
| Data Storage | IndexedDB (client-side only) |
| AI API Keys | Stored in IndexedDB, never transmitted to our servers |
| Network Requests | Only to user-specified LLM endpoints |
| CORS Policy | Browser standard CORS for LLM APIs |

### Input Validation

- File type validation (extension + MIME type)
- URL sanitization before processing
- XSS prevention in bookmark rendering

### Content Security

- No inline scripts (CSP compliant)
- No eval() or dynamic code execution
- Trusted Types for DOM manipulation

---

## Technology Decisions

### 1. IndexedDB over LocalStorage

**Decision**: Use IndexedDB (via Dexie) for persistence

**Rationale**:
- LocalStorage has 5MB limit; IndexedDB supports GBs
- IndexedDB supports structured data and indexing
- Dexie provides Promise-based API with TypeScript support

### 2. Zustand over Redux/Context

**Decision**: Use Zustand for state management

**Rationale**:
- Minimal boilerplate
- Excellent TypeScript support
- No Provider wrapping required
- DevTools integration

### 3. MiniSearch over Fuse.js

**Decision**: Use MiniSearch for full-text search

**Rationale**:
- Smaller bundle size
- Faster indexing for large datasets
- Better prefix matching performance

### 4. BYOK (Bring Your Own Key) for AI

**Decision**: Users provide their own LLM API keys

**Rationale**:
- Eliminates infrastructure costs
- Preserves privacy (no proxy server)
- User controls cost and rate limits

---

## Roadmap

### Current (v1.1.0)
- ✅ Multi-format export (JSON, CSV, Markdown)
- ✅ Backup & restore functionality
- ✅ Web Worker optimization
- ✅ Virtual scrolling for large lists

### Planned
- 📋 Batch editing and tagging system
- 📋 Advanced filtering UI improvements
- 📋 Plugin system for custom exporters

---

## Related Documentation

- [Product Requirements (PRD)](./PRD.md)
- [API Reference](./API.md)
- [Contributing Guide](./CONTRIBUTING.md)
