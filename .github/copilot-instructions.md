# Copilot Instructions

## 项目阶段

**Closure Hardening**：收尾固化阶段。优先清理、一致性和稳定性，而非功能扩展。

## 产品约束

- 本地优先：无后端、无云同步
- 隐私优先：不引入上传或遥测
- AI BYOK：从不硬编码密钥或 secrets
- AI 表面可选且最小：仅保留本地 BYOK 配置
- GitHub Pages 部署，使用 `HashRouter`

## 工作风格

- 实质性变更从 OpenSpec 提案开始
- 保持变更聚焦，清理紧密相关的代码漂移
- Solo 维护仓库：本地验证后直接推送
- 风险变更前执行 `/review`

## 命令

```bash
npm run validate  # 代码变更必须通过
npm run build     # 路由、PWA、部署相关变更需额外运行
```

## 文档与工具

- 文档保持精简且持续维护
- 不添加通用 PRD、API 文档或模板
- 优先使用原生工具、`gh`、OpenSpec，而非额外的 MCP/插件

## 核心技术栈

- React + TypeScript + Vite
- Zustand（状态）、Dexie/IndexedDB（存储）
- Tailwind CSS、ECharts
- Vitest + fast-check（测试）
