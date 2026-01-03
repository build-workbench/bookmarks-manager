# Implementation Plan: AI Bookmark Cleanup Workflow

## Overview

本实现计划将AI辅助书签整理工作流分解为可执行的编码任务。采用增量开发方式，从核心数据层开始，逐步构建UI组件和AI集成。使用TypeScript + React + Zustand技术栈，与现有项目保持一致。

## Tasks

- [x] 1. 设置项目结构和核心类型
  - [x] 1.1 创建类型定义文件 `src/cleanup/types.ts`
    - 定义 AICleanupRecommendation, SuggestedFolder, BookmarkMove, CleanupOperation 等类型
    - 定义 CleanupFilters, CleanupSession 类型
    - _Requirements: 2.1, 2.2, 2.3, 3.1, 7.1_

  - [x] 1.2 扩展数据库schema `src/utils/db.ts`
    - 添加 cleanupSessions 表用于持久化工作流状态
    - 添加 saveCleanupSession, loadCleanupSession, deleteCleanupSession 方法
    - _Requirements: 4.5_

  - [ ]* 1.3 编写工作流状态持久化属性测试
    - **Property 11: Workflow State Persistence Round-Trip**
    - **Validates: Requirements 4.5**

- [x] 2. 实现清理服务层
  - [x] 2.1 创建筛选服务 `src/cleanup/services/filterService.ts`
    - 实现 filterByDomain, filterByFolder, filterByDateRange, filterByRecommendation 函数
    - 实现 combineFilters 函数（AND逻辑组合）
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

  - [ ]* 2.2 编写筛选逻辑属性测试
    - **Property 15: Filter Logic Correctness**
    - **Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7**

  - [x] 2.3 创建清理操作服务 `src/cleanup/services/cleanupService.ts`
    - 实现 deleteBookmarks 函数（批量删除，支持事务回滚）
    - 实现 moveBookmarks 函数（批量移动书签到新路径）
    - 实现 createFolder 函数（创建新文件夹，检查重复）
    - _Requirements: 1.4, 1.5, 1.6, 3.5, 3.7_

  - [ ]* 2.4 编写删除操作属性测试
    - **Property 2: Deletion Removes Bookmarks**
    - **Property 3: Deletion Rollback on Error**
    - **Validates: Requirements 1.4, 1.5, 1.6**

  - [ ]* 2.5 编写文件夹操作属性测试
    - **Property 8: Move Operation Updates Path**
    - **Property 9: Duplicate Folder Prevention**
    - **Validates: Requirements 3.5, 3.6, 3.7**

- [ ] 3. Checkpoint - 确保服务层测试通过
  - 运行所有测试，确保服务层功能正确
  - 如有问题请询问用户

- [x] 4. 实现撤销服务
  - [x] 4.1 创建撤销服务 `src/cleanup/services/undoService.ts`
    - 实现 OperationHistory 类（管理操作历史栈）
    - 实现 recordOperation 方法（记录删除/移动/创建操作）
    - 实现 undo 方法（撤销最近操作，恢复状态）
    - 实现 canUndo 方法（检查是否可撤销）
    - 限制历史记录最多10条
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

  - [ ]* 4.2 编写撤销服务属性测试
    - **Property 16: Operation History Recording**
    - **Property 17: Undo Restores Previous State**
    - **Property 18: Undo History Capacity**
    - **Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5**

- [x] 5. 实现状态管理
  - [x] 5.1 创建清理工作流Store `src/store/useCleanupStore.ts`
    - 实现选择状态管理（selectedBookmarkIds, toggleSelection, selectAll, deselectAll）
    - 实现工作流阶段管理（currentStage, setStage）
    - 实现筛选状态管理（filters, setFilters）
    - 集成 cleanupService 和 undoService
    - 实现会话持久化（保存/加载/重置）
    - _Requirements: 1.1, 1.2, 1.3, 4.1, 4.3, 4.4, 4.5_

  - [ ]* 5.2 编写选择状态属性测试
    - **Property 1: Selection State Consistency**
    - **Validates: Requirements 1.1, 1.2, 1.3**

  - [ ]* 5.3 编写阶段导航属性测试
    - **Property 10: Stage Navigation Validity**
    - **Validates: Requirements 4.1, 4.3, 4.4**

- [ ] 6. Checkpoint - 确保状态管理测试通过
  - 运行所有测试，确保状态管理功能正确
  - 如有问题请询问用户

- [x] 7. 扩展AI服务
  - [x] 7.1 创建AI清理分析服务 `src/ai/cleanupAnalysis.ts`
    - 实现 analyzeForCleanup 函数（分析书签，返回删除/保留/待审建议）
    - 实现 suggestFolderStructure 函数（建议文件夹结构）
    - 添加清理分析的提示词模板
    - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.2_

  - [ ]* 7.2 编写AI建议结构属性测试
    - **Property 4: AI Recommendation Structure Validity**
    - **Property 7: Folder Suggestion Validity**
    - **Validates: Requirements 2.1, 2.2, 2.3, 3.1, 3.2**

  - [x] 7.3 实现建议分组和接受逻辑
    - 实现 groupRecommendationsByType 函数
    - 在Store中实现 acceptRecommendation, rejectRecommendation, acceptAllOfType
    - _Requirements: 2.4, 2.5, 2.6_

  - [ ]* 7.4 编写建议处理属性测试
    - **Property 5: Recommendation Grouping Correctness**
    - **Property 6: Accept Recommendation Selects Bookmarks**
    - **Validates: Requirements 2.4, 2.5, 2.6**

- [x] 8. 实现UI组件 - 书签选择器
  - [x] 8.1 创建筛选面板组件 `src/cleanup/components/FilterPanel.tsx`
    - 域名筛选下拉框
    - 文件夹筛选下拉框
    - 日期范围选择器
    - AI建议状态筛选
    - 筛选结果计数显示
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.7_

  - [x] 8.2 创建书签选择器组件 `src/cleanup/components/BookmarkSelector.tsx`
    - 书签列表（带复选框）
    - 全选/取消全选按钮
    - 已选数量显示
    - 集成筛选面板
    - _Requirements: 1.1, 1.2, 1.3_

- [x] 9. 实现UI组件 - AI建议展示
  - [x] 9.1 创建AI建议组件 `src/cleanup/components/AIRecommendations.tsx`
    - 按类型分组显示建议（删除/保留/待审）
    - 显示每个建议的原因和置信度
    - 接受/拒绝单个建议按钮
    - 批量接受按钮
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6_

- [x] 10. 实现UI组件 - 分类管理器
  - [x] 10.1 创建文件夹树组件 `src/cleanup/components/FolderTree.tsx`
    - 可展开/折叠的文件夹结构
    - 显示每个文件夹的书签数量
    - 支持拖拽书签到文件夹
    - _Requirements: 3.3, 3.6, 5.1, 5.2_

  - [x] 10.2 创建分类管理器组件 `src/cleanup/components/CategoryManager.tsx`
    - 当前文件夹结构显示
    - AI建议的文件夹结构显示
    - 创建新文件夹功能
    - 接受AI分类建议功能
    - _Requirements: 3.3, 3.4, 3.5_

- [x] 11. 实现UI组件 - 导出预览
  - [x] 11.1 创建导出预览组件 `src/cleanup/components/ExportPreview.tsx`
    - 完整文件夹树预览
    - 变更摘要（删除数、移动数、新文件夹数）
    - 高亮显示变更项
    - 导出按钮
    - _Requirements: 5.1, 5.2, 5.3, 5.5, 5.6_

  - [ ]* 11.2 编写导出相关属性测试
    - **Property 12: Folder Tree Completeness**
    - **Property 13: Export HTML Round-Trip**
    - **Property 14: Change Summary Accuracy**
    - **Validates: Requirements 5.1, 5.2, 5.5, 5.6**

- [x] 12. 实现工作流阶段组件
  - [x] 12.1 创建审查删除阶段 `src/cleanup/stages/ReviewDeleteStage.tsx`
    - 集成 BookmarkSelector 和 AIRecommendations
    - AI分析按钮
    - 删除选中按钮
    - 进入下一阶段按钮
    - _Requirements: 4.1, 4.6_

  - [x] 12.2 创建整理分类阶段 `src/cleanup/stages/OrganizeStage.tsx`
    - 集成 CategoryManager
    - AI分类建议按钮
    - 返回上一阶段/进入下一阶段按钮
    - _Requirements: 4.1, 4.3, 4.4_

  - [x] 12.3 创建预览导出阶段 `src/cleanup/stages/PreviewExportStage.tsx`
    - 集成 ExportPreview
    - 返回上一阶段按钮
    - 确认导出按钮
    - _Requirements: 4.1, 4.3, 4.4, 5.5_

- [x] 13. 实现工作流容器和页面
  - [x] 13.1 创建工作流容器 `src/cleanup/CleanupWorkflow.tsx`
    - 阶段进度指示器
    - 阶段切换逻辑
    - 撤销按钮
    - 未保存变更警告
    - _Requirements: 4.1, 4.2, 7.3, 7.6_

  - [x] 13.2 创建清理页面 `src/pages/Cleanup.tsx`
    - 集成 CleanupWorkflow
    - 添加到应用路由
    - _Requirements: 4.1_

- [x] 14. 集成和路由配置
  - [x] 14.1 更新应用路由 `src/App.tsx`
    - 添加 /cleanup 路由
    - 添加导航菜单项
    - _Requirements: 4.1_

- [x] 15. Final Checkpoint - 确保所有测试通过
  - 运行完整测试套件
  - 验证所有功能正常工作
  - 如有问题请询问用户

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- 使用 fast-check 进行属性测试，与现有项目测试框架保持一致
