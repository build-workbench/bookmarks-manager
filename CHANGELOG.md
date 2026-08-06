# 更新日志

## Unreleased

### Changed

- 彻底轻量化重构：删除 openspec、.claude、docs、screenshots、types 等过程/工具开销
- 路径别名从 7 个精简为 1 个（仅保留 `@/`），删除 6 个零使用别名
- DB schema 从 4 个版本折叠为单版本（移除已废弃的 aiCache/aiUsage/cleanupSessions 等表）
- 删除零引用的 barrel 文件（store/index.ts、ai/index.ts）
- 消除 detectBrowserLanguage 重复定义
- exportFormats 从独立 constants/ 目录移入 utils/exporters/
- PWA manifest 移除不存在的 PNG 图标引用，仅保留 SVG favicon
- CI 与部署工作流合并为单一 pages.yml
- README 重写为自包含文档，新增 MIT LICENSE 文件
- .gitignore 和 .vscode 配置清理

## 1.1.0 - 2026-04-15

### Added

- 多格式导出（HTML、JSON、CSV、Markdown）
- 本地数据备份与恢复页面
- 面向大数据量的 Worker 处理支持
- 清理工作流与更完整的 AI 分析界面

### Changed

- 搜索与仪表盘性能优化
- 为公开发布补齐文档与落地页基础

## 1.0.0 - 2026-03-22

### Added

- GitHub Pages 部署
- 基于 HashRouter 的 SPA 路由
- 本地优先的书签导入、合并、去重、搜索与导出基础能力
