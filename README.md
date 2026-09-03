# Bookmarks Manager

> 纯前端、本地优先的书签合并与智能清理工具。无需注册、无后端、数据不出浏览器。

[🌐 在线使用](https://build-workbench.github.io/bookmarks-manager/) · [GitHub 仓库](https://github.com/build-workbench/bookmarks-manager) · [报告问题](https://github.com/build-workbench/bookmarks-manager/issues)

---

## 🚀 如何使用

只需 3 步，即可整理多设备、多浏览器的杂乱书签：

### 1. 导出书签

从浏览器导出标准书签 HTML 文件：

- **Chrome / Edge**：按 `Ctrl + Shift + O`（Mac: `Cmd + Option + B`）打开书签管理器 → 点击右上角 `···` → 选择 **「导出书签」**
- **Firefox**：按 `Ctrl + Shift + O` 打开书签库 → 点击 **「导入和备份」** → 选择 **「导出书签到 HTML...」**
- **Safari**：顶部菜单选择 **「文件」** → **「导出书签...」**

### 2. 导入与整理

1. 打开 [Bookmarks Manager](https://build-workbench.github.io/bookmarks-manager/)，拖入一个或多个书签文件（支持同时导入多浏览器书签）。
2. **去重清理**：进入 **「去重」** 页面，系统已自动识别精确重复与相似书签，一键剔除多余项。
3. **检索分类**：在 **「搜索」** 页面毫秒级查找书签，或在 **「仪表盘」** 查看按域名自动分类的统计图。

### 3. 导回浏览器

1. 点击右上角 **「导出」**，选择 **HTML 格式** 下载。
2. 回到浏览器书签管理器，点击 **「导入书签」** 即可。
   > 也支持导出为 JSON、Markdown、CSV 用于知识库归档或备份。

---

## ✨ 核心特性

- 🔒 **本地优先**：纯前端运行，数据仅存储于浏览器本地 IndexedDB，零上传，绝对隐私。
- ⚡ **智能去重**：自动清洗追踪参数、规范化 URL，支持 URL 精准去重与标题相似度识别。
- 🔍 **秒级搜索**：内置全文搜索引擎，支持标题、链接、目录多维度检索与高亮。
- 🏷️ **自动分类**：按域名智能归类（开发、学习、工具、资讯等），配合可视化图表分析。
- 📦 **多格式支持**：兼容标准 Netscape HTML，支持导出 JSON / Markdown / CSV 及整库快照。
- 📱 **PWA 支持**：可安装至桌面独立使用，支持离线运行。

---

## 💻 本地运行

```bash
git clone https://github.com/build-workbench/bookmarks-manager.git
cd bookmarks-manager
npm install
npm run dev
```

---

## 📄 License

[MIT](LICENSE)
