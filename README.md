# Bookmarks Manager

<p align="center">
  <b>Merge, deduplicate, and analyze your browser bookmarks — privately and locally.</b>
</p>

<p align="center">
  <a href="https://lessup.github.io/bookmarks-manager/">
    <img src="https://img.shields.io/badge/🚀_Try_Online_Now-2ea44f?style=for-the-badge&logoColor=white" alt="Try Online">
  </a>
</p>

<p align="center">
  <a href="https://github.com/LessUp/bookmarks-manager/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/LessUp/bookmarks-manager/ci.yml?label=CI" alt="CI"></a>
  <a href="https://github.com/LessUp/bookmarks-manager/actions/workflows/pages.yml"><img src="https://img.shields.io/github/actions/workflow/status/LessUp/bookmarks-manager/pages.yml?label=Deploy" alt="Deploy"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License: MIT"></a>
</p>

<p align="center">
  English | <a href="README.zh-CN.md">简体中文</a>
</p>

---

## 🎯 What is this?

A **privacy-first, browser-based tool** that helps you:

- 📥 **Import** bookmarks from multiple browsers (Chrome, Firefox, Edge, Safari)
- 🔗 **Merge** them into one unified collection
- 🧹 **Remove duplicates** intelligently 
- 🔍 **Search** instantly with full-text search
- 📊 **Visualize** your bookmark habits
- 🤖 **Analyze** with AI (bring your own API key)

**All processing happens in your browser.** No data ever leaves your device.

---

## 🚀 Quick Start

### Option 1: Use Online (Recommended)

👉 **[Click here to open the app](https://lessup.github.io/bookmarks-manager/)**

No installation required. Works offline after first load (PWA).

### Option 2: Install as Desktop App

After opening the online version:

| Browser | Instructions |
|---------|-------------|
| Chrome/Edge | Click `⋮` → "Install Bookmarks Manager" |
| Safari | Share → "Add to Home Screen" |
| Firefox | Currently limited PWA support |

### Option 3: Run Locally

```bash
git clone https://github.com/LessUp/bookmarks-manager.git
cd bookmarks-manager
npm install
npm run dev
# Open http://localhost:5173
```

---

## 📖 How to Use

### 1. Export Bookmarks from Your Browser

**Chrome / Edge / Brave:**
1. Press `Ctrl+Shift+O` (Windows) or `Cmd+Shift+O` (Mac)
2. Click `⋮` menu → "Export bookmarks"
3. Save the HTML file

**Firefox:**
1. Press `Ctrl+Shift+B` (Windows) or `Cmd+Shift+B` (Mac)
2. Click "Import and Backup" → "Export Bookmarks to HTML"

**Safari:**
1. File → "Export Bookmarks"

### 2. Import & Merge

1. Open the [app](https://lessup.github.io/bookmarks-manager/)
2. Drag and drop your bookmark file(s) into the upload area
3. Click "Merge & Deduplicate"
4. Watch the magic happen ✨

### 3. Explore Your Bookmarks

- **Dashboard** — View stats, charts, and trends
- **Search** — Find bookmarks with instant full-text search
- **Duplicates** — Review what was deduplicated
- **Export** — Download clean bookmarks back to your browser

---

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| 🔒 **100% Private** | Everything runs locally in your browser. No server, no uploads, no tracking. |
| 🔗 **Smart Deduplication** | URL normalization removes true duplicates (handles http/https, trailing slashes, tracking params) |
| 📥 **Multi-Browser** | Merge bookmarks from Chrome, Firefox, Edge, Safari in one go |
| 🔍 **Full-Text Search** | Search across titles, URLs, and folder names with instant results |
| 📊 **Visual Insights** | See your bookmark patterns: top domains, yearly trends, duplicates ratio |
| 💾 **Auto-Save** | Data persists in browser storage — close the tab and come back later |
| 🤖 **AI Analysis** | Optional AI features (BYOK) for categorization, summarization, and insights |
| 📱 **PWA Support** | Install as a desktop/mobile app, works offline |

---

## 🔒 Privacy & Security

Your bookmarks are precious. We take privacy seriously:

- ✅ **Zero Cloud** — No backend server, no database
- ✅ **Local Processing** — All parsing, merging, and analysis happens in your browser
- ✅ **No Uploads** — Your bookmarks never leave your device
- ✅ **Secure Storage** — Data stored in browser's IndexedDB (your control)
- ✅ **Open Source** — Full transparency. Inspect the code yourself.

**AI Features (Optional):**
- Uses your own API key (BYOK — Bring Your Own Key)
- API keys stored locally in your browser
- Can be used entirely offline without AI

---

## 🛠️ For Developers

Want to contribute or self-host? Check out:

- [QUICKSTART.md](QUICKSTART.md) — Detailed development setup
- [FEATURES.md](FEATURES.md) — Full feature documentation
- [docs/](docs/) — Architecture and design docs

```bash
# Development
npm install
npm run dev

# Build
npm run build

# Test
npm run test
```

**Tech Stack:** React 18 + TypeScript + Vite + Tailwind CSS + Dexie (IndexedDB) + ECharts

---

## 📸 Screenshots

### Dashboard
![Dashboard Preview](screenshots/dashboard.svg)
*Visual analytics showing bookmark distribution, yearly trends, and duplicate statistics.*

### Search & Deduplication
![Search Preview](screenshots/search.svg)
*Instant full-text search across titles, URLs, and folders with duplicate detection.*

### AI Analysis
![AI Preview](screenshots/ai-analysis.svg)
*AI-powered categorization, link health checking, and natural language bookmark search.*

> 💡 **Want to see it in action?** [Try the live demo](https://lessup.github.io/bookmarks-manager/)

---

## 📄 License

[MIT License](LICENSE) — Free for personal and commercial use.

---

<p align="center">
  <sub>Built with ❤️ for bookmark hoarders everywhere</sub>
</p>
