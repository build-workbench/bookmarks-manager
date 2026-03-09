# GitHub Pages 优化 (2026-03-10)

## 工作流优化

- **pages.yml** — 扩展路径触发过滤：新增 `types/**`、`index.html`、`favicon.svg`、`package-lock.json`、`vite.config.ts`、`tsconfig.json`、`tsconfig.node.json`、`tailwind.config.js`、`postcss.config.js`；移除不存在的 `public/**`
- **pages.yml** — 新增 `main` 分支触发
- **pages.yml** — 移除不必要的 `configure-pages` 步骤

## README 徽章

- **README.md / README.zh-CN.md** — 统一添加 CI 和 Deploy 工作流状态徽章

## 工程改进

- **.gitignore** — 添加 `.windsurf/`
