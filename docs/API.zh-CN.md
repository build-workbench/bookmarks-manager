# API 文档

> Bookmarks Manager 模块接口与函数参考

## 目录

- [书签解析器](#书签解析器)
- [URL 工具](#url-工具)
- [搜索工具](#搜索工具)
- [导出工具](#导出工具)
- [文件夹工具](#文件夹工具)
- [数据库层](#数据库层)
- [AI 服务](#ai-服务)

---

## 书签解析器

**模块**: `src/utils/bookmarkParser.ts`

### `parseNetscapeBookmarks`

解析 Netscape Bookmark HTML 格式并提取书签数据。

```typescript
function parseNetscapeBookmarks(
  html: string,
  fileName: string
): ParseResult;
```

**参数**:
| 名称 | 类型 | 说明 |
|------|------|-------------|
| `html` | `string` | 书签文件的 HTML 内容 |
| `fileName` | `string` | 原始文件名（用于来源追踪） |

**返回**: `ParseResult`

```typescript
interface ParseResult {
  bookmarks: Bookmark[];      // 提取的书签
  error?: string;             // 解析失败的错误信息
}
```

**示例**:
```typescript
const html = await file.text();
const result = parseNetscapeBookmarks(html, 'bookmarks.html');

if (result.error) {
  console.error('解析错误:', result.error);
} else {
  console.log(`解析了 ${result.bookmarks.length} 个书签`);
}
```

---

## URL 工具

**模块**: `src/utils/url.ts`

### `normalizeUrl`

规范化 URL 用于去重。

```typescript
function normalizeUrl(url: string): string;
```

**规范化规则**:
1. 协议转小写（`HTTP` → `http`）
2. 主机名转小写（`Example.COM` → `example.com`）
3. 端口标准化（移除默认端口 `:80`、`:443`）
4. 统一处理尾部斜杠
5. 查询参数按字母排序
6. 移除追踪参数：
   - `utm_*`（utm_source、utm_medium 等）
   - `gclid`
   - `fbclid`
   - `ref`、`referral`

**示例**:
```typescript
normalizeUrl('https://Example.COM/page?utm_source=email');
// 返回: 'https://example.com/page'
```

### `extractDomain`

从 URL 提取域名。

```typescript
function extractDomain(url: string): string;
```

**示例**:
```typescript
extractDomain('https://github.com/user/repo');
// 返回: 'github.com'
```

---

## 搜索工具

**模块**: `src/utils/search.ts`

### `createSearchIndex`

创建 MiniSearch 索引用于全文搜索。

```typescript
function createSearchIndex(
  bookmarks: Bookmark[]
): MiniSearch<Bookmark>;
```

**索引配置**:
- `fields`: ['title', 'url', 'path']
- `storeFields`: ['id']
- `searchOptions`: 模糊匹配（容差 0.2）

### `search`

使用索引搜索书签。

```typescript
function search(
  index: MiniSearch<Bookmark>,
  query: string,
  bookmarks: Bookmark[]
): SearchResultItem[];
```

**参数**:
| 名称 | 类型 | 说明 |
|------|------|-------------|
| `index` | `MiniSearch` | 搜索索引实例 |
| `query` | `string` | 搜索查询 |
| `bookmarks` | `Bookmark[]` | 所有书签（用于结果查找） |

**返回**: `SearchResultItem[]`

```typescript
interface SearchResultItem {
  bookmark: Bookmark;
  score: number;        // 相关度分数
  match: {
    title?: string[];   // 匹配的标题词
    url?: string[];     // 匹配的 URL 词
    path?: string[];    // 匹配的路径词
  };
}
```

### `resetSearchIndex`

清除搜索索引。清空书签后调用。

```typescript
function resetSearchIndex(): void;
```

---

## 导出工具

**模块**: `src/utils/exporters/`

### `exportToHtml`

导出书签到 Netscape Bookmark HTML 格式。

```typescript
function exportToHtml(
  bookmarks: Bookmark[],
  options?: HtmlExportOptions
): string;
```

**选项**:
```typescript
interface HtmlExportOptions {
  flatten?: boolean;      // 平铺目录结构
  title?: string;         // 文档标题
}
```

### `exportToJson`

导出书签到 JSON 格式。

```typescript
function exportToJson(
  bookmarks: Bookmark[],
  options?: JsonExportOptions
): string;
```

**选项**:
```typescript
interface JsonExportOptions {
  includeMetadata?: boolean;  // 包含 addDate、lastModified
  pretty?: boolean;           // 格式化 JSON
}
```

### `exportToCsv`

导出书签到 CSV 格式。

```typescript
function exportToCsv(
  bookmarks: Bookmark[],
  options?: CsvExportOptions
): string;
```

**选项**:
```typescript
interface CsvExportOptions {
  delimiter?: ',' | ';' | '\t';  // 字段分隔符
  includeHeader?: boolean;        // 包含表头
}
```

### `exportToMarkdown`

导出书签到 Markdown 格式。

```typescript
function exportToMarkdown(
  bookmarks: Bookmark[],
  options?: MarkdownExportOptions
): string;
```

**选项**:
```typescript
interface MarkdownExportOptions {
  includeToc?: boolean;     // 包含目录
  title?: string;           // 文档标题
}
```

---

## 文件夹工具

**模块**: `src/utils/folders.ts`

### `normalizePath`

规范化根目录别名。

```typescript
function normalizePath(path: string[]): string[];
```

**别名映射**:
| 原始值 | 规范化值 |
|----------|------------|
| `Bookmarks Bar` | `书签栏` |
| `Other Bookmarks` | `其他书签` |
| `Mobile Bookmarks` | `移动书签` |

### `buildFolderTree`

从扁平的书签路径构建层级树结构。

```typescript
function buildFolderTree(
  bookmarks: Bookmark[]
): FolderNode[];
```

**返回**: `FolderNode[]`

```typescript
interface FolderNode {
  name: string;
  path: string[];
  bookmarks: Bookmark[];
  children: FolderNode[];
}
```

---

## 数据库层

**模块**: `src/utils/db.ts`

### `db`

Dexie 数据库单例实例。

```typescript
const db: BookmarksDB;
```

### `saveBookmarks`

保存书签到 IndexedDB。

```typescript
async function saveBookmarks(
  bookmarks: StoredBookmark[]
): Promise<void>;
```

### `loadBookmarks`

从 IndexedDB 加载书签。

```typescript
async function loadBookmarks(): Promise<StoredBookmark[]>;
```

### `clearBookmarks`

从 IndexedDB 清除所有书签。

```typescript
async function clearBookmarks(): Promise<void>;
```

---

## AI 服务

**模块**: `src/ai/`

### ConfigService

**文件**: `src/ai/configService.ts`

管理 AI Provider 配置。

```typescript
class ConfigService {
  async getConfig(): Promise<AIConfig | null>;
  async saveConfig(config: AIConfig): Promise<void>;
  async validateApiKey(config: AIConfig): Promise<boolean>;
  getAvailableModels(provider: ProviderType): string[];
}
```

**配置**:
```typescript
interface AIConfig {
  id: string;
  provider: 'openai' | 'claude' | 'custom';
  apiKey: string;
  model: string;
  baseUrl?: string;       // 用于自定义端点
  maxTokens: number;
  temperature: number;
}
```

### PromptService

**文件**: `src/ai/promptService.ts`

管理提示词模板。

```typescript
class PromptService {
  async getPrompts(): Promise<AIPrompt[]>;
  async updatePrompt(id: string, template: string): Promise<void>;
  renderPrompt(template: string, variables: Record<string, string>): string;
  resetToDefaults(): Promise<void>;
}
```

**提示词模板变量**:
| 变量 | 说明 |
|----------|-------------|
| `{{bookmarks}}` | 书签 JSON 数组 |
| `{{query}}` | 用户搜索查询 |
| `{{count}}` | 书签数量 |

### CacheService

**文件**: `src/ai/cacheService.ts`

缓存 AI 分析结果。

```typescript
class CacheService {
  async get(key: string): Promise<AICacheEntry | null>;
  async set(key: string, value: unknown, type: CacheType): Promise<void>;
  async clear(type?: CacheType): Promise<void>;
  async getStats(): Promise<CacheStats>;
}
```

**缓存键格式**: `{operation}:{contentHash}`

### UsageService

**文件**: `src/ai/usageService.ts`

追踪 API 用量和成本。

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

**用量记录**:
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

**文件**: `src/ai/aiService.ts`

AI 分析主编排器。

```typescript
class AIService {
  // 分类
  async classify(
    bookmarks: Bookmark[]
  ): Promise<ClassificationResult[]>;

  // 摘要生成
  async summarize(
    bookmarks: Bookmark[]
  ): Promise<SummaryResult[]>;

  // 重复分析
  async analyzeDuplicates(
    duplicateGroups: Bookmark[][]
  ): Promise<DuplicateAnalysis[]>;

  // 健康检查
  async healthCheck(
    bookmarks: Bookmark[]
  ): Promise<HealthCheckResult[]>;

  // 自然语言搜索
  async naturalLanguageSearch(
    query: string,
    bookmarks: Bookmark[]
  ): Promise<SearchResult[]>;

  // 集合报告
  async generateReport(
    bookmarks: Bookmark[],
    stats: BookmarkStats
  ): Promise<ReportResult>;
}
```

**速率限制**:
- 可重试错误使用指数退避
- 429 错误尊重 `Retry-After` 响应头
- 请求前进行限额检查

---

## 类型定义

### 书签类型

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
  normalized: string;  // 用于去重的规范化 URL
}

interface BookmarkStats {
  total: number;
  duplicates: number;
  domains: Record<string, number>;
  byYear: Record<number, number>;
}
```

### AI 类型

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
  recommendedKeep: string;  // 书签 ID
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

## 错误处理

### 标准错误类型

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

## 相关文档

- [架构概览](./ARCHITECTURE.zh-CN.md)
- [产品需求文档 (PRD)](./PRD.zh-CN.md)
- [贡献指南](./CONTRIBUTING.zh-CN.md)
