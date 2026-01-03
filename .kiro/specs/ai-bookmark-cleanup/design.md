# Design Document: AI Bookmark Cleanup Workflow

## Overview

AI辅助书签整理工作流是一个集成在现有书签管理应用中的新功能模块。它提供一个分步骤的整理界面，结合AI智能分析能力，帮助用户高效地清理无用书签、重新组织分类结构，并最终导出为标准HTML格式。

该功能遵循现有应用的Local-first原则，所有操作在本地完成，AI分析使用用户自己的API Key（BYOK模式）。

## Architecture

### 模块架构

```
src/
├── pages/
│   └── Cleanup.tsx              # 整理工作流主页面
├── store/
│   └── useCleanupStore.ts       # 整理工作流状态管理
├── cleanup/
│   ├── types.ts                 # 类型定义
│   ├── CleanupWorkflow.tsx      # 工作流容器组件
│   ├── stages/
│   │   ├── ReviewDeleteStage.tsx    # 审查删除阶段
│   │   ├── OrganizeStage.tsx        # 整理分类阶段
│   │   └── PreviewExportStage.tsx   # 预览导出阶段
│   ├── components/
│   │   ├── BookmarkSelector.tsx     # 书签选择器
│   │   ├── AIRecommendations.tsx    # AI建议展示
│   │   ├── CategoryManager.tsx      # 分类管理器
│   │   ├── FolderTree.tsx           # 文件夹树
│   │   ├── ExportPreview.tsx        # 导出预览
│   │   └── FilterPanel.tsx          # 筛选面板
│   └── services/
│       ├── cleanupService.ts        # 清理操作服务
│       └── undoService.ts           # 撤销服务
└── ai/
    └── cleanupAnalysis.ts           # AI清理分析（扩展现有AI服务）
```

### 数据流

```
用户操作 → useCleanupStore → cleanupService → useBookmarksStore → IndexedDB
                ↓
         AI分析请求 → aiService → LLM API
                ↓
         undoService（记录操作历史）
```

## Components and Interfaces

### 1. CleanupStore (Zustand)

```typescript
interface CleanupState {
  // 工作流状态
  currentStage: 'review' | 'organize' | 'preview';
  workflowStarted: boolean;
  
  // 选择状态
  selectedBookmarkIds: Set<string>;
  
  // AI建议
  aiRecommendations: AICleanupRecommendation[];
  isAnalyzing: boolean;
  
  // 分类建议
  suggestedFolders: SuggestedFolder[];
  pendingMoves: BookmarkMove[];
  
  // 操作历史
  operationHistory: CleanupOperation[];
  
  // 筛选条件
  filters: CleanupFilters;
  
  // Actions
  setStage: (stage: CleanupState['currentStage']) => void;
  toggleBookmarkSelection: (id: string) => void;
  selectAll: (ids: string[]) => void;
  deselectAll: () => void;
  deleteSelected: () => Promise<void>;
  requestAIAnalysis: () => Promise<void>;
  acceptRecommendation: (id: string) => void;
  rejectRecommendation: (id: string) => void;
  moveBookmarks: (bookmarkIds: string[], targetFolder: string[]) => void;
  undo: () => void;
  setFilters: (filters: Partial<CleanupFilters>) => void;
  resetWorkflow: () => void;
}
```

### 2. AI Cleanup Analysis Types

```typescript
interface AICleanupRecommendation {
  bookmarkId: string;
  recommendation: 'delete' | 'keep' | 'review';
  reason: string;
  reasonType: 'duplicate' | 'broken' | 'outdated' | 'low_quality' | 'valuable';
  confidence: number; // 0-100
  accepted?: boolean;
}

interface SuggestedFolder {
  name: string;
  path: string[];
  description: string;
  suggestedBookmarkIds: string[];
}

interface BookmarkMove {
  bookmarkId: string;
  fromPath: string[];
  toPath: string[];
}

interface CleanupOperation {
  id: string;
  type: 'delete' | 'move' | 'create_folder';
  timestamp: number;
  data: DeleteOperation | MoveOperation | CreateFolderOperation;
}

interface DeleteOperation {
  bookmarks: Bookmark[];
}

interface MoveOperation {
  moves: BookmarkMove[];
}

interface CreateFolderOperation {
  path: string[];
}
```

### 3. Filter Types

```typescript
interface CleanupFilters {
  domain?: string;
  folder?: string[];
  dateRange?: {
    start: number;
    end: number;
  };
  recommendationStatus?: 'delete' | 'keep' | 'review' | 'all';
  searchQuery?: string;
}
```

### 4. Component Interfaces

```typescript
// BookmarkSelector Props
interface BookmarkSelectorProps {
  bookmarks: Bookmark[];
  selectedIds: Set<string>;
  recommendations: Map<string, AICleanupRecommendation>;
  onToggleSelect: (id: string) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}

// AIRecommendations Props
interface AIRecommendationsProps {
  recommendations: AICleanupRecommendation[];
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  onAcceptAll: (type: 'delete' | 'keep') => void;
}

// CategoryManager Props
interface CategoryManagerProps {
  currentFolders: FolderNode[];
  suggestedFolders: SuggestedFolder[];
  pendingMoves: BookmarkMove[];
  onCreateFolder: (path: string[]) => void;
  onMoveBookmarks: (bookmarkIds: string[], targetPath: string[]) => void;
  onAcceptSuggestion: (suggestion: SuggestedFolder) => void;
}

// ExportPreview Props
interface ExportPreviewProps {
  folderTree: FolderNode[];
  changes: {
    deleted: number;
    moved: number;
    newFolders: number;
  };
  onExport: () => void;
  onBack: () => void;
}
```

## Data Models

### 扩展现有数据模型

```typescript
// 扩展 Bookmark 类型（用于清理工作流）
interface CleanupBookmark extends Bookmark {
  aiRecommendation?: AICleanupRecommendation;
  isSelected?: boolean;
  pendingMove?: string[]; // 待移动的目标路径
}

// 工作流会话状态（持久化到 IndexedDB）
interface CleanupSession {
  id: string;
  startedAt: number;
  currentStage: 'review' | 'organize' | 'preview';
  selectedBookmarkIds: string[];
  pendingDeletes: string[];
  pendingMoves: BookmarkMove[];
  operationHistory: CleanupOperation[];
}
```

### IndexedDB Schema 扩展

```typescript
// 在 db.ts 中添加
interface CleanupSessionTable {
  id: string;
  session: CleanupSession;
  updatedAt: number;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Selection State Consistency

*For any* bookmark selection operation (toggle, selectAll, deselectAll), the selectedBookmarkIds set should accurately reflect the intended selection state, and the displayed count should equal the size of the set.

**Validates: Requirements 1.1, 1.2, 1.3**

### Property 2: Deletion Removes Bookmarks

*For any* set of selected bookmark IDs, after successful deletion, none of those bookmarks should exist in the database, and the bookmark count in stats should decrease by the number of deleted items.

**Validates: Requirements 1.4, 1.5**

### Property 3: Deletion Rollback on Error

*For any* deletion operation that fails, the bookmarks should remain unchanged in the database (rollback behavior).

**Validates: Requirements 1.6**

### Property 4: AI Recommendation Structure Validity

*For any* AI cleanup recommendation, it must have: (1) a recommendation type of 'delete', 'keep', or 'review', (2) a non-empty reason string, and (3) a confidence score between 0 and 100 inclusive.

**Validates: Requirements 2.1, 2.2, 2.3**

### Property 5: Recommendation Grouping Correctness

*For any* list of AI recommendations, grouping by recommendation type should produce groups where every item in each group has the matching recommendation type.

**Validates: Requirements 2.4**

### Property 6: Accept Recommendation Selects Bookmarks

*For any* accepted delete recommendation, the corresponding bookmark ID should be added to selectedBookmarkIds.

**Validates: Requirements 2.5, 2.6**

### Property 7: Folder Suggestion Validity

*For any* AI folder suggestion, all suggested bookmark IDs must exist in the current bookmark set.

**Validates: Requirements 3.1, 3.2**

### Property 8: Move Operation Updates Path

*For any* bookmark move operation, after the move, the bookmark's path should equal the target path.

**Validates: Requirements 3.5, 3.6**

### Property 9: Duplicate Folder Prevention

*For any* folder creation attempt with a name that already exists at the same level, the operation should be rejected.

**Validates: Requirements 3.7**

### Property 10: Stage Navigation Validity

*For any* stage transition, the workflow should only allow valid transitions (forward to next stage or backward to previous stage), and the currentStage should always be one of 'review', 'organize', or 'preview'.

**Validates: Requirements 4.1, 4.3, 4.4**

### Property 11: Workflow State Persistence Round-Trip

*For any* cleanup session state, saving to IndexedDB and then loading should produce an equivalent state.

**Validates: Requirements 4.5**

### Property 12: Folder Tree Completeness

*For any* set of non-deleted bookmarks, the export preview folder tree should contain all of them organized by their paths, and each folder's bookmark count should match the actual number of bookmarks in that folder.

**Validates: Requirements 5.1, 5.2**

### Property 13: Export HTML Round-Trip

*For any* set of bookmarks, exporting to Netscape HTML and then parsing should produce an equivalent set of bookmarks (preserving title, URL, and folder structure).

**Validates: Requirements 5.5**

### Property 14: Change Summary Accuracy

*For any* cleanup session, the summary counts (deleted, moved, new folders) should match the actual operations recorded in the operation history.

**Validates: Requirements 5.6**

### Property 15: Filter Logic Correctness

*For any* combination of filters (domain, folder, date range, recommendation status), the filtered result should contain only bookmarks that satisfy ALL filter criteria (AND logic).

**Validates: Requirements 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7**

### Property 16: Operation History Recording

*For any* delete or move operation, an entry should be added to operationHistory with the correct type and sufficient data to reverse the operation.

**Validates: Requirements 7.1, 7.2**

### Property 17: Undo Restores Previous State

*For any* operation in the history, undoing it should restore the affected bookmarks to their state before the operation (deleted bookmarks restored, moved bookmarks at original path).

**Validates: Requirements 7.3, 7.5**

### Property 18: Undo History Capacity

*For any* sequence of operations, the history should maintain at least the 10 most recent operations for undo.

**Validates: Requirements 7.4**

## Error Handling

### API Errors

- **AI Analysis Failure**: Display error message, allow retry, fall back to manual cleanup mode
- **Rate Limiting (429)**: Show wait time, queue requests with exponential backoff
- **Invalid API Key**: Prompt user to check AI settings

### Data Errors

- **Deletion Failure**: Rollback transaction, restore bookmarks, show error message
- **Move Failure**: Rollback move operation, keep bookmark at original path
- **Session Load Failure**: Start fresh session, warn user about lost progress

### Validation Errors

- **Duplicate Folder Name**: Show inline error, prevent creation
- **Invalid Filter**: Reset to default filter, show warning
- **Empty Selection**: Disable delete button, show tooltip

## Testing Strategy

### Unit Tests

Unit tests verify specific examples and edge cases:

- Filter functions with various input combinations
- Folder tree building with nested structures
- Change summary calculation
- Stage transition validation

### Property-Based Tests

Property-based tests verify universal properties across all inputs using fast-check:

- **Selection operations**: Toggle, selectAll, deselectAll maintain consistency
- **Filter logic**: Combined filters produce correct AND results
- **Undo operations**: Undo restores exact previous state
- **Export round-trip**: HTML export/parse preserves data

### Test Configuration

- Minimum 100 iterations per property test
- Each property test references its design document property
- Tag format: **Feature: ai-bookmark-cleanup, Property {number}: {property_text}**

### Test Files

```
src/cleanup/
├── services/
│   ├── cleanupService.test.ts    # Deletion, move operations
│   ├── undoService.test.ts       # Undo/redo functionality
│   └── filterService.test.ts     # Filter logic
├── components/
│   └── __tests__/
│       ├── BookmarkSelector.test.tsx
│       └── CategoryManager.test.tsx
└── cleanup.property.test.ts      # Property-based tests
```

