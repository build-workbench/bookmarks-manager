# Bookmarks Analysis 设计与架构文档（DESIGN）

## 1. 目标

本设计文档用于：

- 将当前实现梳理为一套 **一致、可扩展、可维护** 的架构边界。
- 明确模块职责、数据流与关键约束（Local-first、隐私优先）。
- 为后续功能（高级过滤/导出增强/性能优化/AI 可选扩展）提供可落地的设计基线。

## 2. 架构总览

### 2.1 架构形态

- **PWA 单页应用（SPA）**
- **Local-first 数据处理**：解析/去重/统计/索引全部在浏览器端完成。
- **持久化**：IndexedDB（Dexie）保存合并后的结果和少量设置。

### 2.2 分层与模块

- **UI 层**：`src/pages/*` 页面组件 + `src/ui/*` 可复用组件
- **状态/应用层**：
  - `src/store/useBookmarksStore.ts`（Zustand）- 书签状态管理
  - `src/store/useAIStore.ts`（Zustand）- AI 功能状态管理
- **领域/能力层**：
  - `src/utils/*`（解析、URL 归一、目录归一、导出、搜索、DB）
  - `src/ai/*`（AI 服务、适配器、缓存、用量追踪）

> 现阶段是典型的小型前端单仓结构：页面直接调用 store，store 组合 utils/ai。

## 3. 核心数据模型

### 3.1 Bookmark

- `id`：UUID
- `title`：标题
- `url`：原始 URL
- `addDate` / `lastModified`：时间戳（Netscape 格式，秒）
- `iconHref`：可选图标
- `path: string[]`：目录路径（已做根目录别名归一）
- `sourceFile`：来源文件名

### 3.2 StoredBookmark

在持久化层扩展字段：

- `normalized`：`normalizeUrl(url)` 的结果，用于去重与查询

### 3.3 AppSettings

- `id`：键
- `apiKey?`：AI Key（已废弃，迁移到 AIConfig）
- `lastUpdated`：更新时间（毫秒）

### 3.4 AIConfig

- `provider`：LLM 提供商（openai / claude / custom）
- `apiKey`：API 密钥
- `model`：模型名称
- `baseUrl?`：自定义端点 URL
- `maxTokens`：最大 Token 数
- `temperature`：温度参数

### 3.5 AICache

- `key`：缓存键（操作类型 + 内容哈希）
- `type`：缓存类型（category / summary / duplicate / health / report）
- `value`：缓存值（JSON）
- `contentHash`：内容哈希（用于失效检测）
- `createdAt`：创建时间
- `expiresAt`：过期时间

### 3.6 AIUsage

- `timestamp`：记录时间
- `operation`：操作类型
- `promptTokens`：Prompt Token 数
- `completionTokens`：Completion Token 数
- `totalTokens`：总 Token 数
- `estimatedCost`：估算成本
- `model`：使用的模型

### 3.7 AIPrompt

- `id`：模板 ID
- `name`：模板名称
- `description`：模板描述
- `template`：模板内容（支持 `{{variable}}` 变量）
- `variables`：变量列表
- `isDefault`：是否为默认模板
- `isCustomized`：是否已自定义

### 3.8 AIUsageLimit

- `id`：限额 ID
- `type`：限额类型（daily_tokens / daily_cost / monthly_tokens / monthly_cost）
- `limit`：限额值
- `enabled`：是否启用

## 4. 关键数据流（端到端）

### 4.1 导入 → 解析

- 页面：上传页触发 `store.importFiles(files)`
- `parseNetscapeBookmarks(html, fileName)`：解析 Netscape HTML 结构，产出 `Bookmark[]`
- `normalizePath(path)`：统一根目录别名（书签栏/其他书签/移动书签）
- 输出：追加到 `rawItems`，并置 `needsMerge = true`

### 4.2 合并去重 → 统计 → 持久化 → 索引

- `mergeAndDedup()`
  - `normalizeUrl(url)` 生成 key 分组
  - 每组挑选“最优保留项”（当前策略：时间戳最早且有效）
  - 计算：
    - `duplicates`（按 normalizedUrl 分组，`[保留项, ...重复项]`）
    - `stats`（总量、重复数量、按域名、按年份）
  - 写入 DB：`saveBookmarks(StoredBookmark[])`
  - 构建搜索索引：`createSearchIndex(mergedItems)`

### 4.3 启动恢复（刷新/重开）

- `loadFromDB()`
  - 读取 `StoredBookmark[]`
  - 还原为 `Bookmark[]`
  - 初始化 `rawItems/mergedItems/stats`
  - 构建搜索索引

## 5. 模块职责与边界（统一约定）

### 5.1 `src/pages/*`

- 只做：布局、交互、渲染与调用 store
- 不做：复杂业务计算（放 store/utils），避免页面散落规则

### 5.2 `src/store/useBookmarksStore.ts`

- 负责：
  - 应用状态（raw/merged/duplicates/stats/loading flags）
  - 组合业务流程（import → merge → persist → index）
- 不负责：
  - DOM/浏览器 API 细节（除必要，如读取 File 文本）
  - 复杂字符串处理实现细节（放 utils）

### 5.3 `src/utils/*`

- 纯能力函数：
  - 解析：`bookmarkParser.ts`
  - URL 归一：`url.ts`
  - 目录归一/树：`folders.ts`
  - 导出：`exporter.ts`
  - 搜索索引：`search.ts`
  - 持久化：`db.ts`

## 6. 设计决策：Roadmap 裁剪落地方式

### 6.1 P0（核心体验）设计要点

- **拖拽导入**：
  - 采用“Dropzone 区域 + drag-over 视觉状态 + 文件列表管理”。
  - 业务逻辑仍走 `importFiles()`，UI 只负责收集 File。

- **搜索高亮**：
  - 高亮逻辑做成纯函数：输入 `text + query` 输出带 `<mark>` 的片段或分段结构。
  - UI 层只渲染结果，不做字符串拼接规则。

- **高级过滤（域名/目录/时间）**：
  - store 增加“过滤条件状态”与“派生选择器”（或在页面内用 memo 组合）。
  - 避免把过滤后的列表写回 DB（DB 始终保存“合并后的全量”）。

- **导出增强（按筛选导出）**：
  - export 接口接受 `items: Bookmark[]`（保持纯函数）
  - 页面按当前过滤条件得到 `visibleItems`，将其传入 exporter。

### 6.2 P1（推荐增强）设计要点

- **多格式导出**：
  - `utils/exporters/*`（或在现有 `exporter.ts` 中拆分）
  - JSON/CSV/Markdown 均为纯函数，避免依赖 DOM。

- **备份/恢复**：
  - 备份：导出一个 JSON（包含 bookmarks + settings + schemaVersion）
  - 恢复：导入后覆盖写入（或提供“追加/覆盖”策略）

- **Web Worker**：
  - 将解析/去重/统计/索引构建迁移到 Worker
  - 主线程仅做消息通信与渲染

### 6.3 归档/废弃（从主线移除）

- **Cytoscape 网络图**：保留为“实验性插件”设想，但不进入主线需求。

## 7. 质量与一致性约束

- **单一事实来源**：
  - 业务规则（去重/归一/导出/索引）只存在于 `store + utils`，避免在页面重复实现。
- **文档一致性**：
  - `/docs/PRD.md` 为需求真相；`/docs/DESIGN.md` 为架构真相。
  - 对外介绍（README/FEATURES）应与 PRD 保持一致。
- **变更记录**：
  - 每次对功能/架构/文档的改动，都在 `changelog/` 追加当日记录。

## 8. 已知风险与后续建议

- **配置重复风险**：仓库内同时存在 `vite.config.ts` 与 `vite.config.js`，建议后续统一保留一份作为唯一配置源。
- **AI 直连风险**：浏览器直连第三方 LLM API 可能存在 CORS/密钥暴露面问题，建议以“可选适配器”形式推进，并优先提供可复制的本地报告与 Prompt。


## 9. AI 模块架构

### 9.1 模块结构

```
src/ai/
├── adapters/           # LLM Provider 适配器
│   ├── base.ts         # 基础适配器抽象类
│   ├── openai.ts       # OpenAI 适配器
│   ├── claude.ts       # Claude 适配器
│   ├── custom.ts       # 自定义端点适配器
│   └── index.ts        # 适配器工厂
├── types.ts            # 类型定义
├── constants.ts        # 常量和默认配置
├── configService.ts    # 配置管理服务
├── promptService.ts    # 提示词模板服务
├── cacheService.ts     # 缓存服务
├── usageService.ts     # 用量追踪服务
├── aiService.ts        # 核心 AI 分析服务
└── index.ts            # 模块入口
```

### 9.2 适配器模式

采用适配器模式支持多个 LLM Provider：

```typescript
interface LLMAdapter {
  chat(request: LLMRequest): Promise<LLMResponse>
  validateApiKey(): Promise<boolean>
  estimateCost(tokens: number): number
}
```

- **OpenAIAdapter**：调用 OpenAI Chat Completions API
- **ClaudeAdapter**：调用 Anthropic Messages API
- **CustomAdapter**：调用 OpenAI 兼容的自定义端点

### 9.3 服务层设计

#### ConfigService
- 配置的 CRUD 操作
- API Key 验证
- Provider/Model 管理

#### PromptService
- 模板的 CRUD 操作
- 变量替换 `{{variable}}`
- 默认模板管理

#### CacheService
- 基于内容哈希的缓存
- 过期策略
- 缓存统计和清理

#### UsageService
- Token 使用记录
- 成本估算
- 限额检查和警告

#### AIService
- 书签分类
- 摘要生成
- 重复分析
- 健康检查
- 自然语言搜索
- 集合报告

### 9.4 数据流

```
用户操作 → useAIStore → AIService → CacheService（检查缓存）
                                   ↓
                            PromptService（渲染模板）
                                   ↓
                            LLMAdapter（调用 API）
                                   ↓
                            UsageService（记录用量）
                                   ↓
                            CacheService（存储结果）
                                   ↓
                            返回结果 → UI 更新
```

### 9.5 错误处理

- **重试机制**：可重试错误自动重试（指数退避）
- **限流处理**：429 错误时等待 retry-after
- **Fallback**：API 失败时返回默认值
- **用量限制**：超限时阻止请求

### 9.6 测试策略

- **属性测试**：使用 fast-check 进行属性测试
- **测试覆盖**：80 个测试用例，100% 通过
- **Mock**：使用 vitest mock 模拟 API 调用
