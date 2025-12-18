 # Bookmarks Analysis (Local-first PWA)

> 本地解析、多文件合并、零上传，可视化你的浏览器书签资产。

Bookmarks Analysis 是一个以隐私为前提的开源工具，用于快速合并来自不同浏览器的书签 HTML 文件、去除重复项、输出结构化洞察，并为引入本地/自带模型（BYOK）的智能分析预留扩展位。项目采用 PWA 形态，安装即用，可离线运行。

## 📚 文档

详见 [docs/README.md](docs/README.md)

## ✨ 核心特性

- **本地优先 & 零云端依赖**：所有解析、合并与可视化均在浏览器内完成，保障数据隐私。
- **多源书签合并**：支持同时导入多个 Netscape Bookmark HTML 文件，统一目录别名后进行合并。
- **智能去重**：URL 规范化（scheme、host、端口、路径、参数排序、追踪参数剔除），避免重复条目。
- **持久化存储**：使用 IndexedDB 自动保存合并结果，刷新页面后数据不丢失。
- **全文搜索**：基于 MiniSearch 的快速搜索，支持模糊匹配和多字段查询。
- **层级导出**：生成带目录结构的 Netscape HTML，可导回任意浏览器。
- **可视化洞察**：仪表盘展示重复占比、Top 域名、按年份新增等指标。
- **AI（可选）**：本地报告模板 + 可复制 Prompt；后续可接入适配器式 LLM API（BYOK）。

## 🧱 技术栈

- React 18 + TypeScript + Vite
- Tailwind CSS + Lucide Icons
- Zustand（全局状态） + Dexie（IndexedDB 持久化）
- MiniSearch（全文搜索）+ ECharts（数据可视化）
- Vite PWA 插件（离线支持）

## 🚀 快速开始

### 环境准备
建议使用 Node.js 18+。以 macOS 为例：

- Homebrew：
  ```bash
  brew install node
  ```
- nvm：
  ```bash
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
  # 重新打开终端后
  nvm install --lts
  nvm use --lts
  ```

### 安装依赖与启动
```bash
npm install
npm run dev
```
默认访问地址：http://localhost:5173/

### 构建与预览
```bash
npm run build
npm run preview
```

> 如依赖尚未安装，IDE 可能出现 TypeScript 类型或模块缺失报错，安装完成后即可恢复。

## 🧭 典型使用流程

1. **上传合并**：进入"上传合并"页面，选择一个或多个导出的书签 HTML 文件（Chrome/Firefox/Edge/Safari 等）
2. **合并去重**：点击"合并去重"，自动进行 URL 规范化和去重，数据会自动保存到本地数据库
3. **查看统计**：前往"仪表盘"，查看重复占比、域名分布、按年份新增等可视化结果，可展开书签列表查看详情
4. **搜索查找**：使用"搜索"页面快速查找特定书签，支持模糊匹配和多字段搜索
5. **管理重复**：在"去重"页面查看所有重复书签簇，了解哪些被保留、哪些被标记为重复
6. **导出数据**：回到"上传合并"页面，点击"导出 HTML"获取带目录层级的 Netscape Bookmark 文件
7. **AI 分析**（可选）：配置 API Key 后，可以运行智能分析（功能开发中）

## 📁 目录结构

```
├─ src/
│  ├─ pages/
│  │  ├─ UploadMerge.tsx      # 导入/合并/导出页面
│  │  ├─ Dashboard.tsx        # 仪表盘 + 书签列表
│  │  ├─ Search.tsx           # 全文搜索页面
│  │  ├─ Duplicates.tsx       # 去重工作台
│  │  └─ AI.tsx               # AI 扩展占位
│  ├─ store/
│  │  └─ useBookmarksStore.ts # Zustand store 与统计逻辑
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

## 🔐 架构与隐私理念

- **Local-first**：默认不依赖任何云端服务，所有数据仅在用户浏览器中处理。
- **IndexedDB 存储**：使用 Dexie 管理本地数据库，支持离线访问和数据持久化。
- **目录归一**：内置常见浏览器的根目录别名映射，实现"同目录合并"。
- **可扩展后端（规划中）**：可选启用链接健康检查、元数据抓取、嵌入与向量检索等增强能力。
- **BYOK**：AI 功能将采用自带密钥/自托管模型，避免泄露用户数据。

## 🛠️ 可用脚本

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | 启动开发服务器（支持 PWA 调试） |
| `npm run build` | 生成生产构建产物到 `dist/` |
| `npm run typecheck` | 运行 TypeScript 类型检查 |
| `npm run preview` | 本地预览构建结果 |
| `npm run lint` | 运行 ESLint 代码检查 |

## ✅ 最新更新

### v0.2.0 - 核心功能完善 (2024-10-27)

- ✅ **Dexie 持久化**：自动保存合并结果到 IndexedDB，页面刷新后数据不丢失
- ✅ **本地搜索**：基于 MiniSearch 的全文搜索，支持标题、URL、路径模糊查询
- ✅ **去重工作台**：可视化展示重复书签簇，标注保留/重复项
- ✅ **增强仪表盘**：新增书签列表视图，支持展开/折叠和分页加载
- ✅ **改进 UI/UX**：拖拽上传、加载状态、成功/错误提示、图标美化
- ✅ **API Key 管理**：使用 IndexedDB 安全存储 AI API Key

详见 [CHANGELOG.md](CHANGELOG.md)

## 🗺️ Roadmap

- [ ] P0：导入体验补齐（拖拽导入 + 文件列表管理 + 更清晰的加载状态）
- [ ] P0：搜索体验升级（结果高亮 + 键盘交互与信息密度优化）
- [ ] P0：高级过滤（域名/目录/时间范围组合过滤）
- [ ] P0：导出增强（按筛选结果导出 + 导出选项）
- [ ] P1：多格式导出（JSON / CSV / Markdown）
- [ ] P1：备份与恢复（导出/导入本地数据）
- [ ] P1：Web Worker（大数据量性能优化）
- [ ] P2：AI（可选，本地报告模板 + 可复制 Prompt；后续适配器式直连）
- [ ] P2：标签系统 / 批量编辑（后置）

## 🤝 贡献指南

1. Fork 仓库并创建功能分支：`git checkout -b feat/awesome-feature`
2. 安装依赖并确保 `npm run build` 通过
3. 更新相关文档或注释，保持代码风格统一
4. 提交 Pull Request，说明变更内容与测试情况

欢迎通过 Issue 反馈 Bug、需求或使用体验。

## 📄 License

本项目采用 [MIT License](LICENSE)。

---

如果这个项目对你有帮助，欢迎 Star ⭐️ 与分享，也期待你的反馈与贡献。
