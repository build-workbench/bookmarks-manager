import { Routes, Route, Navigate, NavLink, Link, useLocation } from 'react-router-dom'
import { useEffect, Suspense, lazy } from 'react'
import { AlertCircle } from 'lucide-react'
import useBookmarksStore from '@/store/useBookmarksStore'
import { LazyErrorBoundary } from '@/ui/ErrorBoundary'

const LandingPage = lazy(() => import('@/pages/LandingPage'))
const UploadMerge = lazy(() => import('@/pages/UploadMerge'))
const Dashboard = lazy(() => import('@/pages/Dashboard'))
const Search = lazy(() => import('@/pages/Search'))
const Duplicates = lazy(() => import('@/pages/Duplicates'))
const AI = lazy(() => import('@/pages/AI'))
const Cleanup = lazy(() => import('@/pages/Cleanup'))
const Backup = lazy(() => import('@/pages/Backup'))

const appLinks = [
  { to: '/app/upload', label: '上传合并' },
  { to: '/app/dashboard', label: '仪表盘' },
  { to: '/app/search', label: '搜索' },
  { to: '/app/duplicates', label: '去重' },
  { to: '/app/cleanup', label: '整理' },
  { to: '/app/ai', label: 'AI' },
  { to: '/app/backup', label: '备份' }
]

function AppHeader() {
  const { needsMerge } = useBookmarksStore()

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
          <Link
            to="/"
            className="flex items-center gap-2 font-semibold text-white transition-colors hover:text-sky-400"
          >
            <span>Bookmarks Manager</span>
          </Link>
          <nav className="flex gap-1 overflow-x-auto text-sm" aria-label="主导航">
            {appLinks.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded px-3 py-2 transition-colors ${
                    isActive
                      ? 'bg-sky-600 text-white'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      {needsMerge && (
        <div className="border-b border-amber-500/30 bg-amber-500/10 text-amber-300" role="alert">
          <div className="mx-auto flex max-w-6xl items-start gap-2 px-4 py-2 text-sm">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
            <div className="flex-1">
              当前导入会话已变更，旧的统计、搜索结果和导出内容已失效。请前往“上传合并”重新合并去重。
            </div>
            <NavLink
              to="/app/upload"
              className="rounded bg-amber-500/20 px-3 py-1 transition hover:bg-amber-500/30"
            >
              去合并
            </NavLink>
          </div>
        </div>
      )}
    </>
  )
}

function AppContent() {
  const { loadFromDB } = useBookmarksStore()

  useEffect(() => {
    void loadFromDB()
  }, [loadFromDB])

  return (
    <div className="min-h-screen bg-slate-950">
      <AppHeader />
      <main className="mx-auto max-w-6xl px-4 py-6">
        <LazyErrorBoundary>
          <Suspense
            fallback={
              <div
                className="flex items-center justify-center gap-2 py-20 text-sm text-slate-400"
                role="status"
                aria-live="polite"
              >
                <div
                  className="h-4 w-4 animate-spin rounded-full border-2 border-sky-400 border-t-transparent"
                  aria-hidden="true"
                />
                <span>页面加载中...</span>
              </div>
            }
          >
            <Routes>
              <Route path="/app" element={<Navigate to="/app/upload" replace />} />
              <Route path="/app/upload" element={<UploadMerge />} />
              <Route path="/app/dashboard" element={<Dashboard />} />
              <Route path="/app/search" element={<Search />} />
              <Route path="/app/duplicates" element={<Duplicates />} />
              <Route path="/app/cleanup" element={<Cleanup />} />
              <Route path="/app/ai" element={<AI />} />
              <Route path="/app/backup" element={<Backup />} />
            </Routes>
          </Suspense>
        </LazyErrorBoundary>
      </main>
    </div>
  )
}

function LegacyRedirectHandler() {
  const location = useLocation()

  useEffect(() => {
    const hash = window.location.hash
    if (hash && hash !== '#/' && !hash.startsWith('#/app/')) {
      const oldPath = hash.replace('#/', '')
      window.location.hash = `#/app${oldPath.startsWith('/') ? oldPath : `/${oldPath}`}`
    }
  }, [location])

  return null
}

export default function App() {
  return (
    <>
      <LegacyRedirectHandler />
      <Routes>
        <Route
          path="/"
          element={
            <Suspense
              fallback={
                <div className="flex min-h-screen items-center justify-center bg-slate-950">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-400 border-t-transparent" />
                </div>
              }
            >
              <LandingPage />
            </Suspense>
          }
        />
        <Route path="/app/*" element={<AppContent />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
