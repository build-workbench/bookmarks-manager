# 贡献指南

> 如何为 Bookmarks Manager 做出贡献

感谢您对 Bookmarks Manager 项目的关注！本文档提供贡献指南和说明。

## 目录

- [行为准则](#行为准则)
- [开始](#开始)
- [开发环境搭建](#开发环境搭建)
- [项目结构](#项目结构)
- [编码规范](#编码规范)
- [测试](#测试)
- [提交规范](#提交规范)
- [Pull Request 流程](#pull-request-流程)
- [报告问题](#报告问题)

---

## 行为准则

本项目遵循专业和尊重的行为标准。通过参与，您同意：

- 尊重所有贡献者
- 虚心接受建设性批评
- 专注于社区的最佳利益
- 对他人保持同理心

---

## 开始

1. 在 GitHub 上 **Fork** 仓库
2. **克隆** 您的 Fork 到本地
3. 为您的功能或修复 **创建分支**
4. **进行** 您的修改
5. **彻底测试** 您的修改
6. **提交** Pull Request

---

## 开发环境搭建

### 前置要求

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0（Node.js 18+ 自带）

### 安装

```bash
# 克隆您的 Fork
git clone https://github.com/YOUR_USERNAME/bookmarks-manager.git
cd bookmarks-manager

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

应用将在 `http://localhost:5173` 可用。

### 可用脚本

| 命令 | 说明 |
|---------|-------------|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 构建生产版本 |
| `npm run typecheck` | 运行 TypeScript 类型检查 |
| `npm run lint` | 运行 ESLint |
| `npm run lint:fix` | 自动修复 ESLint 问题 |
| `npm run format` | 检查代码格式 |
| `npm run format:fix` | 自动修复代码格式 |
| `npm run test` | 运行测试 |
| `npm run test:watch` | 以监视模式运行测试 |
| `npm run test:coverage` | 运行测试并生成覆盖率报告 |
| `npm run clean` | 清理构建产物 |
| `npm run validate` | 运行类型检查 + 检查 + 测试 |
| `npm run preview` | 预览生产版本 |

---

## 项目结构

```
bookmarks-manager/
├── src/
│   ├── ai/                 # AI 模块
│   │   ├── adapters/       # LLM Provider 适配器
│   │   ├── configService.ts
│   │   ├── promptService.ts
│   │   ├── cacheService.ts
│   │   ├── usageService.ts
│   │   └── aiService.ts
│   ├── cleanup/            # 清理工具
│   ├── constants/          # 应用常量
│   ├── pages/              # 页面组件
│   │   ├── Upload.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Search.tsx
│   │   ├── Duplicates.tsx
│   │   ├── AI.tsx
│   │   └── Backup.tsx
│   ├── store/              # Zustand 状态管理
│   │   ├── useBookmarksStore.ts
│   │   └── useAIStore.ts
│   ├── ui/                 # 可复用 UI 组件
│   ├── utils/              # 工具函数
│   │   ├── bookmarkParser.ts
│   │   ├── db.ts
│   │   ├── exporters/
│   │   ├── folders.ts
│   │   ├── search.ts
│   │   └── url.ts
│   ├── workers/            # Web Workers
│   ├── App.tsx
│   └── main.tsx
├── docs/                   # 文档
├── public/                 # 静态资源
└── tests/                  # 测试文件
```

---

## 编码规范

### TypeScript

- 使用 **严格 TypeScript** 配置
- 为公共函数定义显式返回类型
- 对象形状优先使用 `interface` 而非 `type`
- 有限值集使用联合类型

```typescript
// 好的
interface Bookmark {
  id: string;
  title: string;
  url: string;
}

function parseBookmark(html: string): Bookmark | null;

// 避免
const parseBookmark = (html) => { ... };
```

### React 组件

- 使用 **函数组件** 和 Hooks
- 保持组件聚焦且小巧
- 昂贵渲染使用 `React.memo`
- `useEffect` 中实现正确的清理

```tsx
// 好的
import { useEffect, useCallback } from 'react';

interface Props {
  bookmarks: Bookmark[];
  onSelect: (id: string) => void;
}

export const BookmarkList: React.FC<Props> = React.memo(({ bookmarks, onSelect }) => {
  useEffect(() => {
    // 设置
    return () => {
      // 清理
    };
  }, []);

  const handleClick = useCallback((id: string) => {
    onSelect(id);
  }, [onSelect]);

  return <div>{/* ... */}</div>;
});
```

### 导入

- 项目导入使用 `@/` 路径别名
- 导入分组：React、外部库、内部、相对路径

```typescript
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';

import { useBookmarkStore } from '@/store/useBookmarkStore';
import { SearchInput } from '@/ui/SearchInput';
import { helpers } from './helpers';
```

### 命名规范

| 类型 | 规范 | 示例 |
|------|------------|---------|
| 组件 | PascalCase | `BookmarkList.tsx` |
| 函数 | camelCase | `parseBookmarks` |
| 常量 | UPPER_SNAKE_CASE | `MAX_BOOKMARKS` |
| 类型/接口 | PascalCase | `BookmarkConfig` |
| 文件 | camelCase 或 PascalCase | `bookmarkParser.ts` |

---

## 测试

### 测试结构

```typescript
describe('模块名称', () => {
  describe('函数名称', () => {
    it('应该执行特定的操作', () => {
      // Arrange（准备）
      const input = createTestData();
      
      // Act（执行）
      const result = functionName(input);
      
      // Assert（验证）
      expect(result).toBe(expected);
    });
  });
});
```

### 测试覆盖

- 工具函数目标 **80%+ 覆盖率**
- 测试边界情况和错误场景
- 数据转换使用基于属性的测试

### 运行测试

```bash
# 运行所有测试
npm test

# 运行并生成覆盖率报告
npm run test:coverage

# 监视模式运行
npm run test:watch

# 运行特定测试文件
npx vitest run src/utils/bookmarkParser.test.ts
```

---

## 提交规范

我们遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范。

### 提交消息格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

### 类型

| 类型 | 说明 |
|------|-------------|
| `feat` | 新功能 |
| `fix` | Bug 修复 |
| `docs` | 文档变更 |
| `style` | 代码风格变更（格式化） |
| `refactor` | 代码重构 |
| `perf` | 性能优化 |
| `test` | 添加或更新测试 |
| `chore` | 构建流程或辅助工具变更 |

### 示例

```
feat(bookmark): 添加 Safari 书签格式支持

fix(deduplication): 处理不同协议的 URL

docs(api): 为公共函数添加 JSDoc 注释

refactor(store): 简化书签状态管理

test(parser): 为畸形 HTML 添加边界情况测试
```

---

## Pull Request 流程

1. 如果您的修改影响 API 或行为，**更新文档**
2. 为新功能 **添加测试**
3. **确保所有检查通过**：
   ```bash
   npm run validate
   ```
4. **完整填写 PR 模板**
5. 使用关键字 **关联相关问题**（Fixes #123）
6. 向维护者 **请求审核**

### PR 检查清单

- [ ] 代码符合风格规范
- [ ] 测试已添加/更新并通过
- [ ] 文档已更新
- [ ] 提交消息符合规范
- [ ] PR 描述解释了变更

---

## 报告问题

### Bug 报告

包含以下信息：

1. **浏览器和版本**
2. **复现步骤**
3. **预期行为**
4. **实际行为**
5. **截图**（如适用）
6. **控制台错误**（如有）

### 功能请求

描述：

1. **使用场景** - 您试图解决什么问题？
2. **建议方案** - 它应该如何工作？
3. **替代方案** - 您还考虑过什么？

---

## 开发工作流

### 开始工作前

```bash
# 更新您的 Fork
git checkout master
git pull upstream master

# 创建功能分支
git checkout -b feature/my-feature
```

### 开发过程中

```bash
# 频繁运行检查和测试
npm run lint
npm run test

# 构建检查错误
npm run build
```

### 提交前

```bash
# 确保全部通过
npm run validate

# 格式化代码
npm run format:fix
```

---

## 发布流程

1. 在 `CHANGELOG.md` 中更新新版本
2. 更新 `package.json` 中的版本号
3. 创建 Git 标签：`git tag -a v1.2.0 -m "Release v1.2.0"`
4. 推送标签：`git push origin v1.2.0`
5. GitHub Actions 将自动部署

---

## 有问题？

- 查看[文档](./README.zh-CN.md)
- 提交 [Issue](https://github.com/LessUp/bookmarks-manager/issues)
- 发起 [讨论](https://github.com/LessUp/bookmarks-manager/discussions)

感谢您的贡献！🎉
