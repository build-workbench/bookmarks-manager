# 更新日志 (Changelog)

本项目的所有重要变更都将记录在此文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，
版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [1.1.0] - 2026-04-15

### 新增
- **多格式导出** (P1-1)
  - 支持 JSON、CSV、Markdown 三种新导出格式
  - 统一导出器模块 `src/utils/exporters/index.ts`
  - HTML 导出支持目录结构保留/平铺两种模式
  - JSON 导出支持包含/不包含元数据选项
  - CSV 导出支持字段转义（逗号、引号、换行）
  - Markdown 导出自动生成目录层级标题
- **备份与恢复** (P1-2)
  - 新增备份页面 `src/pages/Backup.tsx`
  - 支持书签数据、AI 配置、用量记录、提示词模板、清理工作流状态的备份
  - 可选择备份内容（减少文件大小）
  - 备份文件大小估算
  - 恢复前预览统计数据
- **Web Worker 优化**
  - 新增 `src/workers/bookmarkWorker.ts` 和 `src/workers/bookmarkWorkerClient.ts`
  - 书签数量 > 500 时自动启用 Worker 处理
  - Worker 失败时自动回退到主线程
- **虚拟滚动组件**
  - 新增 `src/ui/VirtualList.tsx`
  - 搜索结果 > 200 条时自动启用
  - 1000 条书签 DOM 节点从 1000+ 减少到约 15 个

### 变更
- **ECharts 按需加载优化**
  - 仅导入需要的模块（PieChart、BarChart、LineChart）
  - 包体积从 1,042 KB 减少到 534 KB（优化 48.7%）
- **搜索性能优化**
  - 添加 200ms 防抖（debounce）
  - 添加清理函数避免内存泄漏
- **文件导入错误提示增强**
  - 优化文件类型检查逻辑（同时检查扩展名和 MIME 类型）
  - 显示具体不支持的文件名

## [1.0.0] - 2026-03-22

### 新增
- GitHub Pages 工作流 (`.github/workflows/pages.yml`)
- `VITE_BASE_PATH` 环境变量支持，适配仓库名子路径部署
- HashRouter 路由模式，避免 GitHub Pages 刷新 404
- README 中添加 CI/Deploy 状态徽章
- GitHub 社区健康文件：CODE_OF_CONDUCT.md、SECURITY.md、PULL_REQUEST_TEMPLATE.md、Issue 模板

### 变更
- 静态入口资源 (`index.html`) 改为相对路径，兼容子路径部署
- `.gitignore` 添加 `.windsurf/` 忽略规则
- README 全面重构：用户友好的结构、在线试用按钮、浏览器导出说明、隐私安全说明

### 修复
- GitHub Pages 部署后刷新页面 404 问题

## [0.3.2] - 2026-03-10

### 新增
- Pages workflow 路径触发过滤，减少无效构建
- `main` 分支触发 Pages 部署

### 变更
- Pages workflow 重命名：`deploy.yml` → `pages.yml`
- CI workflow 统一 `permissions: contents: read` 与 `concurrency` 配置
- Pages workflow 补充 `actions/configure-pages@v5` 步骤（后移除）
- Pages workflow 扩展路径触发过滤：新增 `types/**`、`index.html`、`favicon.svg`、配置文件等

## [0.3.1] - 2026-02-13

### 新增
- `.gitignore` 新增 IDE (`.vscode`/`.idea`)、OS (`Thumbs.db`/`desktop.ini`)、构建产物 (`*.tsbuildinfo`)、coverage、日志等忽略规则
- npm scripts：`clean`、`validate`
- `vite.config.ts` 新增 `@/` 路径别名、PWA icons、Workbox 运行时缓存、构建分包 (manualChunks)
- ESLint 配置：升级 `es2022`，新增 `consistent-type-imports`/`no-console`/`eqeqeq` 等规则
- Prettier 配置：补充 `arrowParens`/`endOfLine`/`bracketSpacing` 等
- `.editorconfig`：新增 YAML/JSON/Makefile 专属规则
- `.prettierignore`：同步忽略 `dev-dist`/`coverage`/`*.tsbuildinfo` 等

### 变更
- 版本升级至 `1.0.0`，补充 `description`/`author`/`license`/`engines` 元信息
- `build` 脚本增加 `tsc -b` 类型检查
- 全部 `src/` 下的相对路径 import 迁移为 `@/` 别名形式
- 取消 git 跟踪 `tsconfig.node.tsbuildinfo` 和 `vite.config.js`（构建产物）

## [0.3.0] - 2025-01-15

### 新增
- **AI 模块** (`src/ai/`)
  - LLM Provider 适配器：OpenAI、Claude、自定义端点（Ollama、LocalAI、vLLM 等）
  - 配置管理服务 (`configService.ts`)：API Key 安全存储、Provider/Model 管理、连接测试
  - 提示词模板服务 (`promptService.ts`)：6 个默认模板，支持自定义编辑和变量替换
  - 缓存服务 (`cacheService.ts`)：基于内容哈希的缓存，可配置过期时间
  - 用量追踪服务 (`usageService.ts`)：Token 使用记录、成本估算、限额检查
  - AI 分析服务 (`aiService.ts`)：书签分类、摘要生成、重复分析、健康检查、自然语言搜索、集合报告
- **状态管理**：`useAIStore` 集成所有 AI 服务，统一状态管理，进度追踪
- **UI 组件**：AI 页面 (`src/pages/AI.tsx`) 含配置、分类、摘要、健康检查、搜索、报告、用量统计 7 个 Tab
- **数据库扩展**：新增 IndexedDB 表 (`aiConfig`、`aiCache`、`aiUsage`、`aiPrompts`、`aiUsageLimits`)

### 变更
- 文档更新：README.md、FEATURES.md、docs/DESIGN.md、docs/PRD.md 添加 AI 功能说明

## [0.2.1] - 2025-12-18

### 新增
- **文档体系补齐** (`/docs`)
  - `docs/README.md` 作为文档入口
  - `docs/PRD.md`：Roadmap 范围裁剪 (P0/P1/P2/归档) 与验收标准
  - `docs/DESIGN.md`：分层架构、数据流、模块边界与后续设计要点
- **导入体验增强**
  - 支持拖拽导入书签 HTML 文件（含拖拽态视觉反馈）
  - 新增"已导入文件"列表（按来源文件聚合统计）
  - 支持移除单个来源文件
  - 更细的导入/合并阶段加载状态提示
- **搜索体验升级**
  - 搜索结果命中词高亮（标题/URL/路径）
  - 高级过滤：按域名/一级目录/目录关键字/时间范围过滤
  - 导出选项：支持导出"当前筛选结果/全量"
  - 导出选项：支持"保留目录结构/平铺导出"
  - 结果列表支持分页加载（默认 50 条，逐步加载更多）

### 变更
- README：精简"快速开始/典型流程"，统一指向 QUICKSTART
- FEATURES / QUICKSTART：补齐搜索页高级过滤与导出增强描述
- 路由页改为 `React.lazy` + `Suspense` 按需加载
- `Chart` 组件对 `echarts` 采用动态 `import()`，图表依赖按需加载

## [0.2.0] - 2025-12-14

### 新增
- `SearchResultItem` 类型，`search()` 返回强类型结果
- `resetSearchIndex()` 用于清空/重建数据后避免旧索引残留
- `clearBookmarks()` 清空 IndexedDB 中 `bookmarks` 表
- ESLint 配置 (`.eslintrc.cjs`)、Prettier 配置 (`prettier.config.cjs` + `.prettierignore`)
- `.editorconfig` 统一缩进/换行等编辑器行为
- GitHub Actions CI (`.github/workflows/ci.yml`)
- `types/vite-pwa-assets-generator-api.d.ts` 最小类型声明

### 变更
- `importFiles()` 使用 `try/finally` 保证 `importing` 状态正确恢复
- 去重逻辑修正：缺失 `addDate/lastModified` 的书签不再错误地被优先保留
- `loadFromDB()` 恢复数据时同步初始化 `rawItems`
- `clear()` 升级为异步：清空内存状态、重置搜索索引、清理 IndexedDB
- 上传页导出按钮逻辑优化：导入新文件后触发 `needsMerge` 提示
- ECharts 组件生命周期优化：避免每次渲染重复 `init()`
- 将 `typescript` 版本钉到 `5.5.4`
- `tsconfig.json` / `tsconfig.node.json` 将 `types/` 纳入编译范围

### 修复
- 去重页类型修复：显式标注 `Object.entries(duplicates)` 类型
- ESLint 规则适配：关闭 `react/no-unescaped-entities` 与 `@typescript-eslint/no-explicit-any`
- 少量风格修复：`bookmarkParser.ts` 的 `prefer-const`、store 中 `_normalized` 解构

## [0.1.0] - 2024-12-01

### 新增
- 初始版本发布
- 书签导入（Netscape HTML 格式）
- 多文件合并
- URL 标准化去重（处理 http/https、尾斜杠、跟踪参数）
- 全文搜索 (minisearch)
- 数据可视化 (ECharts)
- IndexedDB 持久化存储
- PWA 支持（离线可用）
- 响应式 UI (Tailwind CSS)

---

[1.1.0]: https://github.com/LessUp/bookmarks-manager/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/LessUp/bookmarks-manager/compare/v0.3.2...v1.0.0
[0.3.2]: https://github.com/LessUp/bookmarks-manager/compare/v0.3.1...v0.3.2
[0.3.1]: https://github.com/LessUp/bookmarks-manager/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.com/LessUp/bookmarks-manager/compare/v0.2.1...v0.3.0
[0.2.1]: https://github.com/LessUp/bookmarks-manager/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/LessUp/bookmarks-manager/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/LessUp/bookmarks-manager/releases/tag/v0.1.0
