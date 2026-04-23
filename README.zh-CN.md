# Bookmarks Manager

**本地优先的浏览器书签整理工具。** 导入浏览器导出的书签文件，在本地完成合并、去重、搜索、分析和导出。

[在线演示](https://lessup.github.io/bookmarks-manager/) · [English](README.md) · [架构说明](docs/ARCHITECTURE.zh-CN.md) · [贡献说明](docs/CONTRIBUTING.zh-CN.md)

## 这个项目解决什么问题

很多书签工具不是把数据推到云端，就是只做最基础的导入导出。Bookmarks Manager 选择的是另一条路线：

- **本地优先**：书签文件只在浏览器内处理
- **隐私优先**：没有后端、没有账号体系、没有强制上传
- **实用整理**：导入、合并、去重、搜索、分析、导出一条龙
- **可安装使用**：基于 GitHub Pages 发布，可作为 PWA 安装

## 核心流程

| 步骤 | 你做什么                                                 | 应用会做什么                         |
| ---- | -------------------------------------------------------- | ------------------------------------ |
| 导入 | 从 Chrome、Firefox、Edge、Safari、Brave 等浏览器导出书签 | 在本地解析 Netscape Bookmark HTML    |
| 合并 | 一次加载一个或多个文件                                   | 规范化目录与 URL，识别重复项         |
| 整理 | 搜索、查看重复、运行清理或 AI 工具、备份                 | 把数据保存在 IndexedDB，方便下次继续 |
| 导出 | 下载整理后的结果                                         | 支持导出 HTML、JSON、CSV、Markdown   |

## 功能概览

| 模块     | 已包含能力                                       |
| -------- | ------------------------------------------------ |
| 书签清理 | 多文件导入、URL 规范化、重复分组、合并统计       |
| 搜索     | 全文搜索、高亮、组合过滤、按筛选结果导出         |
| 洞察     | 域名和年份图表、重复概览、清理工作流             |
| AI       | 自备 Key 的模型配置、分类、摘要、健康分析、报告  |
| 稳定性   | IndexedDB 持久化、备份恢复、大数据量 Worker 支持 |

## 本地运行

```bash
git clone https://github.com/LessUp/bookmarks-manager.git
cd bookmarks-manager
npm install
npm run dev
```

本地验证命令：

```bash
npm run validate
npm run build
```

## 当前维护的文档

| 文件                         | 用途                   |
| ---------------------------- | ---------------------- |
| `docs/ARCHITECTURE.zh-CN.md` | 精简且准确的架构说明   |
| `docs/CONTRIBUTING.zh-CN.md` | 当前仓库的真实开发流程 |
| `CHANGELOG.zh-CN.md`         | 精简后的版本记录       |
| `openspec/`                  | 变更提案、规格与归档   |
| `AGENTS.md` / `CLAUDE.md`    | AI 助手仓库指令        |

## License

MIT
