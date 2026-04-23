# 架构说明

Bookmarks Manager 是一个**纯前端 React + TypeScript PWA**。所有书签处理都在浏览器中完成，持久化状态通过 Dexie 写入 IndexedDB。

## 运行时入口

| 入口           | 作用                                    |
| -------------- | --------------------------------------- |
| `#/`           | GitHub Pages 访问者看到的公开落地页     |
| `#/app/*`      | 应用工作区                              |
| Service Worker | 离线资源缓存与安装能力                  |
| IndexedDB      | 书签、设置、AI 配置/缓存/用量、清理会话 |

## 代码结构

```text
src/
├── pages/        路由级页面
├── ui/           可复用 UI 组件
├── store/        Zustand 状态
├── utils/        解析、搜索、存储、导出、备份工具
├── cleanup/      清理工作流领域
├── ai/           自备 Key 的 AI 适配层与服务
└── workers/      大数据量导入时的 Worker 支持
```

## 主要流程

### 导入与合并

1. 用户导入一个或多个书签 HTML 文件
2. `bookmarkParser.ts` 解析 Netscape Bookmark HTML
3. `useBookmarksStore.ts` 规范化 URL 和目录路径
4. 去重逻辑按规范化 URL 选出保留项
5. 合并结果写入 Dexie，并构建搜索索引

### 搜索与导出

1. MiniSearch 在内存中构建索引
2. 搜索和筛选页面组合使用内存索引与本地书签数据
3. 导出工具按需生成 HTML、JSON、CSV、Markdown

### AI 与清理

- AI 功能是可选的，且要求用户自备 Key
- 清理工作流操作的是本地书签数据，并把会话/恢复状态保存到 IndexedDB

## 运行规则

- 路由：`HashRouter`，保证 GitHub Pages 兼容
- 质量门：`npm run validate`
- 构建检查：`npm run build`
- 有范围的产品或仓库改动由 OpenSpec 管理
