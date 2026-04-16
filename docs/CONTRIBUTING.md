# Contributing Guide

> How to contribute to Bookmarks Manager

Thank you for your interest in contributing to Bookmarks Manager! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Reporting Issues](#reporting-issues)

---

## Code of Conduct

This project adheres to a standard of professional and respectful behavior. By participating, you agree to:

- Be respectful to all contributors
- Accept constructive criticism gracefully
- Focus on what's best for the community
- Show empathy towards others

---

## Getting Started

1. **Fork** the repository on GitHub
2. **Clone** your fork locally
3. **Create** a branch for your feature or fix
4. **Make** your changes
5. **Test** your changes thoroughly
6. **Submit** a pull request

---

## Development Setup

### Prerequisites

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0 (comes with Node.js 18+)

### Installation

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/bookmarks-manager.git
cd bookmarks-manager

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint issues automatically |
| `npm run format` | Check code formatting |
| `npm run format:fix` | Fix code formatting automatically |
| `npm run test` | Run tests once |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run clean` | Clean build artifacts |
| `npm run validate` | Run typecheck + lint + test |
| `npm run preview` | Preview production build |

---

## Project Structure

```
bookmarks-manager/
├── src/
│   ├── ai/                 # AI module
│   │   ├── adapters/       # LLM provider adapters
│   │   ├── configService.ts
│   │   ├── promptService.ts
│   │   ├── cacheService.ts
│   │   ├── usageService.ts
│   │   └── aiService.ts
│   ├── cleanup/            # Cleanup utilities
│   ├── constants/          # Application constants
│   ├── pages/              # Page components
│   │   ├── Upload.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Search.tsx
│   │   ├── Duplicates.tsx
│   │   ├── AI.tsx
│   │   └── Backup.tsx
│   ├── store/              # Zustand stores
│   │   ├── useBookmarksStore.ts
│   │   └── useAIStore.ts
│   ├── ui/                 # Reusable UI components
│   ├── utils/              # Utility functions
│   │   ├── bookmarkParser.ts
│   │   ├── db.ts
│   │   ├── exporters/
│   │   ├── folders.ts
│   │   ├── search.ts
│   │   └── url.ts
│   ├── workers/            # Web Workers
│   ├── App.tsx
│   └── main.tsx
├── docs/                   # Documentation
├── public/                 # Static assets
└── tests/                  # Test files
```

---

## Coding Standards

### TypeScript

- Use **strict TypeScript** configuration
- Define explicit return types for public functions
- Prefer `interface` over `type` for object shapes
- Use union types for finite sets of values

```typescript
// Good
interface Bookmark {
  id: string;
  title: string;
  url: string;
}

function parseBookmark(html: string): Bookmark | null;

// Avoid
const parseBookmark = (html) => { ... };
```

### React Components

- Use **functional components** with hooks
- Keep components focused and small
- Use `React.memo` for expensive renders
- Implement proper cleanup in `useEffect`

```tsx
// Good
import { useEffect, useCallback } from 'react';

interface Props {
  bookmarks: Bookmark[];
  onSelect: (id: string) => void;
}

export const BookmarkList: React.FC<Props> = React.memo(({ bookmarks, onSelect }) => {
  useEffect(() => {
    // Setup
    return () => {
      // Cleanup
    };
  }, []);

  const handleClick = useCallback((id: string) => {
    onSelect(id);
  }, [onSelect]);

  return <div>{/* ... */}</div>;
});
```

### Imports

- Use `@/` alias for project imports
- Group imports: React, external libs, internal, relative

```typescript
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';

import { useBookmarkStore } from '@/store/useBookmarkStore';
import { SearchInput } from '@/ui/SearchInput';
import { helpers } from './helpers';
```

### Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `BookmarkList.tsx` |
| Functions | camelCase | `parseBookmarks` |
| Constants | UPPER_SNAKE_CASE | `MAX_BOOKMARKS` |
| Types/Interfaces | PascalCase | `BookmarkConfig` |
| Files | camelCase or PascalCase | `bookmarkParser.ts` |

---

## Testing

### Test Structure

```typescript
describe('Module Name', () => {
  describe('functionName', () => {
    it('should do something specific', () => {
      // Arrange
      const input = createTestData();
      
      // Act
      const result = functionName(input);
      
      // Assert
      expect(result).toBe(expected);
    });
  });
});
```

### Test Coverage

- Aim for **80%+ coverage** on utility functions
- Test edge cases and error scenarios
- Use property-based testing for data transformations

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch

# Run specific test file
npx vitest run src/utils/bookmarkParser.test.ts
```

---

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation changes |
| `style` | Code style changes (formatting) |
| `refactor` | Code refactoring |
| `perf` | Performance improvements |
| `test` | Adding or updating tests |
| `chore` | Build process or auxiliary tool changes |

### Examples

```
feat(bookmark): add support for Safari bookmark format

fix(deduplication): handle URLs with different protocols

docs(api): add JSDoc comments to public functions

refactor(store): simplify bookmark state management

test(parser): add edge case tests for malformed HTML
```

---

## Pull Request Process

1. **Update documentation** if your changes affect the API or behavior
2. **Add tests** for new functionality
3. **Ensure all checks pass**:
   ```bash
   npm run validate
   ```
4. **Fill out the PR template** completely
5. **Link related issues** using keywords (Fixes #123)
6. **Request review** from maintainers

### PR Checklist

- [ ] Code follows the style guidelines
- [ ] Tests added/updated and passing
- [ ] Documentation updated
- [ ] Commit messages follow conventions
- [ ] PR description explains the changes

---

## Reporting Issues

### Bug Reports

Include the following information:

1. **Browser and version**
2. **Steps to reproduce**
3. **Expected behavior**
4. **Actual behavior**
5. **Screenshots** (if applicable)
6. **Console errors** (if any)

### Feature Requests

Describe:

1. **Use case** - What problem are you trying to solve?
2. **Proposed solution** - How should it work?
3. **Alternatives** - What else have you considered?

---

## Development Workflow

### Before Starting Work

```bash
# Update your fork
git checkout master
git pull upstream master

# Create feature branch
git checkout -b feature/my-feature
```

### During Development

```bash
# Run linting and tests frequently
npm run lint
npm run test

# Build to check for errors
npm run build
```

### Before Submitting

```bash
# Ensure everything passes
npm run validate

# Format code
npm run format:fix
```

---

## Release Process

1. Update `CHANGELOG.md` with new version
2. Update version in `package.json`
3. Create git tag: `git tag -a v1.2.0 -m "Release v1.2.0"`
4. Push tag: `git push origin v1.2.0`
5. GitHub Actions will deploy automatically

---

## Questions?

- Check the [documentation](./README.md)
- Open an [issue](https://github.com/LessUp/bookmarks-manager/issues)
- Start a [discussion](https://github.com/LessUp/bookmarks-manager/discussions)

Thank you for contributing! 🎉
