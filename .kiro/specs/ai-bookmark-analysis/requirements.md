# Requirements Document

## Introduction

本需求文档定义了浏览器书签管理系统的 AI 智能分析功能。系统将集成大模型 API，帮助用户智能分析、分类、整理和管理书签，同时保持 Local-first 的隐私优先原则。

## Glossary

- **Bookmark_Manager**: 书签管理系统的核心应用
- **AI_Analyzer**: AI 分析模块，负责调用大模型 API 进行书签分析
- **LLM_API**: 大语言模型 API 接口（如 OpenAI、Claude、本地模型等）
- **Bookmark**: 单个书签条目，包含标题、URL、路径、时间戳等信息
- **Category**: 书签分类/标签
- **Analysis_Report**: AI 生成的分析报告
- **Prompt_Template**: 预设的提示词模板

## Requirements

### Requirement 1: AI API 配置管理

**User Story:** As a user, I want to configure my AI API settings, so that I can use my own API key to access AI analysis features.

#### Acceptance Criteria

1. WHEN a user opens the AI settings panel, THE Bookmark_Manager SHALL display API configuration options including provider selection, API key input, and model selection
2. WHEN a user saves API configuration, THE Bookmark_Manager SHALL securely store the configuration in IndexedDB
3. WHEN a user tests the API connection, THE AI_Analyzer SHALL validate the API key and return connection status
4. IF an invalid API key is provided, THEN THE Bookmark_Manager SHALL display a clear error message indicating the issue
5. THE Bookmark_Manager SHALL support multiple LLM providers (OpenAI, Claude, custom endpoint)
6. WHEN API configuration is loaded, THE Bookmark_Manager SHALL retrieve stored settings from IndexedDB

### Requirement 2: 书签智能分类

**User Story:** As a user, I want AI to automatically categorize my bookmarks, so that I can better organize my bookmark collection.

#### Acceptance Criteria

1. WHEN a user requests bookmark categorization, THE AI_Analyzer SHALL analyze bookmark titles and URLs to suggest categories
2. WHEN categorization is complete, THE Bookmark_Manager SHALL display suggested categories with confidence scores
3. WHEN a user accepts a category suggestion, THE Bookmark_Manager SHALL apply the category to the bookmark
4. WHEN a user rejects a category suggestion, THE Bookmark_Manager SHALL allow manual category assignment
5. THE AI_Analyzer SHALL batch process bookmarks to minimize API calls
6. WHEN processing large bookmark sets, THE Bookmark_Manager SHALL display progress indication

### Requirement 3: 书签内容摘要

**User Story:** As a user, I want AI to generate summaries for my bookmarks, so that I can quickly understand what each bookmark contains without visiting the page.

#### Acceptance Criteria

1. WHEN a user requests a bookmark summary, THE AI_Analyzer SHALL generate a concise description based on the bookmark title and URL
2. WHEN a summary is generated, THE Bookmark_Manager SHALL store the summary with the bookmark data
3. WHEN displaying bookmarks, THE Bookmark_Manager SHALL show the AI-generated summary if available
4. IF the AI cannot generate a meaningful summary, THEN THE AI_Analyzer SHALL return a fallback message
5. THE AI_Analyzer SHALL respect rate limits and implement retry logic for API calls

### Requirement 4: 重复书签智能分析

**User Story:** As a user, I want AI to analyze duplicate bookmarks and recommend which ones to keep, so that I can make informed decisions about cleaning up my collection.

#### Acceptance Criteria

1. WHEN duplicate bookmarks are detected, THE AI_Analyzer SHALL analyze the duplicates and recommend which to keep
2. WHEN providing recommendations, THE AI_Analyzer SHALL explain the reasoning for each recommendation
3. WHEN a user views duplicate analysis, THE Bookmark_Manager SHALL display the AI recommendation alongside bookmark details
4. WHEN a user accepts a recommendation, THE Bookmark_Manager SHALL mark the recommended bookmark as the keeper
5. THE AI_Analyzer SHALL consider factors like title quality, URL structure, and folder context

### Requirement 5: 书签健康检查建议

**User Story:** As a user, I want AI to identify potentially outdated or low-value bookmarks, so that I can maintain a clean and useful bookmark collection.

#### Acceptance Criteria

1. WHEN a user requests health analysis, THE AI_Analyzer SHALL identify bookmarks that may be outdated based on patterns
2. WHEN health issues are found, THE Bookmark_Manager SHALL display a list of potentially problematic bookmarks
3. WHEN displaying health issues, THE AI_Analyzer SHALL provide actionable suggestions for each issue
4. WHEN a user dismisses a health suggestion, THE Bookmark_Manager SHALL remember the dismissal
5. THE AI_Analyzer SHALL identify common patterns like broken URL patterns, outdated domains, or redundant bookmarks

### Requirement 6: 自然语言书签搜索

**User Story:** As a user, I want to search my bookmarks using natural language queries, so that I can find bookmarks even when I don't remember exact titles or URLs.

#### Acceptance Criteria

1. WHEN a user enters a natural language query, THE AI_Analyzer SHALL interpret the query intent
2. WHEN query intent is determined, THE Bookmark_Manager SHALL return relevant bookmarks matching the intent
3. WHEN displaying search results, THE Bookmark_Manager SHALL explain why each result matches the query
4. IF no results match the query, THEN THE Bookmark_Manager SHALL suggest alternative search terms
5. THE AI_Analyzer SHALL support queries like "find articles about React" or "show my cooking recipes"

### Requirement 7: 书签集合分析报告

**User Story:** As a user, I want AI to generate an analysis report of my bookmark collection, so that I can understand my browsing patterns and collection composition.

#### Acceptance Criteria

1. WHEN a user requests a collection report, THE AI_Analyzer SHALL analyze the entire bookmark collection
2. WHEN the report is generated, THE Bookmark_Manager SHALL display insights including category distribution, domain patterns, and time trends
3. WHEN displaying the report, THE Bookmark_Manager SHALL provide actionable recommendations for organization
4. THE AI_Analyzer SHALL generate the report in a structured format suitable for display
5. WHEN a user exports the report, THE Bookmark_Manager SHALL save it as a readable document (Markdown/HTML)

### Requirement 8: 提示词模板管理

**User Story:** As a user, I want to customize AI prompts, so that I can tailor the AI analysis to my specific needs.

#### Acceptance Criteria

1. WHEN a user opens prompt settings, THE Bookmark_Manager SHALL display available prompt templates
2. WHEN a user edits a prompt template, THE Bookmark_Manager SHALL save the customized template
3. WHEN a user resets a prompt template, THE Bookmark_Manager SHALL restore the default template
4. THE Bookmark_Manager SHALL provide default templates for categorization, summarization, and analysis
5. WHEN using a prompt template, THE AI_Analyzer SHALL substitute bookmark data into the template placeholders

### Requirement 9: API 调用成本控制

**User Story:** As a user, I want to monitor and control AI API usage, so that I can manage costs and avoid unexpected charges.

#### Acceptance Criteria

1. WHEN API calls are made, THE Bookmark_Manager SHALL track token usage and estimated costs
2. WHEN displaying usage statistics, THE Bookmark_Manager SHALL show total tokens used and estimated cost
3. WHEN a user sets a usage limit, THE Bookmark_Manager SHALL warn before exceeding the limit
4. IF the usage limit is reached, THEN THE Bookmark_Manager SHALL pause AI operations and notify the user
5. THE Bookmark_Manager SHALL persist usage statistics across sessions

### Requirement 10: 离线模式与缓存

**User Story:** As a user, I want AI analysis results to be cached locally, so that I can access previous analyses without making new API calls.

#### Acceptance Criteria

1. WHEN an AI analysis is completed, THE Bookmark_Manager SHALL cache the result in IndexedDB
2. WHEN a user requests analysis for previously analyzed bookmarks, THE Bookmark_Manager SHALL return cached results if available
3. WHEN displaying cached results, THE Bookmark_Manager SHALL indicate the cache timestamp
4. WHEN a user requests fresh analysis, THE AI_Analyzer SHALL bypass the cache and make a new API call
5. THE Bookmark_Manager SHALL provide cache management options (clear cache, set cache duration)
