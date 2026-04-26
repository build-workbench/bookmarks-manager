## REMOVED Requirements

### Requirement 1: 批量选择与删除书签

**Reason**: The dedicated cleanup workflow is retired from the final supported product surface to reduce route, state, and UI maintenance cost.
**Migration**: Remove `#/app/cleanup` entry points and cleanup-specific selection/deletion workflow code; keep any retained deletion or duplicate-handling behavior only where it is explicitly supported by core pages.

### Requirement 2: AI智能清理建议

**Reason**: AI-assisted cleanup recommendations are not part of the final core bookmark workflow and materially increase complexity.
**Migration**: Remove cleanup AI recommendation services, state, and UI, and stop documenting them as supported behavior.

### Requirement 3: AI智能分类整理

**Reason**: Folder-organization automation through the dedicated cleanup workflow is outside the final archive-ready scope.
**Migration**: Remove cleanup categorization flows, folder suggestion UI, and related state/history handling.

### Requirement 4: 整理工作流界面

**Reason**: The multi-stage cleanup wizard is the center of a high-maintenance secondary product surface that the repository will no longer support.
**Migration**: Remove the cleanup route, navigation entry, stage components, and workflow persistence/documentation.

### Requirement 5: 导出预览与确认

**Reason**: Export remains part of the core app, but the dedicated cleanup preview/export workflow is retired with the cleanup surface.
**Migration**: Keep supported export behavior in core export/backup flows only; remove cleanup-specific preview/export UI.

### Requirement 6: 快速筛选与过滤

**Reason**: Filter-heavy cleanup-specific review flows are not required once the dedicated cleanup surface is removed.
**Migration**: Preserve only the filtering behavior explicitly supported by core search pages; remove cleanup-only filters and docs.

### Requirement 7: 撤销与恢复操作

**Reason**: Cleanup-specific multi-step undo/history/session behavior is not justified for the final reduced product surface.
**Migration**: Remove cleanup operation history, undo stacks, and session persistence tied to the retired workflow.
