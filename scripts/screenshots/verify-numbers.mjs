#!/usr/bin/env node
/** 确定性数字验证: 注入数据 → 逐页导航 → dump 页面文本(不依赖视觉模型) */
import { chromium } from '/home/shane/dev/deepseek-harness/node_modules/.pnpm/playwright@1.61.1/node_modules/playwright/index.mjs'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SAMPLE = join(__dirname, 'sample')
const htmlA = readFileSync(join(SAMPLE, 'demo-a.html'), 'utf8')
const htmlB = readFileSync(join(SAMPLE, 'demo-b.html'), 'utf8')

async function main() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: '/home/shane/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome',
    args: ['--no-sandbox'],
  })
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await page.goto('http://localhost:5173/#/app/upload', { waitUntil: 'networkidle' })
  await page.waitForTimeout(600)

  const feed = await page.evaluate(async ({ htmlA, htmlB }) => {
    const store = (await import('/src/store/useBookmarksStore.ts')).default
    // 等初始 loadFromDB 完成, 避免竞态覆盖
    for (let i = 0; i < 50; i++) {
      if (!store.getState().loading) break
      await new Promise(r => setTimeout(r, 100))
    }
    await store.getState().clear()
    await store.getState().importFiles([
      new File([htmlA], 'demo-a.html', { type: 'text/html' }),
      new File([htmlB], 'demo-b.html', { type: 'text/html' }),
    ])
    await store.getState().mergeAndDedup()
    const s = store.getState()
    return { raw: s.rawItems.length, merged: s.mergedItems.length, dupGroups: Object.keys(s.duplicates).length, stats: s.stats }
  }, { htmlA, htmlB })
  console.log('=== 数据流真实值 ===')
  console.log(JSON.stringify(feed, null, 2))

  for (const [name, hash] of [['dashboard', '#/app/dashboard'], ['search', '#/app/search'], ['duplicates', '#/app/duplicates']]) {
    await page.evaluate(h => { location.hash = h }, hash)
    await page.waitForTimeout(1800)
    const text = await page.evaluate(() => document.querySelector('main')?.innerText || '')
    console.log(`\n=== ${name} (${hash}) 页面文本 ===`)
    console.log(text.replace(/\n/g, ' | ').slice(0, 800))
  }
  await browser.close()
}
main().catch(e => { console.error(e); process.exit(1) })