# 贡献说明

Bookmarks Manager 目前按 **单人维护、低噪音治理** 的方式运作。流程重点不是 PR 仪式，而是：OpenSpec 先行、范围清晰、本地验证到位。

## 开发流程

1. 任何有意义的产品或仓库改动，先从 `openspec/changes/` 开始。
2. 变更范围保持聚焦；如果一个 proposal 已经混入多个主题，就拆分。
3. 维护者默认在本地验证后直接推送。
4. 对跨模块、风险较高或难验证的改动，推送前用 `/review` 一类的审查步骤再过一遍。
5. 不默认使用 `/fleet` 或其它编排过重的流程；优先使用一个 active change、原生工具、`gh` 和长会话推进工作。

外部贡献者仍然可以参与，但当前仓库流程优先追求低摩擦维护，而不是围绕 PR 仪式设计。

## 本地启动

```bash
git clone https://github.com/LessUp/bookmarks-manager.git
cd bookmarks-manager
npm install
npm run dev
```

## 验证命令

```bash
npm run validate
npm run build
```

- 所有代码改动都要跑 `npm run validate`
- 如果改动涉及路由、PWA 元数据、GitHub Pages、工作流或部署行为，还要补跑 `npm run build`

## 改仓库时顺手维护什么

| 改动类型          | 同步更新                                                            |
| ----------------- | ------------------------------------------------------------------- |
| 产品行为          | OpenSpec 变更文档，必要时更新 README                                |
| 路由 / PWA / 部署 | `index.html`、manifest、Pages workflow、相关说明文档                |
| 架构变化          | `docs/ARCHITECTURE*.md`                                             |
| 流程 / 工具变化   | `AGENTS.md`、`CLAUDE.md`、`.github/copilot-instructions.md`、本文档 |

## 文档原则

文档宁可少，但必须准。不能长期维护的文档，不要留成“看起来很全、实际上早就漂移”的负担。
