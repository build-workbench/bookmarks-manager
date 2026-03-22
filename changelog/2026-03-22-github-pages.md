# 2026-03-22 GitHub Pages 优化

## 修改内容
- 为仓库新增 GitHub Pages 工作流：`.github/workflows/pages.yml`。
- 为 Vite 项目增加 `VITE_BASE_PATH` 支持，适配仓库名子路径部署。
- 将 `bookmarks-manager` 与 `meta-human` 的路由切换为 `HashRouter`，避免 GitHub Pages 刷新 404。
- 将 `bookmarks-manager`、`meta-human`、`particle-fluid-sim` 的 `index.html` 静态入口资源改为相对路径，兼容 Pages 子路径。

## 影响范围
- `vite.config.ts`
- `index.html`
- `src/main.tsx` / `src/App.tsx`
- `.github/workflows/pages.yml`

## 验证说明
- 已检查配置与路径引用的一致性。
- 本地构建未执行成功，原因是当前环境缺少项目依赖命令（如 `vite`、`tsc`），CI 中会通过 `npm ci` 安装依赖后再构建。
