## Context

书签管理器 v1.1.0 已实现核心功能：导入、去重、搜索、导出和 AI 分析。用户反馈需要更高效的书签组织能力，特别是批量操作和标签管理。

**当前架构：**

- 状态管理：Zustand stores（bookmarksStore, settingsStore）
- 数据持久化：IndexedDB via Dexie (v3)
- UI 组件：React 函数组件 + Tailwind CSS
- 路由：HashRouter (6 个页面)

**约束：**

- Local-first：所有数据必须存储在客户端
- PWA 兼容：无服务端依赖
- 向后兼容：旧导出文件可正常导入

## Goals / Non-Goals

**Goals:**

1. 实现书签多选系统，支持全选/反选/范围选择
2. 实现批量操作：添加/移除标签、删除、导出
3. 实现完整的标签系统：CRUD、搜索、统计
4. 实现统一的高级过滤 UI，支持保存预设
5. 数据库平滑迁移，无数据丢失

**Non-Goals:**

1. 标签层级/嵌套（未来版本考虑）
2. 标签颜色自定义（未来版本考虑）
3. 云同步标签（v2.0 功能）
4. 标签导入/导出到浏览器书签（浏览器不支持）

## Decisions

### D1: 标签存储方案

**决策：** 标签作为书签的字段存储，同时维护独立的标签元数据表。

```typescript
// 书签表扩展
interface StoredBookmark extends Bookmark {
  // ... existing fields
  tags: string[] // 标签 ID 数组
}

// 新增标签表
interface Tag {
  id: string // 标签 ID (slug)
  name: string // 显示名称
  count: number // 使用次数（缓存）
  createdAt: number
  updatedAt: number
}
```

**理由：**

- 书签内嵌标签数组：查询快、无需 JOIN
- 独立标签表：管理元数据、统计使用次数、支持重命名

**替代方案：**

- ❌ 多对多关系表：查询复杂、性能差
- ❌ 纯字符串标签：无元数据、重命名困难

### D2: 选择状态管理

**决策：** 使用独立的 Zustand store 管理选择状态。

```typescript
interface SelectionState {
  mode: 'none' | 'single' | 'multi'
  selectedIds: Set<string>
  lastSelectedId: string | null

  // Actions
  toggleSelect: (id: string) => void
  selectRange: (startId: string, endId: string) => void
  selectAll: () => void
  clearSelection: () => void
}
```

**理由：**

- 选择状态是临时 UI 状态，不需要持久化
- 与 bookmarksStore 解耦，避免不必要的重渲染
- 支持跨页面选择（未来扩展）

### D3: 批量操作策略

**决策：** 使用 Web Worker 处理大规模批量操作（>100 项）。

```typescript
// 批量操作 Worker 消息类型
type BatchOperationMessage =
  | { type: 'add-tags'; bookmarkIds: string[]; tagIds: string[] }
  | { type: 'remove-tags'; bookmarkIds: string[]; tagIds: string[] }
  | { type: 'delete'; bookmarkIds: string[] }

// Worker 返回进度
type BatchProgress = {
  current: number
  total: number
  operation: string
}
```

**理由：**

- 已有 Web Worker 基础设施（v1.1.0）
- 大规模操作不阻塞 UI 线程
- 支持进度反馈和取消

**替代方案：**

- ❌ 主线程批量操作：>1000 书签时 UI 卡顿
- ❌ 分片 setTimeout：代码复杂、进度不精确

### D4: 过滤预设存储

**决策：** 将过滤预设存储在 IndexedDB。

```typescript
interface FilterPreset {
  id: string
  name: string
  filters: {
    domains?: string[]
    folders?: string[]
    tags?: string[]
    dateRange?: { start: number; end: number }
    searchQuery?: string
  }
  createdAt: number
  updatedAt: number
}
```

**理由：**

- 用户可能创建多个预设，需要持久化
- 与设置分离，支持导出/导入
- IndexedDB 容量远超 localStorage

### D5: 数据库迁移策略

**决策：** 使用 Dexie 内置迁移，增量升级至 v4。

```typescript
// db.ts 迁移逻辑
this.version(4).stores({
  bookmarks: 'id, url, normalized, title, sourceFile, *tags', // 添加 tags 索引
  settings: 'id',
  aiConfig: 'id',
  aiCache: 'id, type, expiresAt',
  aiUsage: '++id, timestamp, operation',
  aiPrompts: 'id, isDefault',
  aiUsageLimits: 'id',
  cleanupSessions: 'id, updatedAt',
  tags: 'id, name, count', // 新增
  filterPresets: 'id, name' // 新增
})

// 迁移：为现有书签添加空 tags 数组
this.version(4).upgrade(async (tx) => {
  const bookmarks = await tx.table<StoredBookmark>('bookmarks').toArray()
  for (const bm of bookmarks) {
    if (!bm.tags) {
      await tx.table('bookmarks').update(bm.id, { tags: [] })
    }
  }
})
```

**理由：**

- Dexie 自动处理版本升级
- 升级函数确保数据完整性
- 无需手动迁移脚本

## Architecture

### 组件结构

```
src/
├── components/
│   ├── selection/
│   │   ├── SelectionBar.tsx        # 批量操作工具栏
│   │   ├── SelectionCheckbox.tsx   # 单项选择框
│   │   └── SelectionCounter.tsx    # 选择计数显示
│   ├── tags/
│   │   ├── TagBadge.tsx            # 标签徽章
│   │   ├── TagInput.tsx            # 标签输入组件
│   │   ├── TagManager.tsx          # 标签管理面板
│   │   └── TagCloud.tsx            # 标签云
│   └── filter/
│       ├── FilterPanel.tsx         # 统一过滤面板
│       ├── DateRangePicker.tsx     # 日期范围选择
│       ├── DomainSelector.tsx      # 多域名选择
│       ├── TagSelector.tsx         # 标签选择器
│       └── PresetManager.tsx       # 预设管理
├── store/
│   ├── selectionStore.ts           # 选择状态
│   ├── tagStore.ts                 # 标签状态
│   └── filterStore.ts              # 过滤状态
├── workers/
│   └── batchWorker.ts              # 批量操作 Worker
└── pages/
    ├── Tags.tsx                    # 标签管理页面
    └── Search.tsx                  # 增强的搜索页面
```

### 数据流

```
用户选择书签
    │
    ▼
SelectionStore (UI 状态)
    │
    ├─── 批量操作 ───▶ BatchWorker ───▶ IndexedDB
    │                      │
    │                      ▼
    │                 TagStore/bookmarksStore
    │
    └─── 过滤 ───▶ FilterStore ───▶ UI 更新
```

## Risks / Trade-offs

### R1: 大规模标签操作性能

**风险：** 用户有 >5000 书签，批量添加标签可能导致 UI 卡顿。

**缓解：**

- 使用 Web Worker 处理 >100 项的操作
- 显示进度条，支持取消
- 分批提交（每批 100 项）

### R2: 标签重命名一致性

**风险：** 重命名标签时，需要更新所有使用该标签的书签。

**缓解：**

- 在事务中执行重命名
- 使用 Dexie 的 `where('tags').equals()` 查询
- 显示影响的书签数量确认

### R3: 数据库迁移失败

**风险：** v3 → v4 迁移过程中断可能导致数据损坏。

**缓解：**

- 迁移前自动备份到 localStorage
- 提供手动恢复入口
- 迁移使用事务，失败自动回滚

### R4: 标签名称冲突

**风险：** 用户创建同名标签（不同大小写）导致混乱。

**缓解：**

- 标签 ID 使用 slug 化（小写 + 连字符）
- 显示名称保持用户输入
- 重名时自动追加数字后缀

## Migration Plan

### 阶段 1: 数据库扩展（低风险）

1. 添加 tags 和 filterPresets 表
2. 为 bookmarks 添加 tags 字段
3. 现有数据自动获得空 tags 数组

### 阶段 2: UI 组件（无破坏性）

1. 添加选择组件和批量操作栏
2. 添加标签组件
3. 添加过滤面板

### 阶段 3: 功能集成

1. 搜索页面集成选择和过滤
2. 仪表盘添加标签云
3. 新增标签管理页面

### 回滚策略

- 数据库迁移不可逆，但旧版本可忽略新字段
- UI 组件可通过特性开关禁用
- 导出功能保持兼容，不包含 tags 字段（除非 JSON 格式）

## Open Questions

1. **标签自动推荐：** 是否需要 AI 辅助标签推荐？（建议：v1.2.1 考虑）
2. **标签导入：** 是否支持从第三方服务导入标签？（建议：暂不支持）
3. **标签颜色：** 用户反馈是否强烈需要颜色自定义？（需要用户调研）
