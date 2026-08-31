#!/usr/bin/env node
/**
 * 注入示例书签(走 App 真实 pipeline) → SPA 内导航各工作区页面 → 截图
 * 核心: 在页面上下文动态 import('/src/store/useBookmarksStore.ts'), 拿到与 App 同一份 zustand store,
 * 调用 importFiles(File) + mergeAndDedup() 生成真实的 mergedItems/duplicates/stats/搜索索引,
 * 然后用 history.pushState + popstate 做 SPA 内导航(不刷新页面, 保留内存状态)。
 */
import { chromium } from '/home/shane/dev/deepseek-harness/node_modules/.pnpm/playwright@1.61.1/node_modules/playwright/index.mjs'
import { readFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SAMPLE_DIR = join(__dirname, 'sample')
const OUT_DIR = '/tmp/bm-shots'
const BASE = process.env.APP_URL || 'http://localhost:5173'

async function main() {
  mkdirSync(OUT_DIR, { recursive: true })
  const browser = await chromium.launch({
    headless: true,
    executablePath: '/home/shane/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome',
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  })
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 })
  const page = await context.newPage()

  // 0. 先打开任意页让 App 模块加载 (HashRouter: 路由在 hash 中)
  await page.goto(BASE + '/#/app/upload', { waitUntil: 'networkidle' })
  await page.waitForTimeout(500)

  // 1. 动态 import store, 清空 + 注入示例 + 合并去重(全部真实 pipeline)
  const htmlA = readFileSync(join(SAMPLE_DIR, 'demo-a.html'), 'utf8')
  const htmlB = readFileSync(join(SAMPLE_DIR, 'demo-b.html'), 'utf8')
  const feed = await page.evaluate(async ({ htmlA, htmlB }) => {
    const mod = await import('/src/store/useBookmarksStore.ts')
    const store = mod.default
    // 先清空(避免旧数据)
    await store.getState().clear()
    // 构造 File 并走 importFiles
    const fa = new File([htmlA], 'demo-a.html', { type: 'text/html' })
    const fb = new File([htmlB], 'demo-b.html', { type: 'text/html' })
    await store.getState().importFiles([fa, fb])
    await store.getState().mergeAndDedup()
    const s = store.getState()
    return {
      raw: s.rawItems.length,
      merged: s.mergedItems.length,
      needsMerge: s.needsMerge,
      hasFullMergeData: s.hasFullMergeData,
      dupGroups: Object.keys(s.duplicates).length,
      stats: s.stats,
    }
  }, { htmlA, htmlB })

  console.log('数据注入结果:', JSON.stringify(feed, null, 2))

  // 2. SPA 内导航逐页截图 (HashRouter → 点击导航栏 <a> 链接触发路由器)
  const pages = [
    { name: 'dashboard', href: '#/app/dashboard', navText: 'Dashboard' },
    { name: 'search', href: '#/app/search', navText: 'Search' },
    { name: 'duplicates', href: '#/app/duplicates', navText: 'Duplicates' },
  ]
  for (const p of pages) {
    // 用 React 路由的正常点击: 找 href 匹配的 <a> 并 click
    const clicked = await page.evaluate((href) => {
      const a = Array.from(document.querySelectorAll('header a')).find(x => x.getAttribute('href') === href)
      if (a) { a.click(); return true }
      return false
    }, p.href)
    if (!clicked) {
      // 兜底: 直接改 hash
      await page.evaluate((hash) => { location.hash = hash }, p.href)
    }
    await page.waitForTimeout(2000) // 等图表/懒加载渲染
    const cur = await page.evaluate(() => location.hash)
    const bodyHead = (await page.evaluate(() => document.body.innerText)).slice(0, 60).replace(/\n/g, ' | ')
    console.log(`导航到 ${p.href} → 实际 hash=${cur} (${cur === p.href ? 'OK' : 'FAIL'}) body=${bodyHead}`)
    await page.screenshot({ path: join(OUT_DIR, `${p.name}.png`) })
    console.log(`截图: ${p.name}.png`)
  }

  await browser.close()
  console.log('完成')
}

main().catch((e) => { console.error('失败:', e); process.exit(1) })