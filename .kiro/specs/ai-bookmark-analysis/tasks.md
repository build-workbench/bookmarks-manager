# Implementation Plan: AI Bookmark Analysis

## Overview

本实现计划将 AI 书签分析功能分解为可执行的编码任务。采用渐进式实现策略，先建立核心基础设施，再逐步添加各项 AI 功能。所有代码使用 TypeScript 实现，测试使用 Vitest + fast-check。

## Tasks

- [x] 1. 项目基础设施搭建
  - [x] 1.1 安装依赖并配置测试框架
    - 安装 fast-check 用于属性测试
    - 配置 Vitest 支持属性测试
    - 创建测试工具函数和生成器
    - _Requirements: Testing Strategy_

  - [x] 1.2 扩展 IndexedDB Schema
    - 在 `src/utils/db.ts` 中添加 AI 相关表定义
    - 实现 schema 版本升级迁移
    - 添加 aiConfig、aiCache、aiUsage、aiPrompts、aiUsageLimits 表
    - _Requirements: Data Models_

  - [x] 1.3 创建 AI 模块目录结构
    - 创建 `src/ai/` 目录
    - 创建类型定义文件 `src/ai/types.ts`
    - 创建常量和默认配置 `src/ai/constants.ts`
    - _Requirements: Components and Interfaces_

- [x] 2. LLM Provider Adapter 实现
  - [x] 2.1 实现 LLM 类型定义和基础接口
    - 定义 LLMProvider、LLMConfig、LLMRequest、LLMResponse 接口
    - 定义 LLMAdapter 抽象接口
    - _Requirements: 1.5_

  - [x] 2.2 实现 OpenAI Adapter
    - 实现 OpenAI API 调用逻辑
    - 实现请求构造和响应解析
    - 实现 API Key 验证
    - _Requirements: 1.3, 1.5_

  - [x] 2.3 实现 Claude Adapter
    - 实现 Anthropic API 调用逻辑
    - 实现请求构造和响应解析
    - 实现 API Key 验证
    - _Requirements: 1.3, 1.5_

  - [x] 2.4 实现 Custom Endpoint Adapter
    - 实现自定义端点 API 调用
    - 支持 OpenAI 兼容格式
    - _Requirements: 1.5_

  - [x] 2.5 编写 Provider Adapter 属性测试
    - **Property 2: Provider Adapter Validity**
    - **Property 3: Invalid API Key Error Handling**
    - **Validates: Requirements 1.4, 1.5**

- [x] 3. 配置管理实现
  - [x] 3.1 实现配置存储服务
    - 创建 `src/ai/configService.ts`
    - 实现配置的保存和加载
    - 实现 API Key 的安全存储
    - _Requirements: 1.2, 1.6_

  - [x] 3.2 编写配置存储属性测试
    - **Property 1: Configuration Round-Trip**
    - **Validates: Requirements 1.2, 1.6**

  - [x] 3.3 实现 AI 配置 UI 组件
    - 创建 `src/pages/AISettings.tsx` 组件
    - 实现 Provider 选择、API Key 输入、Model 选择
    - 实现连接测试功能
    - _Requirements: 1.1, 1.3_

- [x] 4. Checkpoint - 基础设施验证
  - 确保所有测试通过
  - 验证配置保存和加载功能
  - 验证 API 连接测试功能

- [x] 5. 提示词模板服务实现
  - [x] 5.1 实现 PromptService
    - 创建 `src/ai/promptService.ts`
    - 实现模板的 CRUD 操作
    - 实现变量替换逻辑
    - 加载默认模板
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_

  - [x] 5.2 编写提示词模板属性测试
    - **Property 20: Prompt Template Round-Trip**
    - **Property 21: Prompt Template Reset**
    - **Property 22: Prompt Variable Substitution**
    - **Validates: Requirements 8.2, 8.3, 8.5**

- [x] 6. 缓存服务实现
  - [x] 6.1 实现 CacheService
    - 创建 `src/ai/cacheService.ts`
    - 实现缓存的存取和过期检测
    - 实现缓存清理和统计
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

  - [x] 6.2 编写缓存服务属性测试
    - **Property 26: Cache Round-Trip**
    - **Property 27: Cache Bypass on Force Refresh**
    - **Property 28: Cache Management Operations**
    - **Validates: Requirements 10.1, 10.2, 10.4, 10.5**

- [x] 7. 用量追踪服务实现
  - [x] 7.1 实现 UsageService
    - 创建 `src/ai/usageService.ts`
    - 实现用量记录和统计
    - 实现限额检查和警告
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

  - [x] 7.2 编写用量追踪属性测试
    - **Property 23: Usage Tracking Round-Trip**
    - **Property 24: Usage Limit Warning**
    - **Property 25: Usage Limit Blocking**
    - **Validates: Requirements 9.1, 9.3, 9.4, 9.5**

- [x] 8. Checkpoint - 服务层验证
  - 确保所有测试通过
  - 验证提示词模板功能
  - 验证缓存和用量追踪功能

- [x] 9. AI 核心服务实现
  - [x] 9.1 实现 AIService 基础框架
    - 创建 `src/ai/aiService.ts`
    - 实现批量处理逻辑
    - 实现错误处理和重试机制
    - 集成缓存和用量追踪
    - _Requirements: 2.5, 3.5_

  - [x] 9.2 编写批量处理和重试属性测试
    - **Property 6: Batch Processing Efficiency**
    - **Property 10: Rate Limit Compliance**
    - **Validates: Requirements 2.5, 3.5**

- [x] 10. 书签分类功能实现
  - [x] 10.1 实现 categorizeBookmarks 方法
    - 实现书签分类逻辑
    - 集成提示词模板
    - 解析 LLM 响应
    - _Requirements: 2.1, 2.2_

  - [x] 10.2 编写分类功能属性测试
    - **Property 4: Categorization Output Validity**
    - **Property 5: Category Acceptance Updates Bookmark**
    - **Validates: Requirements 2.1, 2.3**

  - [x] 10.3 实现分类 UI 组件
    - 在 AI 页面添加分类功能入口
    - 显示分类建议和置信度
    - 实现接受/拒绝交互
    - _Requirements: 2.2, 2.3, 2.4, 2.6_

- [x] 11. 书签摘要功能实现
  - [x] 11.1 实现 summarizeBookmarks 方法
    - 实现单个和批量摘要生成
    - 实现 fallback 逻辑
    - _Requirements: 3.1, 3.2, 3.4_

  - [x] 11.2 编写摘要功能属性测试
    - **Property 7: Summary Generation Validity**
    - **Property 8: Summary Storage Round-Trip**
    - **Property 9: Summary Fallback on Error**
    - **Validates: Requirements 3.1, 3.2, 3.4**

  - [x] 11.3 实现摘要显示 UI
    - 在书签列表中显示 AI 摘要
    - 实现摘要请求按钮
    - _Requirements: 3.3_

- [x] 12. Checkpoint - 分类和摘要验证
  - 确保所有测试通过
  - 验证分类功能端到端流程
  - 验证摘要功能端到端流程

- [x] 13. 重复分析功能实现
  - [x] 13.1 实现 analyzeDuplicates 方法
    - 实现重复书签分析逻辑
    - 生成保留推荐和理由
    - _Requirements: 4.1, 4.2_

  - [x] 13.2 编写重复分析属性测试
    - **Property 11: Duplicate Recommendation Validity**
    - **Property 12: Recommendation Acceptance Updates Keeper**
    - **Validates: Requirements 4.1, 4.2, 4.4**

  - [x] 13.3 集成到去重工作台
    - 在 Duplicates 页面添加 AI 分析入口
    - 显示 AI 推荐和理由
    - 实现一键应用推荐
    - _Requirements: 4.3, 4.4_

- [x] 14. 健康检查功能实现
  - [x] 14.1 实现 analyzeHealth 方法
    - 实现书签健康分析逻辑
    - 识别问题类型并生成建议
    - _Requirements: 5.1, 5.3_

  - [x] 14.2 编写健康检查属性测试
    - **Property 13: Health Analysis Validity**
    - **Property 14: Health Dismissal Persistence**
    - **Validates: Requirements 5.1, 5.3, 5.4**

  - [x] 14.3 实现健康检查 UI
    - 创建健康检查结果展示组件
    - 实现问题列表和建议显示
    - 实现忽略功能
    - _Requirements: 5.2, 5.4_

- [x] 15. Checkpoint - 分析功能验证
  - 确保所有测试通过
  - 验证重复分析功能
  - 验证健康检查功能

- [x] 16. 自然语言搜索实现
  - [x] 16.1 实现 interpretQuery 方法
    - 实现查询意图解析
    - 实现书签匹配逻辑
    - 实现无结果时的建议生成
    - _Requirements: 6.1, 6.2, 6.4_

  - [x] 16.2 编写自然语言搜索属性测试
    - **Property 15: Query Interpretation Validity**
    - **Property 16: Search Result Validity**
    - **Property 17: Empty Search Suggestions**
    - **Validates: Requirements 6.1, 6.2, 6.4**

  - [x] 16.3 集成到搜索页面
    - 在 Search 页面添加 AI 搜索模式切换
    - 显示查询解释和匹配原因
    - _Requirements: 6.3, 6.5_

- [x] 17. 集合报告功能实现
  - [x] 17.1 实现 generateReport 方法
    - 实现集合分析逻辑
    - 生成洞察和建议
    - _Requirements: 7.1, 7.2, 7.3_

  - [x] 17.2 编写报告生成属性测试
    - **Property 18: Report Structure Validity**
    - **Property 19: Report Export Validity**
    - **Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5**

  - [x] 17.3 实现报告展示和导出 UI
    - 创建报告展示组件
    - 实现 Markdown/HTML 导出
    - _Requirements: 7.4, 7.5_

- [x] 18. Checkpoint - 搜索和报告验证
  - 确保所有测试通过
  - 验证自然语言搜索功能
  - 验证报告生成和导出功能

- [x] 19. AI Store 状态管理
  - [x] 19.1 实现 useAIStore
    - 创建 `src/store/useAIStore.ts`
    - 集成所有 AI 服务
    - 实现状态管理和操作方法
    - _Requirements: All_

  - [x] 19.2 集成到现有页面
    - 更新 AI.tsx 页面使用新 store
    - 添加 AI 功能入口到相关页面
    - _Requirements: All_

- [x] 20. UI 完善和用户体验
  - [x] 20.1 实现进度指示和加载状态
    - 添加批量处理进度条
    - 添加操作状态提示
    - _Requirements: 2.6_

  - [x] 20.2 实现用量统计 UI
    - 创建用量统计展示组件
    - 显示 token 使用量和成本估算
    - 实现限额设置界面
    - _Requirements: 9.2, 9.3_

  - [x] 20.3 实现提示词模板管理 UI
    - 创建模板编辑界面
    - 实现模板预览和重置
    - _Requirements: 8.1, 8.2, 8.3_

- [x] 21. Final Checkpoint - 完整功能验证
  - 确保所有测试通过
  - 验证所有 AI 功能端到端流程
  - 验证错误处理和 fallback 行为
  - 验证用量追踪和限额控制

## Notes

- 所有任务都是必做项，包括属性测试
- 每个 Checkpoint 确保阶段性功能完整可用
- 属性测试使用 fast-check 库，每个测试运行 100 次迭代
- 所有 AI 功能都有 fallback 行为，确保在 API 不可用时不影响核心功能
