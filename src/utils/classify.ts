import type { Bookmark } from './bookmarkParser'
import { getHostname } from './url'

export type Category =
  | 'AI'
  | '编程'
  | '学习'
  | '社区'
  | '资讯'
  | '娱乐'
  | '工具'
  | '生物'
  | '其他'

const DOMAIN_RULES: Array<{ category: Category; domains: string[] }> = [
  {
    category: 'AI',
    domains: [
      'openai.com', 'anthropic.com', 'huggingface.co', 'deepseek.com',
      'chatglm.cn', 'mistral.ai', 'perplexity.ai', 'replicate.com',
      'cursor.com', 'cursor.sh', 'codeium.com', 'aider.chat',
      'midjourney.com', 'stability.ai', 'cohere.com', 'qwen.ai'
    ]
  },
  {
    category: '编程',
    domains: [
      'github.com', 'gitlab.com', 'gitee.com', 'bitbucket.org',
      'python.org', 'rust-lang.org', 'go.dev', 'nodejs.org',
      'docker.com', 'kubernetes.io', 'npmjs.com', 'pypi.org',
      'stackoverflow.com', 'codepen.io', 'codesandbox.io'
    ]
  },
  {
    category: '学习',
    domains: [
      'arxiv.org', 'paperswithcode.com', 'ocw.mit.edu', 'coursera.org',
      'edx.org', 'udemy.com', 'mdn.dev', 'developer.mozilla.org',
      'w3schools.com', 'freecodecamp.org', 'hello-algo.com',
      'kancloud.cn', 'readthedocs.io', 'gitbook.com'
    ]
  },
  {
    category: '社区',
    domains: [
      'news.ycombinator.com', 'reddit.com', 'v2ex.com', 'linux.do',
      'solidot.org', 'juejin.cn', 'segmentfault.com', 'dev.to',
      'medium.com'
    ]
  },
  {
    category: '资讯',
    domains: [
      'techcrunch.com', 'theverge.com', 'producthunt.com', '36kr.com',
      'arstechnica.com', 'cnbeta.com', 'theinformation.com'
    ]
  },
  {
    category: '娱乐',
    domains: [
      'youtube.com', 'bilibili.com', 'v.qq.com', 'youku.com',
      'iqiyi.com', 'music.163.com', 'douban.com', 'unsplash.com',
      'dribbble.com', 'behance.net', 'pinterest.com'
    ]
  },
  {
    category: '工具',
    domains: [
      'google.com', 'baidu.com', 'bing.com', 'duckduckgo.com',
      'deepl.com', 'regex101.com', 'excalidraw.com', 'mermaid.live',
      'star-history.com', 'wolframalpha.com', 'tldraw.com',
      'jsoncrack.com', 'raycast.com'
    ]
  },
  {
    category: '生物',
    domains: [
      'ncbi.nlm.nih.gov', 'bioconda.github.io', 'broadinstitute.org',
      'nature.com', 'biorxiv.org', 'illumina.com', 'pubmed.ncbi.nlm.nih.gov'
    ]
  }
]

const TITLE_KEYWORDS: Array<{ category: Category; keywords: string[] }> = [
  { category: 'AI', keywords: ['gpt', 'llm', '大模型', 'ai', 'machine learning', 'deep learning', 'neural'] },
  { category: '编程', keywords: ['python', 'rust', 'golang', 'java', 'c++', 'react', 'vue', 'docker', 'kubernetes'] },
  { category: '娱乐', keywords: ['电影', '音乐', 'music', 'video', '游戏', 'game', '漫画'] },
]

function matchDomain(host: string, domains: string[]): boolean {
  return domains.some((d) => host === d || host.endsWith('.' + d))
}

function matchTitle(title: string, keywords: string[]): boolean {
  const lower = title.toLowerCase()
  return keywords.some((k) => lower.includes(k))
}

export function classifyBookmark(bookmark: Bookmark): Category {
  const host = getHostname(bookmark.url)

  for (const rule of DOMAIN_RULES) {
    if (matchDomain(host, rule.domains)) {
      return rule.category
    }
  }

  for (const rule of TITLE_KEYWORDS) {
    if (matchTitle(bookmark.title, rule.keywords)) {
      return rule.category
    }
  }

  return '其他'
}

export function classifyBookmarks(bookmarks: Bookmark[]): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const b of bookmarks) {
    const cat = classifyBookmark(b)
    counts[cat] = (counts[cat] || 0) + 1
  }
  return counts
}

export const CATEGORY_ORDER: Category[] = [
  'AI', '编程', '学习', '生物', '社区', '资讯', '娱乐', '工具', '其他'
]
