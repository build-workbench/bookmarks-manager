/**
 * AI Module Constants and Default Configurations
 */

import type { LLMProvider, PromptTemplate } from './types'

// Supported LLM Providers
export const LLM_PROVIDERS: Record<string, LLMProvider> = {
  openai: {
    name: 'OpenAI',
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'],
    defaultModel: 'gpt-4o-mini',
    baseUrl: 'https://api.openai.com/v1'
  },
  claude: {
    name: 'Claude (Anthropic)',
    models: ['claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022', 'claude-3-opus-20240229'],
    defaultModel: 'claude-3-5-sonnet-20241022',
    baseUrl: 'https://api.anthropic.com/v1'
  },
  custom: {
    name: 'Custom Endpoint',
    models: [],
    defaultModel: '',
    baseUrl: ''
  }
}

// Cost per 1K tokens (USD) - approximate values
export const TOKEN_COSTS: Record<string, { input: number; output: number }> = {
  'gpt-4o': { input: 0.0025, output: 0.01 },
  'gpt-4o-mini': { input: 0.00015, output: 0.0006 },
  'gpt-4-turbo': { input: 0.01, output: 0.03 },
  'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 },
  'claude-3-5-sonnet-20241022': { input: 0.003, output: 0.015 },
  'claude-3-5-haiku-20241022': { input: 0.001, output: 0.005 },
  'claude-3-opus-20240229': { input: 0.015, output: 0.075 }
}

// Default configuration values
export const DEFAULT_MAX_TOKENS = 2000
export const DEFAULT_TEMPERATURE = 0.7
export const DEFAULT_CACHE_TTL_MS = 24 * 60 * 60 * 1000 // 24 hours
export const DEFAULT_BATCH_SIZE = 10
export const MAX_RETRIES = 3
export const RETRY_DELAY_MS = 1000

// Default prompt templates
export const DEFAULT_PROMPTS: PromptTemplate[] = [
  {
    id: 'categorize',
    name: '书签分类',
    description: '为书签建议合适的分类',
    template: `分析以下书签并为每个建议一个分类。

书签列表:
{{bookmarks}}

请为每个书签返回 JSON 格式的分类建议:
{
  "suggestions": [
    {
      "bookmarkId": "id",
      "category": "建议的分类",
      "confidence": 0.0-1.0,
      "reasoning": "分类理由"
    }
  ]
}

分类应该简洁明了，如：技术/编程、新闻/资讯、工具/效率、学习/教程、娱乐/视频、购物/电商、社交/社区、金融/投资、设计/创意、其他。`,
    variables: ['bookmarks'],
    isDefault: true,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: 'summarize',
    name: '书签摘要',
    description: '生成书签内容的简短描述',
    template: `根据以下书签的标题和 URL，生成一个简短的内容描述。

标题: {{title}}
URL: {{url}}
路径: {{path}}

请返回 JSON 格式:
{
  "summary": "50字以内的内容描述",
  "keywords": ["关键词1", "关键词2", "关键词3"]
}`,
    variables: ['title', 'url', 'path'],
    isDefault: true,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: 'duplicate_analysis',
    name: '重复分析',
    description: '分析重复书签并推荐保留项',
    template: `分析以下重复书签组，推荐应该保留哪一个。

重复书签组:
{{duplicates}}

请返回 JSON 格式:
{
  "keepId": "推荐保留的书签ID",
  "reasoning": "推荐理由",
  "factors": ["考虑因素1", "考虑因素2"]
}

考虑因素包括：标题质量（描述性、完整性）、URL 结构（简洁性、规范性）、添加时间（较早的可能更有价值）、文件夹位置（组织合理性）等。`,
    variables: ['duplicates'],
    isDefault: true,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: 'health_check',
    name: '健康检查',
    description: '识别可能有问题的书签',
    template: `分析以下书签，识别可能过时、低价值或有问题的书签。

书签列表:
{{bookmarks}}

请返回 JSON 格式:
{
  "issues": [
    {
      "bookmarkId": "id",
      "issueType": "outdated|low_value|broken_pattern|redundant",
      "description": "问题描述",
      "suggestion": "建议操作"
    }
  ]
}

问题类型说明：
- outdated: URL 模式显示可能已过时（如旧版本号、已知停止服务的域名）
- low_value: 标题或 URL 显示可能是临时性或低价值内容
- broken_pattern: URL 格式异常或可能无效
- redundant: 与其他书签高度相似或重复`,
    variables: ['bookmarks'],
    isDefault: true,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: 'natural_search',
    name: '自然语言搜索',
    description: '解释用户的搜索意图',
    template: `用户想要搜索书签，查询内容是: "{{query}}"

可用的书签信息:
{{bookmarks}}

请理解用户的搜索意图，返回最相关的书签 ID 列表（最多返回 20 个）:
{
  "matchedIds": ["id1", "id2", ...],
  "interpretation": "对用户查询的理解",
  "suggestions": ["如果没有找到结果，建议的替代搜索词"]
}`,
    variables: ['query', 'bookmarks'],
    isDefault: true,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: 'collection_report',
    name: '集合报告',
    description: '生成书签集合的分析报告',
    template: `分析以下书签集合，生成一份洞察报告。

统计信息:
- 总数: {{totalCount}}
- 域名分布: {{domainStats}}
- 时间分布: {{timeStats}}
- 目录结构: {{folderStats}}

请返回 JSON 格式的分析报告:
{
  "insights": ["洞察1", "洞察2", ...],
  "recommendations": ["建议1", "建议2", ...],
  "highlights": {
    "topCategories": ["类别1", "类别2"],
    "growthTrend": "增长趋势描述",
    "organizationScore": 0-100,
    "organizationFeedback": "组织情况反馈"
  }
}

请提供有价值的洞察和可操作的建议，帮助用户更好地管理书签。`,
    variables: ['totalCount', 'domainStats', 'timeStats', 'folderStats'],
    isDefault: true,
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
]

// System prompts for different operations
export const SYSTEM_PROMPTS = {
  categorize: '你是一个书签分类专家，擅长根据网页标题和 URL 判断内容类型并给出合适的分类。请始终返回有效的 JSON 格式。',
  summarize: '你是一个内容摘要专家，擅长根据有限的信息推断网页内容并生成简洁的描述。请始终返回有效的 JSON 格式。',
  duplicate: '你是一个数据整理专家，擅长分析重复数据并给出保留建议。请始终返回有效的 JSON 格式。',
  health: '你是一个数据质量分析专家，擅长识别可能有问题或过时的数据。请始终返回有效的 JSON 格式。',
  search: '你是一个智能搜索助手，擅长理解用户的搜索意图并匹配相关内容。请始终返回有效的 JSON 格式。',
  report: '你是一个数据分析专家，擅长从数据中提取洞察并给出建议。请始终返回有效的 JSON 格式。'
}
