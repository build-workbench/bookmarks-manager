## Why

当前书签管理器支持书签导入、去重、搜索和 AI 分析，但缺乏批量操作和标签管理能力。用户无法高效地对大量书签进行分类整理，必须逐个处理，效率低下。

**核心痛点：**

1. 无法多选书签进行批量操作（删除、移动、分类）
2. 缺乏标签系统，无法灵活组织书签
3. 过滤功能存在但 UI 分散，无法保存常用过滤条件

**为什么现在做：**

- v1.1.0 已完成基础功能稳定，用户反馈需要更好的组织管理工具
- 批量编辑和标签是路线图中 v1.2.0 的核心功能，优先级 P2

## What Changes

### 新增功能

- **书签多选系统**
  - 全选/反选/范围选择
  - 选择计数显示
  - 选择模式切换

- **批量操作**
  - 批量添加/移除标签
  - 批量删除（含确认机制）
  - 批量修改文件夹路径
  - 批量导出选中项

- **标签系统**
  - 为书签添加多个标签
  - 标签管理（创建、重命名、删除、合并）
  - 按标签搜索和过滤
  - 标签统计和可视化

- **高级过滤 UI**
  - 统一的过滤面板
  - 日期范围选择器
  - 多域名选择器
  - 标签选择器
  - 保存过滤预设

### 数据模型变更

- **BREAKING** 数据库版本升级至 v4
  - `bookmarks` 表新增 `tags` 字段（字符串数组）
  - 新增 `tags` 表存储标签定义和使用统计
  - 新增 `filterPresets` 表存储用户保存的过滤预设

## Capabilities

### New Capabilities

- `batch-operations`: 书签多选和批量操作（删除、标签、导出）
- `tag-system`: 标签系统，包括标签 CRUD、按标签搜索、标签统计
- `advanced-filtering`: 高级过滤 UI，包括日期范围、多域名、标签过滤和预设保存

### Modified Capabilities

- `core-bookmarks`: 扩展 REQUIREMENTS 以支持标签字段和批量操作
  - Requirement 8 (本地数据持久化): 新增 tags 表和 filterPresets 表
  - Requirement 6 (高级过滤与导出): 增强过滤能力支持标签和预设

## Impact

### 数据库迁移

- Dexie 版本升级 v3 → v4
- 现有 bookmarks 数据自动迁移（tags 默认为空数组）

### 受影响代码

- `src/utils/db.ts` - 数据库 schema 和迁移逻辑
- `src/utils/bookmarkParser.ts` - Bookmark 类型定义
- `src/pages/Search.tsx` - 搜索页面增强
- `src/pages/Dashboard.tsx` - 仪表盘选择和批量操作
- `src/store/` - 新增 selectionStore, tagStore, filterStore
- `src/components/` - 新增多选组件、标签组件、过滤面板组件

### UI 变更

- 搜索页面新增选择模式和批量操作栏
- 仪表盘新增标签云和标签统计
- 新增标签管理页面
- 过滤器支持保存为预设

### 兼容性

- 导出的 HTML 格式保持兼容（标签存储在 data 属性）
- JSON 导出包含 tags 字段
- 向后兼容：旧版本导出的书签可正常导入
