# Bookmarks Manager

> 纯前端、本地优先的书签合并与智能整理工具。无需注册、没有后端，数据不出浏览器。

[🌐 在线使用](https://build-workbench.github.io/bookmarks-manager/) · [GitHub 仓库](https://github.com/build-workbench/bookmarks-manager) · [报告问题](https://github.com/build-workbench/bookmarks-manager/issues)

## 功能截图

| 落地页 | 统计仪表盘 |
| --- | --- |
| ![落地页](public/screenshots/landing.png) | ![统计仪表盘](public/screenshots/dashboard.png) |

| 全文搜索 | 重复检测 |
| --- | --- |
| ![全文搜索](public/screenshots/search.png) | ![重复检测](public/screenshots/duplicates.png) |

---

## 📖 如何使用

只需三步，即可完成多设备、多浏览器书签的汇总与清理：

### 1. 导出书签

从浏览器中导出书签为 HTML 文件（标准 Netscape Bookmark 格式）：

- **Chrome / Edge**：打开书签管理器（快捷键 `Ctrl + Shift + O` / `Cmd + Option + B`）→ 点击右上角 `···` → 选择 **「导出书签」**
- **Firefox**：打开书签库（`Ctrl + Shift + O` / `Cmd + Shift + O`）→ 点击 **「导入和备份」** → 选择 **「导出书签到 HTML...」**
- **Safari**：顶部菜单栏选择 **「文件」** → **「导出书签...」**

### 2. 导入与整理

1. 打开 [Bookmarks Manager](https://build-workbench.github.io/bookmarks-manager/)，进入 **「上传合并」**。
2. 拖入一个或多个书签 HTML 文件（支持多浏览器书签同时合并）。
3. **去重清理**：在 **「去重」** 页面查看精确重复与相似书签，一键剔除冗余项。
4. **搜索与分类**：在 **「搜索」** 中快速检索书签，或在 **「仪表盘」** 查看按域名自动分类的统计图表。

### 3. 导出并导回浏览器

1. 点击页面右上角的 **「导出」**。
2. 选择 **HTML 格式** 下载（已兼容主流浏览器规范）。
3. 回到浏览器书签管理器，选择 **「导入书签」** 即可。
   _(亦支持导出为 JSON、Markdown 或 CSV，便于归档与知识库管理)_

---

## ✨ 核心特性

- 🔒 **本地优先，隐私安全**：纯前端运行，书签数据仅保存在浏览器本地 IndexedDB，绝不上传任何服务器。
- ⚡ **智能合并去重**：自动清洗追踪参数（UTM 等）、规范化 URL，支持 URL 精确去重与标题相似度识别。
- 🔍 **秒级全文搜索**：内置 MiniSearch 引擎，支持标题、链接、目录多维度组合检索与高亮。
- 🏷️ **自动分类与洞察**：按域名自动归类（AI、开发、学习、资讯、工具等），直观展示分类与年份分布图表。
- 📦 **多格式导出与备份**：支持标准 HTML、JSON、Markdown、CSV 导出，并提供完整快照备份与恢复。
- 📱 **PWA 支持**：可直接安装到桌面独立运行，支持离线使用。

---

## 💻 本地开发

```bash
# 克隆仓库
git clone https://github.com/build-workbench/bookmarks-manager.git
cd bookmarks-manager

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

---

## 📄 License

[MIT](LICENSE)
