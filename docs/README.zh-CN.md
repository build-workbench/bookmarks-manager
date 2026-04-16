# Bookmarks Manager 文档

> 用户和开发者的完整文档

欢迎访问 Bookmarks Manager 文档！本目录包含项目的完整使用指南和开发指南。

## 快速导航

### 用户指南

| 文档 | 说明 |
|----------|-------------|
| [用户指南](../QUICKSTART.md) | 分步骤使用指南 |
| [功能特性](../FEATURES.md) | 详细功能文档 |

### 开发者指南

| 文档 | 说明 |
|----------|-------------|
| [架构文档](ARCHITECTURE.zh-CN.md) | 系统架构与设计 |
| [API 参考](API.zh-CN.md) | 模块接口与函数 |
| [贡献指南](CONTRIBUTING.zh-CN.md) | 贡献指南 |
| [需求文档](PRD.zh-CN.md) | 产品需求与路线图 |

### 语言版本

所有文档都提供英文和中文版本：

- [English](README.md)
- 简体中文（本文档）

---

## 文档结构

```
docs/
├── README.md                 # 本文档（EN）
├── README.zh-CN.md           # 文档索引（中文）
├── PRD.md                    # 产品需求（EN）
├── PRD.zh-CN.md              # 产品需求文档（中文）
├── ARCHITECTURE.md           # 架构（EN）
├── ARCHITECTURE.zh-CN.md     # 架构文档（中文）
├── API.md                    # API 参考（EN）
├── API.zh-CN.md              # API 参考（中文）
├── CONTRIBUTING.md           # 贡献指南（EN）
└── CONTRIBUTING.zh-CN.md     # 贡献指南（中文）
```

---

## 快速开始

### 新用户

1. 打开[在线应用](https://lessup.github.io/bookmarks-manager/)
2. 从浏览器导出书签
3. 导入并合并它们
4. 探索仪表盘和搜索功能

详细说明请参见 [QUICKSTART.md](../QUICKSTART.md)。

### 开发者

```bash
# 克隆仓库
git clone https://github.com/LessUp/bookmarks-manager.git
cd bookmarks-manager

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

开发指南请参见 [CONTRIBUTING.zh-CN.md](CONTRIBUTING.zh-CN.md)。

---

## 核心概念

### 隐私优先设计

所有处理都在您的浏览器中完成：
- 不上传到服务器
- 无数据追踪
- 您的书签永远不会离开设备

### 本地优先架构

- IndexedDB 持久化
- 首次加载后离线可用
- 数据完全由您掌控

### BYOK（自备密钥）

Bring Your Own Key：
- 使用您的 OpenAI、Claude 或自定义 API 密钥
- 密钥仅本地存储
- 用多少付多少

---

## 功能亮点

### 核心功能
- 📥 多浏览器书签导入
- 🔗 智能去重
- 🔍 全文搜索
- 📊 统计与可视化
- 💾 自动本地持久化

### AI 驱动功能（可选）
- 🤖 自动分类
- 📝 内容摘要
- 🔍 自然语言搜索
- 📈 集合洞察

### 导出选项
- HTML（浏览器兼容）
- JSON（结构化数据）
- CSV（表格友好）
- Markdown（文档）

---

## 项目状态

**当前版本**: v1.1.0  
**状态**: ✅ 活跃开发中

版本历史请参见 [CHANGELOG.md](../CHANGELOG.md)。

---

## 贡献

我们欢迎贡献！请查看：
- [贡献指南](CONTRIBUTING.zh-CN.md) - 如何贡献
- [架构文档](ARCHITECTURE.zh-CN.md) - 系统设计
- [API 参考](API.zh-CN.md) - 模块接口

---

## 支持

- 🐛 [报告问题](https://github.com/LessUp/bookmarks-manager/issues)
- 💬 [讨论区](https://github.com/LessUp/bookmarks-manager/discussions)
- 📧 邮箱：[优先使用 GitHub issues]

---

## 开源协议

MIT License - 详细信息请参见 [LICENSE](../LICENSE)。

---

<p align="center">
  <a href="../README.zh-CN.md">← 返回主 README</a>
</p>
