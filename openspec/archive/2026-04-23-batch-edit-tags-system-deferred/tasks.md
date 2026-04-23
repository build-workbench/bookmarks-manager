# Implementation Tasks

## Phase 1: 数据模型与迁移 (预估 4-6 小时)

### Task 1.1: 数据库 Schema 升级

**要求:** batch-operations R1, tag-system R1
**预估:** 2 小时

- [ ] 在 `src/utils/db.ts` 中添加 `Tag` 和 `FilterPreset` 接口
- [ ] 升级 Dexie schema 至 v4，添加 `tags` 和 `filterPresets` 表
- [ ] 为 `bookmarks` 表添加 `tags` 索引 (`*tags`)
- [ ] 编写迁移函数，为现有书签添加空 `tags` 数组
- [ ] 添加标签相关的 CRUD 函数
- [ ] 编写数据库迁移测试

**验收检查点:**

```bash
npm run test -- db.test.ts
npm run build
```

### Task 1.2: Bookmark 类型扩展

**要求:** tag-system R1
**预估:** 1 小时

- [ ] 在 `src/utils/bookmarkParser.ts` 中扩展 `Bookmark` 类型，添加 `tags?: string[]`
- [ ] 更新 `StoredBookmark` 接口，确保 `tags` 必选
- [ ] 更新导入逻辑，支持从 HTML `data-tags` 属性解析标签
- [ ] 更新导出逻辑，支持标签导出到 HTML 和 JSON

**验收检查点:**

```bash
npm run typecheck
npm run test -- bookmarkParser.test.ts
```

### Task 1.3: 标签工具函数

**要求:** tag-system R6
**预估:** 1 小时

- [ ] 创建 `src/utils/tagUtils.ts`
- [ ] 实现 `slugifyTagName(name: string): string` - 标签名称转 slug
- [ ] 实现 `validateTagName(name: string): ValidationResult`
- [ ] 实现标签名称冲突检测和自动后缀逻辑
- [ ] 使用 fast-check 编写属性测试

**验收检查点:**

```bash
npm run test -- tagUtils.test.ts
```

---

## Phase 2: 状态管理 (预估 4-5 小时)

### Task 2.1: SelectionStore 实现

**要求:** batch-operations R1
**预估:** 2 小时

- [ ] 创建 `src/store/selectionStore.ts`
- [ ] 实现 `SelectionState` 接口
- [ ] 实现 actions: `toggleSelect`, `selectRange`, `selectAll`, `clearSelection`, `setMode`
- [ ] 添加选择计数 computed 值
- [ ] 编写单元测试

**验收检查点:**

```bash
npm run test -- selectionStore.test.ts
```

### Task 2.2: TagStore 实现

**要求:** tag-system R1-R3
**预估:** 2 小时

- [ ] 创建 `src/store/tagStore.ts`
- [ ] 实现 `TagState` 接口（tags 列表、加载状态、错误状态）
- [ ] 实现 actions: `loadTags`, `createTag`, `renameTag`, `deleteTag`, `mergeTags`
- [ ] 实现 `getTagsByBookmark(bookmarkId)` 选择器
- [ ] 实现 `getBookmarksByTag(tagId)` 选择器
- [ ] 编写单元测试

**验收检查点:**

```bash
npm run test -- tagStore.test.ts
```

### Task 2.3: FilterStore 实现

**要求:** advanced-filtering R1, R5
**预估:** 1.5 小时

- [ ] 创建 `src/store/filterStore.ts`
- [ ] 实现 `FilterState` 接口（domains, tags, dateRange, searchQuery）
- [ ] 实现 actions: `setFilter`, `clearFilter`, `clearAllFilters`
- [ ] 实现 `activeFilterCount` computed
- [ ] 实现 URL 参数同步（encode/decode）
- [ ] 编写单元测试

**验收检查点:**

```bash
npm run test -- filterStore.test.ts
```

---

## Phase 3: 批量操作 Worker (预估 3-4 小时)

### Task 3.1: BatchWorker 实现

**要求:** batch-operations R2-R3, R5
**预估:** 3 小时

- [ ] 创建 `src/workers/batchWorker.ts`
- [ ] 实现消息处理器：`add-tags`, `remove-tags`, `delete`
- [ ] 实现进度回调机制
- [ ] 实现取消机制（AbortController）
- [ ] 分批处理逻辑（每批 100 项）
- [ ] 编写 Worker 测试（使用 fake-indexeddb）

**验收检查点:**

```bash
npm run test -- batchWorker.test.ts
npm run build
```

---

## Phase 4: UI 组件 - 选择系统 (预估 4-5 小时)

### Task 4.1: SelectionCheckbox 组件

**要求:** batch-operations R1
**预估:** 1 小时

- [ ] 创建 `src/components/selection/SelectionCheckbox.tsx`
- [ ] 支持单选和范围选择（Shift+click）
- [ ] 样式与现有 UI 风格一致
- [ ] 编写组件测试

### Task 4.2: SelectionBar 组件

**要求:** batch-operations R2-R4
**预估:** 2 小时

- [ ] 创建 `src/components/selection/SelectionBar.tsx`
- [ ] 显示选择计数
- [ ] 批量操作按钮：添加标签、移除标签、删除、导出
- [ ] 确认对话框集成
- [ ] 进度条显示

### Task 4.3: SelectionCounter 组件

**要求:** batch-operations R1
**预估:** 0.5 小时

- [ ] 创建 `src/components/selection/SelectionCounter.tsx`
- [ ] 显示 "已选择 X 项"
- [ ] 全选/取消全选快捷操作

**验收检查点:**

```bash
npm run test -- selection/
npm run build
```

---

## Phase 5: UI 组件 - 标签系统 (预估 5-6 小时)

### Task 5.1: TagBadge 组件

**要求:** tag-system R1
**预估:** 1 小时

- [ ] 创建 `src/components/tags/TagBadge.tsx`
- [ ] 显示标签名称
- [ ] 可删除模式（带 X 按钮）
- [ ] 可点击过滤模式
- [ ] 不同尺寸（small, medium）

### Task 5.2: TagInput 组件

**要求:** tag-system R1
**预估:** 2 小时

- [ ] 创建 `src/components/tags/TagInput.tsx`
- [ ] 标签输入框 + 自动完成下拉
- [ ] 支持创建新标签（回车键）
- [ ] 支持选择现有标签
- [ ] 已选标签显示为可删除 badges

### Task 5.3: TagManager 组件

**要求:** tag-system R2
**预估:** 2 小时

- [ ] 创建 `src/components/tags/TagManager.tsx`
- [ ] 标签列表显示（名称、使用次数）
- [ ] 重命名功能（内联编辑）
- [ ] 删除功能（带确认）
- [ ] 合并功能（多选后合并）

### Task 5.4: TagCloud 组件

**要求:** tag-system R4
**预估:** 1 小时

- [ ] 创建 `src/components/tags/TagCloud.tsx`
- [ ] 字体大小基于使用次数
- [ ] 可点击过滤
- [ ] 最多显示 50 个标签

**验收检查点:**

```bash
npm run test -- tags/
npm run build
```

---

## Phase 6: UI 组件 - 过滤系统 (预估 4-5 小时)

### Task 6.1: FilterPanel 组件

**要求:** advanced-filtering R1
**预估:** 1.5 小时

- [ ] 创建 `src/components/filter/FilterPanel.tsx`
- [ ] 可折叠面板布局
- [ ] 活动过滤器显示为 chips
- [ ] Clear All 按钮

### Task 6.2: DateRangePicker 组件

**要求:** advanced-filtering R2
**预估:** 1.5 小时

- [ ] 创建 `src/components/filter/DateRangePicker.tsx`
- [ ] 预设选项：Today, Last 7 Days, Last 30 Days, Last Year, Custom
- [ ] 自定义日期选择器
- [ ] "Unknown" 日期选项

### Task 6.3: DomainSelector 组件

**要求:** advanced-filtering R3
**预估:** 1 小时

- [ ] 创建 `src/components/filter/DomainSelector.tsx`
- [ ] 多选下拉列表
- [ ] 搜索过滤功能
- [ ] 显示每个域名的书签数

### Task 6.4: TagSelector 组件

**要求:** advanced-filtering R4
**预估:** 1 小时

- [ ] 创建 `src/components/filter/TagSelector.tsx`
- [ ] 多选模式：Match All / Match Any
- [ ] 排除模式
- [ ] "Untagged" 选项

### Task 6.5: PresetManager 组件

**要求:** advanced-filtering R5
**预估:** 1 小时

- [ ] 创建 `src/components/filter/PresetManager.tsx`
- [ ] 保存预设对话框
- [ ] 预设列表下拉
- [ ] 应用/重命名/删除预设

**验收检查点:**

```bash
npm run test -- filter/
npm run build
```

---

## Phase 7: 页面集成 (预估 4-5 小时)

### Task 7.1: Search 页面增强

**要求:** batch-operations R1-R4, advanced-filtering R1-R7
**预估:** 2.5 小时

- [ ] 集成 FilterPanel 到 Search 页面
- [ ] 集成 SelectionCheckbox 到搜索结果列表
- [ ] 集成 SelectionBar（底部固定）
- [ ] 集成 TagInput 到书签详情/操作
- [ ] URL 参数同步
- [ ] 虚拟滚动兼容性

### Task 7.2: Dashboard 页面增强

**要求:** tag-system R4
**预估:** 1.5 小时

- [ ] 添加 TagCloud 到仪表盘
- [ ] 添加 "Untagged" 统计卡片
- [ ] 点击标签跳转搜索并过滤

### Task 7.3: Tags 管理页面

**要求:** tag-system R2-R4
**预估:** 1.5 小时

- [ ] 创建 `src/pages/Tags.tsx`
- [ ] 集成 TagManager
- [ ] 添加标签统计面板
- [ ] 添加路由配置

**验收检查点:**

```bash
npm run test
npm run build
```

---

## Phase 8: 导入导出增强 (预估 2-3 小时)

### Task 8.1: 导出功能增强

**要求:** tag-system R5, batch-operations R4
**预估:** 1.5 小时

- [ ] 更新 JSON 导出，包含 tags 字段
- [ ] 更新 HTML 导出，添加 data-tags 属性
- [ ] 更新 CSV 导出，添加 tags 列
- [ ] 更新 Markdown 导出，添加标签显示

### Task 8.2: 导入功能增强

**要求:** tag-system R5
**预估:** 1 小时

- [ ] 解析 JSON 文件中的 tags 字段
- [ ] 解析 HTML 文件中的 data-tags 属性
- [ ] 自动创建不存在的标签

**验收检查点:**

```bash
npm run test -- export.test.ts import.test.ts
npm run build
```

---

## Phase 9: 测试与文档 (预估 3-4 小时)

### Task 9.1: 端到端测试

**要求:** 所有需求
**预估:** 2 小时

- [ ] 编写批量操作 E2E 测试
- [ ] 编写标签管理 E2E 测试
- [ ] 编写过滤预设 E2E 测试
- [ ] 确保覆盖率达标

### Task 9.2: 文档更新

**预估:** 1 小时

- [ ] 更新 README.md 功能列表
- [ ] 更新 FEATURES.md
- [ ] 更新 CHANGELOG.md
- [ ] 更新 API 文档（如有）

**最终验收:**

```bash
npm run test
npm run build
npm run lint
```

---

## Summary

| Phase | 描述            | 预估时间 | 依赖       |
| ----- | --------------- | -------- | ---------- |
| 1     | 数据模型与迁移  | 4-6h     | -          |
| 2     | 状态管理        | 4-5h     | Phase 1    |
| 3     | 批量操作 Worker | 3-4h     | Phase 1    |
| 4     | UI - 选择系统   | 4-5h     | Phase 2    |
| 5     | UI - 标签系统   | 5-6h     | Phase 2    |
| 6     | UI - 过滤系统   | 4-5h     | Phase 2    |
| 7     | 页面集成        | 4-5h     | Phase 4-6  |
| 8     | 导入导出增强    | 2-3h     | Phase 1, 5 |
| 9     | 测试与文档      | 3-4h     | Phase 7, 8 |

**总计:** 33-43 小时

**建议迭代方式:**

1. Phase 1 完成后发布 checkpoint build
2. Phase 4-6 可并行开发
3. Phase 7 完成后进行集成测试
4. Phase 9 完成后发布 v1.2.0-beta
