# 架构文档

> Bookmarks Manager 技术架构与设计决策

## 目录

- [概览](#概览)
- [系统架构](#系统架构)
- [核心模块](#核心模块)
- [数据流](#数据流)
- [状态管理](#状态管理)
- [存储层](#存储层)
- [AI 模块架构](#ai-模块架构)
- [性能优化](#性能优化)
- [安全考量](#安全考量)
- [技术选型](#技术选型)

---

## 概览

Bookmarks Manager 是一款**本地优先、隐私优先**的渐进式 Web 应用（PWA），采用现代 Web 技术构建。所有数据处理均在客户端完成，确保数据完全私密。

### 核心原则

| 原则 | 说明 |
|-----------|-------------|
| **本地优先** | 所有操作在浏览器中完成；无需服务器 |
| **隐私优先** | 数据永不离开设备；无追踪和分析 |
| **BYOK（自备密钥）** | AI 功能使用用户自己的 API 密钥 |
| **渐进增强** | 核心功能离线可用；AI 功能可选 |

### 技术栈

| 层级 | 技术 |
|-------|------------|
| 框架 | React 18 + TypeScript |
| 构建工具 | Vite 5 |
| 样式 | Tailwind CSS |
| 状态管理 | Zustand |
| 数据库 | IndexedDB（通过 Dexie） |
| 搜索引擎 | MiniSearch |
| 图表 | Apache ECharts |
| 测试 | Vitest + React Testing Library |

---

## 系统架构

```
┌─────────────────────────────────────────────────────────────┐
│                     UI 层（页面）                            │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │  上传    │ │ 仪表盘   │ │  搜索    │ │   AI     │       │
│  │ (合并)   │ │ (统计)   │ │ (过滤)   │ │ (分析)   │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   状态层（Zustand）                          │
│  ┌─────────────────────┐    ┌─────────────────────┐         │
│  │    书签 Store       │    │      AI Store       │         │
│  │  - 原始项目         │    │  - 配置             │         │
│  │  - 合并后项目       │    │  - 缓存             │         │
│  │  - 统计数据         │    │  - 用量             │         │
│  │  - 搜索索引         │    │  - 提示词           │         │
│  └─────────────────────┘    └─────────────────────┘         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  领域/服务层                                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │  解析器  │ │  搜索    │ │  导出器  │ │  AI 服务 │       │
│  │  工具    │ │  工具    │ │  工具    │ │  (LLM)   │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   持久化层                                   │
│           IndexedDB (Dexie) - 浏览器存储                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │ bookmarks│ │ settings │ │ aiConfig │ │ aiCache  │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
└─────────────────────────────────────────────────────────────┘
```

---

## 核心模块

### 1. 书签处理模块

**位置**: `src/utils/bookmarkParser.ts`

负责解析 Netscape Bookmark HTML 格式并提取书签数据。

```typescript
interface Bookmark {
  id: string;              // UUID
  title: string;           // 书签标题
  url: string;             // 原始 URL
  addDate?: number;        // 创建时间戳（秒）
  lastModified?: number;   // 最后修改时间戳
  iconHref?: string;       // 图标 URL
  path: string[];          // 目录路径（已规范化）
  sourceFile: string;      // 来源文件名
}
```

**关键函数**:
- `parseNetscapeBookmarks(html, fileName)` - 将 HTML 字符串解析为书签数组
- `normalizePath(path)` - 规范化根目录别名
- `normalizeUrl(url)` - URL 规范化用于去重

### 2. 去重引擎

**位置**: `src/store/useBookmarksStore.ts`

URL 规范化规则：
1. 协议标准化（http/https）
2. 主机名小写转换
3. 端口标准化
4. 尾部斜杠处理
5. 查询参数排序
6. 追踪参数移除（utm_*, gclid, fbclid）

**保留策略**: 保留 `addDate` 最早的书签。

### 3. 搜索模块

**位置**: `src/utils/search.ts`

- **引擎**: MiniSearch（倒排索引）
- **字段**: title（权重: 3）、url（权重: 2）、path（权重: 1）
- **特性**: 模糊匹配、前缀搜索、精确短语

### 4. 导出模块

**位置**: `src/utils/exporters/`

支持多种导出格式：
- **HTML**: 标准 Netscape Bookmark 格式
- **JSON**: 带/不带元数据的结构化数据
- **CSV**: 支持字段转义的表格格式
- **Markdown**: 带目录的层级文档

---

## 数据流

### 导入流程

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  文件拖放    │────▶│  HTML 解析器 │────▶│   规范化     │
│  / 选择      │     │              │     │ 路径与 URL   │
└──────────────┘     └──────────────┘     └──────────────┘
                                                   │
                              ┌────────────────────┘
                              ▼
                       ┌──────────────┐
                       │   rawItems   │
                       │   (内存中)   │
                       └──────────────┘
```

### 合并与去重流程

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   rawItems   │────▶│     合并     │────▶│ 按 normalized│
│              │     │              │     │    Url 分组  │
└──────────────┘     └──────────────┘     └──────────────┘
                                                   │
          ┌────────────────────────────────────────┘
          ▼
┌─────────────────────┐     ┌──────────────┐     ┌──────────────┐
│ 从每组选择最佳项目  │────▶│   计算统计   │────▶│  保存到 DB   │
│                     │     │              │     │ (IndexedDB)  │
└─────────────────────┘     └──────────────┘     └──────────────┘
```

### 搜索流程

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   用户查询   │────▶│  MiniSearch  │────▶│    高亮      │
│              │     │    索引      │     │   结果       │
└──────────────┘     └──────────────┘     └──────────────┘
```

---

## 状态管理

### 书签 Store

**文件**: `src/store/useBookmarksStore.ts`

```typescript
interface BookmarkState {
  // 数据
  rawItems: Bookmark[];
  mergedItems: Bookmark[];
  duplicates: Record<string, Bookmark[]>;
  stats: BookmarkStats;
  
  // 导入状态
  importing: boolean;
  importProgress: { stage: string; progress: number };
  importedFiles: ImportedFile[];
  
  // 操作
  importFiles: (files: File[]) => Promise<void>;
  mergeAndDedup: () => Promise<void>;
  clear: () => Promise<void>;
  loadFromDB: () => Promise<void>;
}
```

### AI Store

**文件**: `src/store/useAIStore.ts`

```typescript
interface AIState {
  // 配置
  config: AIConfig;
  
  // 缓存
  cache: Map<string, AICacheEntry>;
  
  // 用量追踪
  usage: AIUsageRecord[];
  usageLimits: AIUsageLimit[];
  
  // 提示词
  prompts: AIPrompt[];
  
  // 操作
  analyze: (bookmarks: Bookmark[], type: AnalysisType) => Promise<AIResult>;
  classify: (bookmarks: Bookmark[]) => Promise<Classification[]>;
  summarize: (bookmarks: Bookmark[]) => Promise<Summary[]>;
  search: (query: string) => Promise<SearchResult[]>;
}
```

---

## 存储层

### IndexedDB 架构

```typescript
// 数据库: BookmarksDB
class BookmarksDB extends Dexie {
  bookmarks!: Table<StoredBookmark, string>;
  settings!: Table<AppSettings, string>;
  
  // AI 相关表
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

## AI 模块架构

### 适配器模式

```
┌─────────────────────────────────────────────────┐
│                 AIService                        │
│   (核心编排：分类、摘要、搜索、报告等)            │
└─────────────────────────────────────────────────┘
                         │
         ┌───────────────┼───────────────┐
         ▼               ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│   OpenAI     │ │    Claude    │ │    自定义    │
│   适配器     │ │    适配器    │ │    适配器    │
└──────────────┘ └──────────────┘ └──────────────┘
         │               │               │
         ▼               ▼               ▼
     OpenAI API    Anthropic API   任意 OpenAI 兼容接口
```

### 服务组件

| 服务 | 职责 | 文件 |
|---------|---------------|------|
| `ConfigService` | API 密钥管理、Provider/模型选择 | `configService.ts` |
| `PromptService` | 模板管理、变量替换 | `promptService.ts` |
| `CacheService` | 基于内容的缓存失效 | `cacheService.ts` |
| `UsageService` | Token 追踪、成本估算、限额 | `usageService.ts` |

### LLM 请求流程

```
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│   用户   │───▶│   检查   │───▶│   渲染   │───▶│   调用   │───▶│  记录    │
│   操作   │    │   缓存   │    │   提示词 │    │ LLM API  │    │  用量    │
└──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘
       │                                                         │
       │                                                         ▼
       │                                                    ┌──────────┐
       │                                                    │   保存   │
       │                                                    │   结果   │
       │                                                    │  到 DB   │
       │                                                    └──────────┘
       │                                                         │
       └─────────────────────────────────────────────────────────┘
                              返回结果
```

---

## 性能优化

### Web Workers

**文件**: `src/workers/bookmarkWorker.ts`

当书签数量 > 500 时用于重型计算：
- 书签解析
- 去重
- 搜索索引构建

**优势**:
- 防止 UI 阻塞
- 更好的感知性能
- Worker 错误时自动回退主线程

### 虚拟滚动

**文件**: `src/ui/VirtualList.tsx`

当搜索结果 > 200 时使用：
- 仅渲染可见项目（约 15 个 DOM 节点）
- 减少内存占用
- 1000+ 条书签也能流畅滚动

### ECharts 优化

- 按需模块加载（tree-shaking）
- 仅导入使用的图表类型
- 包体积减少：1042 KB → 534 KB（减少 48.7%）

### 搜索防抖

- 搜索输入 200ms 防抖
- 防止过度重渲染
- 取消进行中的搜索

---

## 安全考量

### 数据隐私

| 方面 | 实现 |
|--------|---------------|
| 数据存储 | IndexedDB（仅客户端） |
| AI API 密钥 | 存储在 IndexedDB，从不发送到我们的服务器 |
| 网络请求 | 仅到用户指定的 LLM 端点 |
| CORS 策略 | 浏览器标准 CORS |

### 输入验证

- 文件类型验证（扩展名 + MIME 类型）
- 处理前 URL 清理
- 书签渲染 XSS 防护

### 内容安全

- 无内联脚本（符合 CSP）
- 无 eval() 或动态代码执行
- DOM 操作使用可信类型

---

## 技术选型

### 1. IndexedDB 替代 LocalStorage

**决策**: 使用 IndexedDB（通过 Dexie）持久化

**理由**:
- LocalStorage 限制 5MB；IndexedDB 支持 GB 级
- IndexedDB 支持结构化数据和索引
- Dexie 提供基于 Promise 的 API 和 TypeScript 支持

### 2. Zustand 替代 Redux/Context

**决策**: 使用 Zustand 进行状态管理

**理由**:
- 样板代码最少
- 优秀的 TypeScript 支持
- 无需 Provider 包裹
- 支持 DevTools

### 3. MiniSearch 替代 Fuse.js

**决策**: 使用 MiniSearch 进行全文搜索

**理由**:
- 更小的包体积
- 大数据集索引更快
- 前缀匹配性能更好

### 4. AI 的 BYOK（自备密钥）模式

**决策**: 用户提供自己的 LLM API 密钥

**理由**:
- 消除基础设施成本
- 保护隐私（无代理服务器）
- 用户控制成本和速率限制

---

## 路线图

### 当前版本 (v1.1.0)
- ✅ 多格式导出（JSON、CSV、Markdown）
- ✅ 备份与恢复功能
- ✅ Web Worker 优化
- ✅ 大数据集虚拟滚动

### 计划
- 📋 批量编辑和标签系统
- 📋 高级过滤 UI 改进
- 📋 自定义导出器的插件系统

---

## 相关文档

- [产品需求文档 (PRD)](./PRD.zh-CN.md)
- [API 参考](./API.zh-CN.md)
- [贡献指南](./CONTRIBUTING.zh-CN.md)
