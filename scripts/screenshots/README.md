# scripts/screenshots — 功能截图工具

用于生成 README 里的功能截图（落地页 / 仪表盘 / 搜索 / 重复检测）。

## 前置条件

1. 启动 dev server：`npm run dev`（默认端口 5173）
2. Playwright chromium 可用（截图脚本硬编码了本机路径，请按需修改 `screenshot-workspace.mjs` 里的 `executablePath`）
3. **中文字体**：截图依赖系统已安装 CJK 字体。本机用 **Resource Han Rounded CN**（文件名 `ResourceHanRoundedCN-*.ttf`，与 Windows `C:\Data\Filen\数据备份\字体常用\ResourceHanRoundedCN` 同源）。
   若未安装，中文字会渲染成方框（tofu）。安装后执行：
   ```bash
   mkdir -p ~/.local/share/fonts
   cp "/mnt/c/Data/Filen/数据备份/字体常用/ResourceHanRoundedCN/"*.ttf ~/.local/share/fonts/
   fc-cache -fv 2>/dev/null | tail -1
   ```

## 使用

```bash
# 1. 生成示例书签 HTML（每次可重跑）
node scripts/screenshots/make-samples.mjs

# 2. 注入示例数据并截图三张工作区页到 /tmp/bm-shots/
node scripts/screenshots/screenshot-workspace.mjs

# 3.（可选）验证页面数字与 store 一致
node scripts/screenshots/verify-numbers.mjs
```

截图输出到 `/tmp/bm-shots/`。将 `dashboard.png`、`search.png`、`duplicates.png`（及手动截的落地页 `landing.png`）复制到 `public/screenshots/` 即完成更新。

## 说明

- 路由修复（App.tsx 用相对子路径）是截图的前提，否则工作区页面 main 区为空。
- 脚本通过 `import('/src/store/useBookmarksStore.ts')`（带 `.ts` 后缀）取与 App 同一个 store 实例，避免 vite 将无后缀导入解析成另一实例。