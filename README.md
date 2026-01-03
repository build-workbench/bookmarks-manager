 # Bookmarks Analysis (Local-first PWA)

> 本地解析、多文件合并、零上传，可视化你的浏览器书签资产。

Bookmarks Analysis 是一个以隐私为前提的开源工具，用于快速合并来自不同浏览器的书签 HTML 文件、去除重复项、输出结构化洞察，并为引入本地/自带模型（BYOK）的智能分析预留扩展位。项目采用 PWA 形态，安装即用，可离线运行。

## 文档

详见 [docs/README.md](docs/README.md)

## 核心特性

- **本地优先 & 零云端依赖**：所有解析、合并与可视化均在浏览器内完成，保障数据隐私。
- **多源书签合并**：支持同时导入多个 Netscape Bookmark HTML 文件，统一目录别名后进行合并。
- **智能去重**：URL 规范化（scheme、host、端口、路径、参数排序、追踪参数剔除），避免重复条目。
- **持久化存储**：使用 IndexedDB 自动保存合并结果，刷新页面后数据不丢失。
- **全文搜索 + 高级过滤**：基于 MiniSearch 的快速搜索，命中词高亮；支持按域名/目录/时间范围组合过滤。
- **导出增强**：支持导出全量/当前筛选结果；可保留目录结构或平铺导出（不保留目录）。
- **可视化洞察**：仪表盘展示重复占比、Top 域名、按年份新增等指标。
- **AI 智能分析**：支持 OpenAI、Claude、自定义端点（BYOK），提供书签分类、摘要生成、重复分析、健康检查、自然语言搜索、集合报告等功能。

## 技术栈

- React 18 + TypeScript + Vite
- Tailwind CSS + Lucide Icons
- Zustand（全局状态） + Dexie（IndexedDB 持久化）
- MiniSearch（全文搜索）+ ECharts（数据可视化）
- Vite PWA 插件（离线支持）

## 快速开始

建议使用 Node.js 18+。

```bash
npm install
npm run dev
```
默认访问地址：http://localhost:5173/

更完整的上手步骤（含浏览器导出书签、合并去重、搜索与导出）见 [QUICKSTART.md](QUICKSTART.md)。

### 构建与预览

```bash
npm run build
npm run preview
```

> 如依赖尚未安装，IDE 可能出现 TypeScript 类型或模块缺失报错，安装完成后即可恢复。

## 典型使用流程

详见 [QUICKSTART.md](QUICKSTART.md)。

## 目录结构

```
├─ src/
│  ├─ ai/                     # AI 模块
│  │  ├─ adapters/            # LLM Provider 适配器
│  │  │  ├─ base.ts           # 基础适配器类
│  │  │  ├─ openai.ts         # OpenAI 适配器
│  │  │  ├─ claude.ts         # Claude 适配器
│  │  │  └─ custom.ts         # 自定义端点适配器
│  │  ├─ types.ts             # AI 类型定义
│  │  ├─ constants.ts         # 常量和默认配置
│  │  ├─ configService.ts     # 配置管理服务
│  │  ├─ promptService.ts     # 提示词模板服务
│  │  ├─ cacheService.ts      # 缓存服务
│  │  ├─ usageService.ts      # 用量追踪服务
│  │  ├─ aiService.ts         # 核心 AI 分析服务
│  │  └─ index.ts             # 模块入口
│  ├─ pages/
│  │  ├─ UploadMerge.tsx      # 导入/合并/导出页面
│  │  ├─ Dashboard.tsx        # 仪表盘 + 书签列表
│  │  ├─ Search.tsx           # 全文搜索页面
│  │  ├─ Duplicates.tsx       # 去重工作台
│  │  └─ AI.tsx               # AI 智能分析页面
│  ├─ store/
│  │  ├─ useBookmarksStore.ts # 书签状态管理
│  │  └─ useAIStore.ts        # AI 状态管理
│  ├─ utils/
│  │  ├─ bookmarkParser.ts    # Netscape Bookmark 解析
│  │  ├─ folders.ts           # 目录归一与树构建
│  │  ├─ url.ts               # URL 规范化与指纹
│  │  ├─ exporter.ts          # 层级 Netscape 导出
│  │  ├─ db.ts                # Dexie IndexedDB 封装
│  │  └─ search.ts            # MiniSearch 索引与搜索
│  ├─ ui/Chart.tsx            # ECharts 包装组件
│  ├─ App.tsx / main.tsx      # 路由与应用入口
│  └─ index.css               # Tailwind 样式入口
├─ vite.config.ts             # Vite + PWA 配置
├─ tailwind.config.js         # Tailwind 配置
├─ CHANGELOG.md               # 版本更新日志
└─ README.md
```

## 架构与隐私理念

- **Local-first**：默认不依赖任何云端服务，所有数据仅在用户浏览器中处理。
- **IndexedDB 存储**：使用 Dexie 管理本地数据库，支持离线访问和数据持久化。
- **目录归一**：内置常见浏览器的根目录别名映射，实现"同目录合并"。
- **BYOK（Bring Your Own Key）**：AI 功能采用自带密钥模式，支持 OpenAI、Claude 和自定义端点，API Key 安全存储在本地 IndexedDB。
- **AI 分析缓存**：分析结果本地缓存，避免重复调用 API，节省成本。
- **用量追踪**：本地追踪 Token 使用量和成本估算，支持设置限额。

## 可用脚本

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | 启动开发服务器（支持 PWA 调试） |
| `npm run build` | 生成生产构建产物到 `dist/` |
| `npm run typecheck` | 运行 TypeScript 类型检查 |
| `npm run preview` | 本地预览构建结果 |
| `npm run lint` | 运行 ESLint 代码检查 |

## 最新更新

### v0.3.0 - AI 智能分析 (2024-12-31)

- ✅ **AI 书签分类**：智能分析书签内容，推荐分类和标签
- ✅ **AI 摘要生成**：为书签生成简洁摘要和关键词
- ✅ **AI 重复分析**：智能分析重复书签组，推荐保留项
- ✅ **AI 健康检查**：识别问题书签（无效链接、过时内容等）
- ✅ **自然语言搜索**：用自然语言描述查找书签
- ✅ **集合报告**：生成书签集合分析报告，支持 Markdown/HTML 导出
- ✅ **多 Provider 支持**：OpenAI、Claude、自定义端点（BYOK）
- ✅ **用量追踪**：Token 使用量统计、成本估算、限额控制
- ✅ **提示词模板**：可自定义 AI 提示词模板
- ✅ **结果缓存**：分析结果本地缓存，避免重复调用

### v0.2.0 - 核心功能完善 (2024-10-27)

- ✅ **Dexie 持久化**：自动保存合并结果到 IndexedDB，页面刷新后数据不丢失
- ✅ **本地搜索**：基于 MiniSearch 的全文搜索，支持标题、URL、路径模糊查询
- ✅ **去重工作台**：可视化展示重复书签簇，标注保留/重复项
- ✅ **增强仪表盘**：新增书签列表视图，支持展开/折叠和分页加载
- ✅ **改进 UI/UX**：拖拽上传、加载状态、成功/错误提示、图标美化
- ✅ **API Key 管理**：使用 IndexedDB 安全存储 AI API Key

详见 [CHANGELOG.md](CHANGELOG.md)

## Roadmap

- **P0**：已完成（拖拽导入、搜索高亮、高级过滤、导出增强、更细的加载状态）
- **P1/P2**：详见 [docs/PRD.md](docs/PRD.md)

## 贡献指南

1. Fork 仓库并创建功能分支：`git checkout -b feat/awesome-feature`
2. 安装依赖并确保 `npm run build` 通过
3. 更新相关文档或注释，保持代码风格统一
4. 提交 Pull Request，说明变更内容与测试情况

欢迎通过 Issue 反馈 Bug、需求或使用体验。

## 📄 License

本项目采用 [MIT License](LICENSE)。

---

如果这个项目对你有帮助，欢迎 Star ⭐️ 与分享，也期待你的反馈与贡献。
