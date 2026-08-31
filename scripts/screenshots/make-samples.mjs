#!/usr/bin/env node
/**
 * 生成演示用 Netscape 书签 HTML(2 个来源文件, 含重复项, 供截图注入)
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

function folder(name, items, indent = 4) {
  const pad = ' '.repeat(indent)
  const pad2 = ' '.repeat(indent + 2)
  let out = `${pad}<DT><H3>${esc(name)}</H3>\n${pad}<DL><p>\n`
  for (const it of items) {
    if (it.children) {
      out += folder(it.name, it.children, indent + 2)
    } else {
      out += `${pad2}<DT><A HREF="${esc(it.url)}" ADD_DATE="${it.addDate}" LAST_MODIFIED="${it.addDate}">${esc(it.title)}</A>\n`
    }
  }
  out += `${pad}</DL><p>\n`
  return out
}

function wrap(title, sourceFile, body) {
  return `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>${title}</TITLE>
<H1>${title}</H1>
<DL><p>
${body}</DL><p>
`
}

// add_date 用秒时间戳
const y = (year, m = 3, d = 15) => Math.floor(new Date(`${year}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`).getTime() / 1000)

// 常用站点(会跨文件夹/文件重复, 供重复检测展示)
const sites = {
  github: { url: 'https://github.com', title: 'GitHub' },
  githubReact: { url: 'https://github.com/facebook/react', title: 'facebook/react - GitHub' },
  stackoverflow: { url: 'https://stackoverflow.com/questions/tagged/javascript', title: 'JavaScript Questions - Stack Overflow' },
  mdn: { url: 'https://developer.mozilla.org/zh-CN/docs/Web/JavaScript', title: 'JavaScript - MDN Web Docs' },
  react: { url: 'https://react.dev/', title: 'React 官方文档' },
  vite: { url: 'https://vitejs.dev/', title: 'Vite 官方文档' },
  vue: { url: 'https://vuejs.org/', title: 'Vue.js 官方文档' },
  node: { url: 'https://nodejs.org/', title: 'Node.js 官方文档' },
  zhihu: { url: 'https://www.zhihu.com/', title: '知乎' },
  juejin: { url: 'https://juejin.cn/', title: '稀土掘金' },
  bilibili: { url: 'https://www.bilibili.com/', title: '哔哩哔哩' },
  google: { url: 'https://www.google.com/', title: 'Google' },
  typescript: { url: 'https://www.typescriptlang.org/', title: 'TypeScript 官方文档' },
  tailwind: { url: 'https://tailwindcss.com/', title: 'Tailwind CSS 官方文档' },
  linux: { url: 'https://www.kernel.org/', title: 'Linux Kernel' },
}

// ---- 文件 1: 日常浏览器 ----
const file1 = folder('开发工具', [
  sites.github,
  sites.vite,
  { title: 'VS Code 下载', url: 'https://code.visualstudio.com/', addDate: y(2022, 5, 10) },
  { title: 'Docker 文档', url: 'https://docs.docker.com/', addDate: y(2023, 2, 18) },
])
+ folder('前端学习', [
  sites.react,
  sites.vue,
  sites.typescript,
  sites.mdn,
  sites.tailwind,
  { title: 'ECMAScript 规范', url: 'https://tc39.es/ecma262/', addDate: y(2021, 11, 3) },
])
+ folder('技术社区', [
  sites.stackoverflow,
  sites.juejin,
  { title: 'Hacker News', url: 'https://news.ycombinator.com/', addDate: y(2020, 8, 22) },
  { title: 'Reddit Programming', url: 'https://www.reddit.com/r/programming/', addDate: y(2019, 6, 30) },
])
+ folder('生活娱乐', [
  sites.bilibili,
  sites.zhihu,
  { title: 'Netflix', url: 'https://www.netflix.com/', addDate: y(2021, 1, 15) },
  { title: 'Spotify', url: 'https://open.spotify.com/', addDate: y(2022, 9, 5) },
])

const file2 = folder('开发工具', [
  sites.github,
  sites.githubReact,
  sites.stackoverflow,
  { title: 'Visual Studio Code', url: 'https://code.visualstudio.com/', addDate: y(2024, 4, 12) },
  { title: 'Docker Hub', url: 'https://hub.docker.com/', addDate: y(2023, 2, 18) },
])
+ folder('学习资料', [
  sites.mdn,
  sites.react,
  sites.vite,
  { title: 'TypeScript 手册', url: 'https://www.typescriptlang.org/docs/', addDate: y(2023, 7, 1) },
  { title: 'Node.js 中文文档', url: 'https://nodejs.org/zh-cn', addDate: y(2024, 1, 20) },
])
+ folder('新闻资讯', [
  sites.google,
  { title: 'BBC News', url: 'https://www.bbc.com/news', addDate: y(2020, 3, 8) },
  { title: 'GitHub Trending', url: 'https://github.com/trending', addDate: y(2024, 5, 25) },
  { title: 'Linux Kernel', url: 'https://www.kernel.org/', addDate: y(2018, 10, 1) },
])

const html1 = wrap('演示书签 A', 'demo-a.html', file1)
const html2 = wrap('演示书签 B', 'demo-b.html', file2)

mkdirSync(join(__dirname, 'sample'), { recursive: true })
writeFileSync(join(__dirname, 'sample', 'demo-a.html'), html1)
writeFileSync(join(__dirname, 'sample', 'demo-b.html'), html2)
console.log('已生成:', join(__dirname, 'sample', 'demo-a.html'), html1.length, 'bytes')
console.log('已生成:', join(__dirname, 'sample', 'demo-b.html'), html2.length, 'bytes')
