# 书签管理器 Bookmarks Manager

<p align="center">
  <b>私密、本地化的浏览器书签合并与智能分析工具</b>
</p>

<p align="center">
  <a href="https://lessup.github.io/bookmarks-manager/">
    <img src="https://img.shields.io/badge/🚀_立即在线使用-2ea44f?style=for-the-badge&logoColor=white" alt="立即使用">
  </a>
</p>

<p align="center">
  <a href="https://github.com/LessUp/bookmarks-manager/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/LessUp/bookmarks-manager/ci.yml?label=CI" alt="CI"></a>
  <a href="https://github.com/LessUp/bookmarks-manager/actions/workflows/pages.yml"><img src="https://img.shields.io/github/actions/workflow/status/LessUp/bookmarks-manager/pages.yml?label=Deploy" alt="Deploy"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License: MIT"></a>
</p>

<p align="center">
  <a href="README.md">English</a> | 简体中文
</p>

---

## 🎯 这是什么？

一个**隐私优先、纯浏览器端**的书签管理工具，帮助你：

- 📥 **导入** 多个浏览器的书签（Chrome、Firefox、Edge、Safari）
- 🔗 **合并** 成一个统一的收藏夹
- 🧹 **智能去重** —— 精准识别重复书签
- 🔍 **全文搜索** —— 毫秒级检索
- 📊 **可视化分析** —— 深入了解你的收藏习惯
- 🤖 **AI 智能分析** —— 分类、摘要、报告（需自备 API Key）

**所有处理都在你的浏览器中完成，数据不会上传任何服务器。**

---

## 🚀 快速开始

### 方式一：在线使用（推荐）

👉 **[点击这里打开应用](https://lessup.github.io/bookmarks-manager/)**

无需安装，首次加载后支持离线使用（PWA）。

### 方式二：安装为桌面应用

打开在线版后，按以下步骤安装：

| 浏览器 | 操作步骤 |
|---------|-------------|
| Chrome/Edge | 点击地址栏 `⋮` → "安装书签管理器" |
| Safari | 分享按钮 → "添加到主屏幕" |
| Firefox | 当前 PWA 支持有限 |

### 方式三：本地运行

```bash
git clone https://github.com/LessUp/bookmarks-manager.git
cd bookmarks-manager
npm install
npm run dev
# 打开 http://localhost:5173
```

---

## 📖 使用指南

### 第一步：导出浏览器书签

**Chrome / Edge / Brave：**
1. 按 `Ctrl+Shift+O`（Windows）或 `Cmd+Shift+O`（Mac）打开书签管理器
2. 点击右上角 `⋮` 菜单 → "导出书签"
3. 保存 HTML 文件

**Firefox：**
1. 按 `Ctrl+Shift+B`（Windows）或 `Cmd+Shift+B`（Mac）打开书签库
2. 点击"导入和备份" → "导出书签到 HTML"

**Safari：**
1. 菜单栏选择"文件" → "导出书签"

### 第二步：导入合并

1. 打开 [在线应用](https://lessup.github.io/bookmarks-manager/)
2. 拖拽书签文件到上传区域（支持多个文件同时导入）
3. 点击"合并去重"按钮
4. 等待处理完成 ✨

### 第三步：管理你的书签

- **仪表盘** —— 查看统计数据、图表和收藏趋势
- **搜索** —— 使用全文搜索快速找到书签
- **去重** —— 查看哪些书签被识别为重复项
- **导出** —— 将清理后的书签导回浏览器

---

## ✨ 核心功能

| 功能 | 说明 |
|---------|-------------|
| 🔒 **完全私密** | 纯浏览器端运行，无服务器、无上传、无追踪 |
| 🔗 **智能去重** | URL 规范化算法精准去重（统一 http/https、去除追踪参数等） |
| 📥 **多浏览器支持** | 一次导入 Chrome、Firefox、Edge、Safari 的书签 |
| 🔍 **全文搜索** | 支持标题、URL、文件夹名的模糊搜索，结果高亮 |
| 📊 **可视化洞察** | 图表展示域名分布、年度趋势、重复占比等 |
| 💾 **数据持久化** | 自动保存到浏览器存储，刷新页面数据不丢失 |
| 🤖 **AI 分析** | 可选 AI 功能（自带 API Key）：分类、摘要、健康检查、自然语言搜索 |
| 📱 **PWA 支持** | 可安装为桌面/手机应用，离线可用 |

---

## 🔒 隐私与安全

你的书签数据非常私密，我们高度重视隐私保护：

- ✅ **零云端依赖** —— 没有后端服务器，没有数据库
- ✅ **本地处理** —— 所有解析、合并、分析都在浏览器中完成
- ✅ **零上传** —— 书签数据永远不会离开你的设备
- ✅ **安全存储** —— 数据存储在浏览器的 IndexedDB 中（完全由你控制）
- ✅ **开源透明** —— 代码完全公开，可自行验证

**AI 功能（可选）：**
- 使用你自己的 API Key（BYOK — Bring Your Own Key）
- API Key 仅存储在本地浏览器
- 可以完全离线使用，不使用 AI 功能

---

## 📸 界面预览

### 仪表盘
![仪表盘预览](screenshots/dashboard.svg)
*可视化分析展示书签分布、年度趋势和重复统计。*

### 搜索与去重
![搜索预览](screenshots/search.svg)
*毫秒级全文搜索，支持标题、URL 和文件夹搜索，智能识别重复书签。*

### AI 智能分析
![AI 预览](screenshots/ai-analysis.svg)
*AI 驱动的分类、链接健康检查和自然语言书签搜索。*

> 💡 **想要体验？** [点击试用在线版](https://lessup.github.io/bookmarks-manager/)

---

## 🛠️ 开发者相关

想参与贡献或自行部署？请查看：

- [CHANGELOG.md](CHANGELOG.md) —— 版本更新日志
- [QUICKSTART.md](QUICKSTART.md) —— 详细开发环境搭建
- [FEATURES.md](FEATURES.md) —— 完整功能文档
- [docs/](docs/) —— 架构设计文档

```bash
# 开发模式
npm install
npm run dev

# 构建
npm run build

# 测试
npm run test
```

**技术栈：** React 18 + TypeScript + Vite + Tailwind CSS + Dexie (IndexedDB) + ECharts

---

## 📄 开源协议

[MIT License](LICENSE) —— 个人和商业使用均可免费。

---

<p align="center">
  <sub>用 ❤️ 为书签收藏爱好者打造</sub>
</p>
