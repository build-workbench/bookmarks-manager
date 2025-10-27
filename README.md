 # Bookmarks Analysis (Local-first PWA)

> 本地解析、多文件合并、零上传，可视化你的浏览器书签资产。

Bookmarks Analysis 是一个以隐私为前提的开源工具，用于快速合并来自不同浏览器的书签 HTML 文件、去除重复项、输出结构化洞察，并为引入本地/自带模型（BYOK）的智能分析预留扩展位。项目采用 PWA 形态，安装即用，可离线运行。

## ✨ 核心特性

- **本地优先 & 零云端依赖**：所有解析、合并与可视化均在浏览器内完成，保障数据隐私。
- **多源书签合并**：支持同时导入多个 Netscape Bookmark HTML 文件，统一目录别名后进行合并。
- **智能去重**：URL 规范化（scheme、host、端口、路径、参数排序、追踪参数剔除），避免重复条目。
- **层级导出**：生成带目录结构的 Netscape HTML，可导回任意浏览器。
- **可视化洞察**：仪表盘展示重复占比、Top 域名、按年份新增等指标。
- **AI 扩展预留**：提供 BYOK API Key 占位页，后续可接入 LLM 输出主题摘要与整理建议。

## 🧱 技术栈

- React 18 + TypeScript + Vite
- Tailwind CSS + 自定义组件
- Zustand（全局状态，后续可接 Dexie 持久化）
- ECharts（仪表盘）、规划接入 Cytoscape.js（结构图）
- Vite PWA 插件（vite-plugin-pwa）

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

1. 进入“上传合并”页面，选择一个或多个导出的书签 HTML 文件（Chrome/Firefox/Edge/Safari 等）
2. 点击“合并去重”，查看原始条目数、合并后数量以及重复统计
3. 如需导出，点击“导出 HTML”，获取带目录层级的 Netscape Bookmark 文件
4. 前往“仪表盘”，查看重复占比、域名分布、按年份新增等可视化结果

## 📁 目录结构

```
├─ public/                    # 静态资源（可选）
├─ src/
│  ├─ pages/
│  │  ├─ UploadMerge.tsx      # 导入/合并/导出页面
│  │  ├─ Dashboard.tsx        # 仪表盘
│  │  └─ AI.tsx               # AI 扩展占位
│  ├─ store/
│  │  └─ useBookmarksStore.ts # Zustand store 与统计逻辑
│  ├─ utils/
│  │  ├─ bookmarkParser.ts    # Netscape Bookmark 解析
│  │  ├─ folders.ts           # 目录归一与树构建
│  │  ├─ url.ts               # URL 规范化与指纹
│  │  └─ exporter.ts          # 层级 Netscape 导出
│  ├─ ui/Chart.tsx            # ECharts 包装组件
│  ├─ App.tsx / main.tsx      # 路由与应用入口
│  └─ index.css               # Tailwind 样式入口
├─ vite.config.ts             # Vite + PWA 配置
├─ tailwind.config.js         # Tailwind 配置
└─ README.md
```

## 🔐 架构与隐私理念

- **Local-first**：默认不依赖任何云端服务，所有数据仅在用户浏览器中处理。
- **目录归一**：内置常见浏览器的根目录别名映射，实现“同目录合并”。
- **可扩展后端（规划中）**：可选启用链接健康检查、元数据抓取、嵌入与向量检索等增强能力。
- **BYOK**：AI 功能将采用自带密钥/自托管模型，避免泄露用户数据。

## 🛠️ 可用脚本

| 命令 | 说明 |
| --- | --- |
| `npm run dev` | 启动开发服务器（支持 PWA 调试） |
| `npm run build` | 生成生产构建产物到 `dist/` |
| `npm run preview` | 本地预览构建结果 |
| `npm run lint` | 预留脚本（当前输出占位） |

## 🗺️ Roadmap

- 去重工作台：重复簇识别、批量处理（保留/移动/删除标记）
- 本地搜索：MiniSearch 驱动的全文搜索与高亮
- Web Worker：解析与统计异步化，支撑大体量书签
- Dexie 持久化：保存合并结果、用户设置、AI Key
- AI 智能分析：主题聚类、阅读清单、自然语言查询与整理建议

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
