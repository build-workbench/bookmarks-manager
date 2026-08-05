# 更新日志

这里只保留**精简且有意义的版本记录**，不再堆积低价值的内部噪音。

## Unreleased

### Changed

- 文档体系精简为仅中文版，移除英文镜像与冗余索引/模板文件
- 移除 pre-commit 钩子（husky/lint-staged），改由编辑器 formatOnSave 保障格式
- 移除 `.github` 下的 issue 模板、安全策略与 copilot 指令，仅保留部署工作流
- 合并 AI 助手指令为单一 `AGENTS.md`，删除 `CLAUDE.md`
- 精简 `package.json` 脚本，移除 analyze/staging/ci/clean/coverage/watch 等冗余入口

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
