# CLAUDE.md

Claude 专用项目指令 —— **Bookmarks Manager**

## 核心关注

本地优先的书签管理 PWA。当前处于 **收尾固化** 阶段：优化一致性、降低维护噪音、保持 solo 维护的可持续性。

## 编辑前必读

1. 检查 `openspec/specs/` 了解当前能力边界
2. 阅读 `AGENTS.md` 获取完整架构约定
3. 优先清理代码漂移，而非添加新抽象层

## 命令

```bash
npm run validate
npm run build
```

- 代码变更必须通过 `validate`
- 路由、PWA、部署相关变更需额外运行 `build`

## 仓库特性

- 路由：`HashRouter`（GitHub Pages SPA 兼容）
- 存储：Dexie / IndexedDB（纯本地）
- 状态：Zustand
- AI：可选 BYOK 配置，存储在本地 IndexedDB
- 部署：GitHub Pages `/bookmarks-manager/`

## 编辑偏好

- 文档精简，避免通用模板
- CI、hooks、自动化保持最小化
- 风险 diff 使用 `/review` 进行审查
