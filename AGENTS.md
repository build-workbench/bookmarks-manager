# AGENTS.md

AI coding assistant 的项目约定 —— **Bookmarks Manager**

## 产品定位

**本地优先的书签管理工具**。核心价值：导入浏览器书签文件 → 智能合并去重 → 全文搜索 → 可视化统计 → 备份恢复 → 多格式导出。

技术约束：

- **本地优先**：所有数据处理在浏览器完成，IndexedDB 存储
- **隐私优先**：无后端、无云同步、无强制上传
- **AI BYOK**：仅保留本地配置与连接测试，不硬编码密钥
- **PWA 部署**：GitHub Pages + HashRouter

## 当前阶段：收尾固化

项目进入 **Closure Hardening** 阶段。核心目标：

- 提升一致性与稳定性，降低维护噪音
- 精简文档和自动化，保持 solo 维护的可持续性
- 不主动扩展新功能，除非有明确的 OpenSpec 提案

## 架构快照

```
src/
├── pages/        路由级 UI（LandingPage + 工作区页面）
├── ui/           通用 UI 组件（Chart, VirtualList 等）
├── store/        Zustand 状态（bookmarks, ai, cleanup）
├── utils/        书签解析、搜索、存储、导出、备份
├── ai/           可选 BYOK 配置与适配器
└── workers/      大数据集的 Web Worker 支持

openspec/         变更提案、能力规格（source of truth）
```

## 关键命令

```bash
npm run dev
npm run validate   # typecheck → lint → test
npm run build
```

- 代码变更：运行 `npm run validate`
- 路由/PWA/部署相关变更：额外运行 `npm run build`

## 工作规则

1. **OpenSpec 驱动**：实质性变更先写提案，保持 `openspec/specs/` 准确
2. **Solo 直推**：本地验证通过后直接推送，无需 PR 流程
3. **使用 `/review`**：跨模块变更、风险操作前执行代码审查
4. **文档精简**：维护小而准的文档集，删除过时内容

## 数据模型

IndexedDB 表（Dexie）：

- `bookmarks`：书签数据（含去重后的合并结果）
- `settings`：用户设置
- `aiConfig`：可选的 AI 提供商配置（BYOK）

## 路由结构

- `#/` — 公开 Landing Page
- `#/app/upload` — 上传合并
- `#/app/search` — 全文搜索
- `#/app/duplicates` — 重复检测
- `#/app/insights` — 统计视图
- `#/app/backup` — 备份恢复
- `#/app/ai` — AI 配置（可选）

## 代码风格

- 无分号（Prettier 配置）
- 单引号（TS/JS）
- 路径别名：`@/`, `@ai/`, `@components/`, `@pages/`, `@store/`, `@utils/`, `@workers/`
- 测试：Vitest + jsdom + fake-indexeddb + fast-check（属性测试）
- 覆盖率阈值：行 35%、函数 50%、分支 40%

## 维护文档

| 文件                     | 用途               |
| ------------------------ | ------------------ |
| `README.md` / `zh-CN`    | 产品概述与本地运行 |
| `docs/ARCHITECTURE.md`   | 架构地图           |
| `docs/CONTRIBUTING.md`   | 实际工作流程       |
| `CHANGELOG.md`           | 精选发布历史       |
| `AGENTS.md` / `CLAUDE.md | AI 助手约定        |

## 边界与禁忌

- ✅ 本地处理、IndexedDB 持久化
- ✅ 可选 AI BYOK 配置
- ❌ 不引入后端或云依赖
- ❌ 不硬编码 API 密钥
- ❌ 不添加未维护的文档或模板
- ❌ 不隐式复活已延期的功能提案
