# Capability: AI Analysis

## Overview

AI 智能分析功能为用户提供可选的 BYOK (Bring Your Own Key) AI 配置能力。遵循 Local-first 隐私优先原则，所有配置存储在本地 IndexedDB 中，不上传至任何服务端。AI 功能为可选增强，不配置时核心书签管理功能完全可用。

## Requirements

### Requirement 1: AI API 配置管理

**User Story:** As a user, I want to optionally configure my AI API settings, so that I can use AI-enhanced features with my own API key.

#### Acceptance Criteria

1. WHEN a user opens the AI settings panel, THE Bookmark_Manager SHALL display API configuration options including provider selection, API key input, and model selection
2. WHEN a user saves API configuration, THE Bookmark_Manager SHALL securely store the configuration in IndexedDB only
3. IF an invalid API key is provided, THEN THE Bookmark_Manager SHALL display a clear error message indicating the issue
4. THE Bookmark_Manager SHALL support multiple LLM providers (OpenAI, Claude, custom endpoint)
5. WHEN a user does not configure any AI provider, THE application SHALL remain fully usable for import, merge, search, deduplication, export, backup, and public landing flows
6. THE application SHALL NOT upload configuration or bookmark data to any repository-controlled service
7. WHEN a user clears AI configuration, THE application SHALL allow local AI settings to be removed without affecting core bookmark data
