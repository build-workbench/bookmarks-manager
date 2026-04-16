# Bookmarks Manager Documentation

> Complete documentation for users and developers

Welcome to the Bookmarks Manager documentation! This directory contains comprehensive guides for using and contributing to the project.

## Quick Navigation

### For Users

| Document | Description |
|----------|-------------|
| [User Guide](../QUICKSTART.md) | Step-by-step usage guide |
| [Features](../FEATURES.md) | Detailed feature documentation |

### For Developers

| Document | Description |
|----------|-------------|
| [Architecture](ARCHITECTURE.md) | System architecture and design |
| [API Reference](API.md) | Module interfaces and functions |
| [Contributing](CONTRIBUTING.md) | Contribution guidelines |
| [Requirements (PRD)](PRD.md) | Product requirements and roadmap |

### Language Versions

All documentation is available in both English and Chinese:

- English (本文档)
- [简体中文](README.zh-CN.md)

---

## Documentation Structure

```
docs/
├── README.md                 # This file (EN)
├── README.zh-CN.md           # Documentation index (中文)
├── PRD.md                    # Product Requirements (EN)
├── PRD.zh-CN.md              # 产品需求文档 (中文)
├── ARCHITECTURE.md           # Architecture (EN)
├── ARCHITECTURE.zh-CN.md     # 架构文档 (中文)
├── API.md                    # API Reference (EN)
├── API.zh-CN.md              # API 参考 (中文)
├── CONTRIBUTING.md           # Contributing Guide (EN)
└── CONTRIBUTING.zh-CN.md     # 贡献指南 (中文)
```

---

## Getting Started

### New Users

1. Open the [online app](https://lessup.github.io/bookmarks-manager/)
2. Export bookmarks from your browser
3. Import and merge them
4. Explore the dashboard and search features

See [QUICKSTART.md](../QUICKSTART.md) for detailed instructions.

### Developers

```bash
# Clone the repository
git clone https://github.com/LessUp/bookmarks-manager.git
cd bookmarks-manager

# Install dependencies
npm install

# Start development server
npm run dev
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines.

---

## Key Concepts

### Privacy-First Design

All processing happens in your browser:
- No server uploads
- No data tracking
- Your bookmarks never leave your device

### Local-First Architecture

- IndexedDB for persistence
- Works offline after first load
- Data under your control

### BYOK for AI

Bring Your Own Key:
- Use your OpenAI, Claude, or custom API key
- Keys stored locally only
- Pay only for what you use

---

## Feature Highlights

### Core Features
- 📥 Multi-browser bookmark import
- 🔗 Intelligent deduplication
- 🔍 Full-text search
- 📊 Statistics and visualizations
- 💾 Automatic local persistence

### AI-Powered Features (Optional)
- 🤖 Automatic categorization
- 📝 Content summarization
- 🔍 Natural language search
- 📈 Collection insights

### Export Options
- HTML (browser-compatible)
- JSON (structured data)
- CSV (spreadsheet-friendly)
- Markdown (documentation)

---

## Project Status

**Current Version**: v1.1.0  
**Status**: ✅ Active Development

See [CHANGELOG.md](../CHANGELOG.md) for version history.

---

## Contributing

We welcome contributions! Please see:
- [Contributing Guide](CONTRIBUTING.md) - How to contribute
- [Architecture](ARCHITECTURE.md) - System design
- [API Reference](API.md) - Module interfaces

---

## Support

- 🐛 [Report Issues](https://github.com/LessUp/bookmarks-manager/issues)
- 💬 [Discussions](https://github.com/LessUp/bookmarks-manager/discussions)
- 📧 Email: [issues on GitHub preferred]

---

## License

MIT License - See [LICENSE](../LICENSE) for details.

---

<p align="center">
  <a href="../README.md">← Back to Main README</a>
</p>
